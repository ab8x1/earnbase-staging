import ChainId from "./data/ChainId";
import getLatestAPRAndMetadataFromAlchemy from "./getLatestAPRAndMetadataFromAlchemy";

function aprToApyPercent(aprPercent: number): number {
  const days = 365;

  const aprDecimal = aprPercent / 100;
  const apyDecimal = Math.pow(1 + aprDecimal / days, days) - 1;

  return apyDecimal * 100; // return APY as percent
}

export default async function getDataFromVision(tokenAddress: string, chainId: ChainId){
    try{
        const vaultData = await getLatestAPRAndMetadataFromAlchemy(tokenAddress, chainId);
        const tvlVision = vaultData.data[0]?.tvl;
        let spotApyVision = Number(vaultData?.data?.[0]?.apr?.['1d']) || undefined;
        if (spotApyVision) aprToApyPercent(spotApyVision);
        let weeklyApyVision = Number(vaultData?.data?.[0]?.apr?.['7d']) || undefined;
        if (weeklyApyVision) aprToApyPercent(weeklyApyVision);
        let monthlyApyVision = Number(vaultData?.data?.[0]?.apr?.['30d']) || undefined;
        if (monthlyApyVision) aprToApyPercent(monthlyApyVision);
        return{
            tvl: tvlVision,
            spotApy: spotApyVision,
            weeklyApy: weeklyApyVision,
            monthlyApy: monthlyApyVision
        }
    }   
    catch(e){
        console.log("Failed to get vision data");
        console.log(e);
        return null;
    } 
     
}