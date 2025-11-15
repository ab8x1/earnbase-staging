type IporData = {
  spotApy: number;
  weeklyApy: number;
  monthlyApy: number;
  tvl: number;
};

type IporDataApi = {
    blockNumber: number,
    blockTimestamp: string,
    totalBalance: string,
    tvl: string,
    marketBalances: any[],
    dexPositionBalances: any[],
    apr: string,
    apy: string,
    apr1d: string,
    rewardsApr: string,
    rewardsApy: string,
    assetsToSharesRatio: string
};

function splitByTimeframes(items: IporDataApi[]) {
  const now = Math.floor(Date.now() / 1000);

  const cutoff24h = now - 24 * 60 * 60;
  const cutoff7d = now - 7 * 24 * 60 * 60;
  const cutoff30d = now - 30 * 24 * 60 * 60;

  const last24h: IporDataApi[] = [];
  const last7days: IporDataApi[] = [];
  const last30days: IporDataApi[] = [];

  if (items?.length > 0) {
    // items: oldest → newest
    // iterate from the end so we can break once < 30d
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];

      const ts = Math.floor(new Date(item.blockTimestamp).getTime() / 1000);

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

export default async function getDataFromIPOR(address: string, chainId: number): Promise<IporData | null> {
  try{
  const res = await fetch(`https://api.ipor.io/fusion/vaults-history/${chainId}/${address}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`IPOR API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message || 'Unknown IPOR error');
  }

  if(json?.history?.length > 0){
    const iporHisotry: IporDataApi[] = json.history;
    const { last24h, last7days, last30days } = splitByTimeframes(iporHisotry);
    const spotApy = last24h.reduce(
        (acc: number, history: IporDataApi) => acc + (Number(history.apy) || 0),
        0
    ) / last24h.length || 1;
    const weeklyApy = last7days.reduce(
        (acc: number, history: IporDataApi) => acc + (Number(history.apy) || 0),
        0
    ) / last7days.length || 1;
    const monthlyApy = last30days.reduce(
        (acc: number, history: IporDataApi) => acc + (Number(history.apy) || 0),
        0
    ) / last30days.length || 1;
    const newestVaultStatus = iporHisotry.slice(-1)[0];
    const tvl = Number(newestVaultStatus.tvl);
    return {
        spotApy: spotApy,
        weeklyApy: weeklyApy,
        monthlyApy: monthlyApy,
        tvl
    }
  }
  } catch(e){
    console.log(e);
    return null;
  }
  return null;
}
