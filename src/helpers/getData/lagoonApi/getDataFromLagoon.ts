type LagoonData = {
  spotApy: number;    // 24h
  weeklyApy: number;  // 7d
  monthlyApy: number; // 30d
  tvl: number;
};

type PeriodSummary = {
  id: string;
  timestamp: string; // blockTimestamp
  totalAssetsAtEnd: string;
  netTotalSupplyAtEnd: string;
};

const graphUrl: { [key: number]: string } = {
  1: 'https://api.goldsky.com/api/public/project_cmbrqvox367cy01y96gi91bis/subgraphs/lagoon-mainnet-vault/prod/gn',
  8453: 'https://api.goldsky.com/api/public/project_cmbrqvox367cy01y96gi91bis/subgraphs/lagoon-base-vault/prod/gn',
  43114: 'https://api.goldsky.com/api/public/project_cmbrqvox367cy01y96gi91bis/subgraphs/lagoon-avalanche-vault/prod/gn',
  42161: 'https://api.goldsky.com/api/public/project_cmbrqvox367cy01y96gi91bis/subgraphs/lagoon-arbitrum-vault/prod/gn',
};

const SECONDS_IN_DAY = 24 * 60 * 60;
const SECONDS_IN_YEAR = 365 * SECONDS_IN_DAY;
const MATH_PRECISION = BigInt("1000000000000000000"); // 1e18

/**
 * Oblicza cenę udziału (Share Price).
 * Wzór: (Assets * 1e18) / Supply
 * Używamy BigInt, aby nie stracić precyzji na 18 miejscu po przecinku.
 */
const calculateSharePrice = (assets: string, supply: string): number => {
  try {
    const assetsBI = BigInt(assets);
    const supplyBI = BigInt(supply);

    if (supplyBI === BigInt(0)) return 0;

    // Skalujemy wynik do góry, dzielimy całkowicie, a potem wracamy do float
    const priceScaled = (assetsBI * MATH_PRECISION) / supplyBI;
    return Number(priceScaled) / Number(MATH_PRECISION);
  } catch (e) {
    return 0;
  }
};

/**
 * Oblicza roczne APY.
 * Jeśli wynik jest ujemny (bardzo rzadkie przypadki straty strategii), zwracamy 0,
 * chyba że chcesz pokazywać straty.
 */
const calculateAPY = (priceNew: number, priceOld: number, timeDiffSeconds: number): number => {
  if (priceOld === 0 || timeDiffSeconds === 0) return 0;

  const growth = (priceNew / priceOld) - 1;

  // Jeśli różnica czasu jest zbyt mała (np. < 6h), ekstrapolacja daje ogromne błędy.
  // Ignorujemy dane, jeśli okres jest krótszy niż 6h dla obliczeń rocznych.
  if (timeDiffSeconds < (6 * 60 * 60)) return 0;

  const annualized = growth * (SECONDS_IN_YEAR / timeDiffSeconds);

  // Zwracamy wynik w procentach. Jeśli ujemny -> 0 (chyba że chcesz widzieć straty)
  return annualized < 0 ? 0 : annualized * 100;
};

export default async function getDataFromLagoon(
  address: string,
  chainId: number,
  decimals: number = 18
): Promise<LagoonData | null> {
  try {
    // WRACAMY DO periodSummaries (bo dailyVaultSnapshots nie istnieje w tym schemacie)
    const VAULT_HISTORY_QUERY = `
      query GetVaultHistory($vaultId: String!, $first: Int!) {
        periodSummaries(
          first: $first
          orderBy: blockTimestamp
          orderDirection: desc
          where: { vault: $vaultId }
        ) {
          timestamp: blockTimestamp
          totalAssetsAtEnd
          netTotalSupplyAtEnd
        }
      }
    `;

    if (!graphUrl[chainId]) {
      console.error(`Chain ID ${chainId} not supported`);
      return null;
    }

    const res = await fetch(graphUrl[chainId], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: VAULT_HISTORY_QUERY,
        variables: {
          vaultId: address.toLowerCase(),
          first: 1000, // Pobieramy dużą historię, żeby znaleźć punkty w czasie
        },
      }),
    });

    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);

    const history: PeriodSummary[] = json.data?.periodSummaries || [];

    if (history.length < 1) return null;

    // --- 1. Punkt TERAZ ---
    const latestRecord = history[0];
    const latestTime = parseInt(latestRecord.timestamp);
    const latestPrice = calculateSharePrice(latestRecord.totalAssetsAtEnd, latestRecord.netTotalSupplyAtEnd);

    // TVL
    const tvl = parseFloat(latestRecord.totalAssetsAtEnd) / Math.pow(10, decimals);

    // --- 2. Logika szukania punktów w czasie ---

    // Funkcja znajduje wpis, który jest NAJBLIŻSZY oczekiwanej dacie WSTECZ.
    // Nie bierzemy po prostu "indexu", tylko szukamy timestampu.
    const findClosestRecord = (targetSecondsAgo: number) => {
       const targetTimestamp = latestTime - targetSecondsAgo;

       // Tablica jest posortowana malejąco (Najnowsze -> Najstarsze).
       // Szukamy pierwszego rekordu, który jest STARSZY lub równy targetTimestamp.
       return history.find(item => parseInt(item.timestamp) <= targetTimestamp);
    };

    const record24h = findClosestRecord(SECONDS_IN_DAY);
    const record7d  = findClosestRecord(7 * SECONDS_IN_DAY);
    const record30d = findClosestRecord(30 * SECONDS_IN_DAY);

    // --- 3. Obliczenia APY ---

    const spotApy = record24h
      ? calculateAPY(
          latestPrice,
          calculateSharePrice(record24h.totalAssetsAtEnd, record24h.netTotalSupplyAtEnd),
          latestTime - parseInt(record24h.timestamp)
        )
      : 0;

    const weeklyApy = record7d
      ? calculateAPY(
          latestPrice,
          calculateSharePrice(record7d.totalAssetsAtEnd, record7d.netTotalSupplyAtEnd),
          latestTime - parseInt(record7d.timestamp)
        )
      : 0;

    const monthlyApy = record30d
      ? calculateAPY(
          latestPrice,
          calculateSharePrice(record30d.totalAssetsAtEnd, record30d.netTotalSupplyAtEnd),
          latestTime - parseInt(record30d.timestamp)
        )
      : 0;

    return {
      spotApy, // 24h
      weeklyApy, // 7d
      monthlyApy, // 30d
      tvl: isNaN(tvl) ? 0 : tvl,
    };

  } catch (e) {
    console.error('Lagoon Error:', e);
    return null;
  }
}