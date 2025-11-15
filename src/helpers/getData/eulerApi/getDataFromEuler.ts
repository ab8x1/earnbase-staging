type EulerData = {
  spotApy: number;
  weeklyApy: number;
  monthlyApy: number;
  tvl: number;
};

type EulerValtStauts = {
    totalBorrows: string,
    accumulatedFees: string,
    cash: string,
    supplyApy: string,
    timestamp: string
}

const qrpahUrl: {
  [key: string]: string;
} = {
  1: 'https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-mainnet/latest/gn',
  8453: 'https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-base/latest/gn',
  146: 'https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-sonic/latest/gn',
  56: 'https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-bsc/latest/gn',
  43114:
    'https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-avalanche/latest/gn',
  42161:
    'https://api.goldsky.com/api/public/project_cm4iagnemt1wp01xn4gh1agft/subgraphs/euler-v2-arbitrum/latest/gn',
};

function splitByTimeframes(items: EulerValtStauts[]) {
  const now = Math.floor(Date.now() / 1000);

  const cutoff24h = now - 24 * 60 * 60;
  const cutoff7d = now - 7 * 24 * 60 * 60;
  const cutoff30d = now - 30 * 24 * 60 * 60;

  const last24h: EulerValtStauts[] = [];
  const last7days: EulerValtStauts[] = [];
  const last30days: EulerValtStauts[] = [];

  if (items?.length > 0) {
    for (const item of items) {
      const ts = Number(item?.timestamp);

      if (ts < cutoff30d) break;

      if (ts >= cutoff24h) {
        last24h.push(item);
      }
      if (ts >= cutoff7d) {
        last7days.push(item);
      }
      if (ts >= cutoff30d) {
        last30days.push(item);
      }
    }
  }

  return { last24h, last7days, last30days };
}

export default async function getDataFromEuler(address: string, chainId: number): Promise<EulerData | null> {
  const query = `
    query VaultStateHistory($address: ID!) {
        vaultStatuses(
            where: { vault: $address }
            orderBy: timestamp
            orderDirection: desc
        ) {
            totalBorrows
            accumulatedFees
            cash
            supplyApy
            timestamp
        }
    }
    `;

  const res = await fetch(qrpahUrl[chainId], {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { address, chainId },
    }),
  });

  if (!res.ok) {
    throw new Error(`Morpho API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message || 'Unknown GraphQL error');
  }

  if(json?.data?.vaultStatuses?.length > 0){
    const vaultStatuses: EulerValtStauts[] = json?.data?.vaultStatuses;
    const { last24h, last7days, last30days } = splitByTimeframes(vaultStatuses);
    const spotApy = last24h.reduce(
        (acc: number, history: EulerValtStauts) => acc + (Number(history.supplyApy) || 0),
        0
    ) / last24h.length || 1;
    const weeklyApy = last7days.reduce(
        (acc: number, history: EulerValtStauts) => acc + (Number(history.supplyApy) || 0),
        0
    ) / last7days.length || 1;
    const monthlyApy = last30days.reduce(
        (acc: number, history: EulerValtStauts) => acc + (Number(history.supplyApy) || 0),
        0
    ) / last30days.length || 1;
    const newestVaultStatus = vaultStatuses[0];
    const tvl = Number(newestVaultStatus.cash) + Number(newestVaultStatus.totalBorrows) - Number(newestVaultStatus.accumulatedFees);
    return {
        spotApy: spotApy * (10 ** -25),
        weeklyApy: weeklyApy * (10 ** -25),
        monthlyApy: monthlyApy * (10 ** -25),
        tvl
    }
  }
  else{
    return null;
  }

}
