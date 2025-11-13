import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import UpdateStatistic, { UpdateStatistics } from '../../../../lib/models/UpdateStatistics';
import Pool from '../../../../lib/models/Pool';
import {
  formatPoolData,
  getPoolApyData,
  getNextFullHourTimestamp,
  getGoogleSheetsData,
} from '@/helpers/getData/getPropsHelpers';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ revalidated: false, error: 'Invalid secret' }, { status: 401 });
  }

  try {
    await dbConnect();
    const lastStats: UpdateStatistics | null = await UpdateStatistic.findOne();
    if (!lastStats) throw new Error("Can't read last statistics");
    const { startUpdateFromIndex, updateAfter } = lastStats;
    if (Date.now() > updateAfter) {
      const chainsData = await getGoogleSheetsData([
        'USDC.Mainnet!A2:I',
        'USDC.Arbitrum!A2:I',
        'USDC.Base!A2:I',
        'USDC.BNB!A2:I',
        'USDC.Sonic!A2:I',
        'USDC.Avalanche!A2:I',
        'USDT.Mainnet!A2:I',
        'ETH.Mainnet!A2:I',
        'ETH.Base!A2:I',
        'EURC.Mainnet!A2:I',
        'EURC.Base!A2:I',
        'EURC.Avalanche!A2:I',
        'WBTC.Mainnet!A2:I',
        'WBTC.Arbitrum!A2:I',
        'cbBTC.Mainnet!A2:I',
        'cbBTC.Base!A2:I',
      ]);
      const rawDataUSDCMainnet = chainsData?.[0]?.values || [];
      const rawDataUSDCArbitrum = chainsData?.[1]?.values || [];
      const rawDataUSDCBase = chainsData?.[2]?.values || [];
      const rawDataUSDCBNB = chainsData?.[3]?.values || [];
      const rawDataUSDCSonic = chainsData?.[4]?.values || [];
      const rawDataUSDCAvalanche = chainsData?.[5]?.values || [];
      const rawDataUSDTMainnet = chainsData?.[6]?.values || [];
      const rawDataETHMainnet = chainsData?.[7]?.values || [];
      const rawDataETHBase = chainsData?.[8]?.values || [];
      const rawDataEURCMainnet = chainsData?.[9]?.values || [];
      const rawDataEURCBase = chainsData?.[10]?.values || [];
      const rawDataEURCAvalanche = chainsData?.[11]?.values || [];
      const rawDataWBTCMainnet = chainsData?.[12]?.values || [];
      const rawDataWBTCArbitrum = chainsData?.[13]?.values || [];
      const rawDataCBBTCMainnet = chainsData?.[14]?.values || [];
      const rawDataCBBTCBase = chainsData?.[15]?.values || [];
      const allChains = formatPoolData([
        ...rawDataUSDCMainnet,
        ...rawDataUSDCBase,
        ...rawDataUSDCArbitrum,
        ...rawDataUSDCBNB,
        ...rawDataUSDCSonic,
        ...rawDataUSDTMainnet,
        ...rawDataETHMainnet,
        ...rawDataETHBase,
        ...rawDataUSDCAvalanche,
        ...rawDataEURCMainnet,
        ...rawDataEURCBase,
        ...rawDataEURCAvalanche,
        ...rawDataWBTCMainnet,
        ...rawDataWBTCArbitrum,
        ...rawDataCBBTCMainnet,
        ...rawDataCBBTCBase,
      ]);
      const range =
        startUpdateFromIndex + 10 >= allChains.length
          ? allChains.length
          : startUpdateFromIndex + 10;
      const poolsToUpdate = allChains.slice(startUpdateFromIndex, range);
      const poolsInfo = await getPoolApyData(poolsToUpdate);
      const idsToUpdate =
        (await Pool.find().skip(startUpdateFromIndex).limit(range).select('_id')) || [];
      const bulkOps = poolsInfo.map((poolInfo, i) => {
        if (idsToUpdate[i])
          return {
            updateOne: {
              filter: { _id: idsToUpdate[i] },
              update: { $set: poolInfo },
            },
          };
        else
          return {
            insertOne: {
              document: poolInfo,
            },
          };
      });
      await Pool.bulkWrite(bulkOps);
      await UpdateStatistic.updateOne(
        { _id: lastStats._id },
        {
          startUpdateFromIndex: range === allChains.length ? 0 : range,
          updateAfter: range === allChains.length ? getNextFullHourTimestamp() : updateAfter,
        }
      );
    }
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse(null, { status: 500 });
  }
}
