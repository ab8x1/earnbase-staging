import { google } from 'googleapis';
import getDataFromApi from './getDataFromAPi';

export type poolInfoType = {
  vault: string;
  network: string;
  platform: string;
  productName: string;
  poolId: string;
  readApyBase: boolean;
  productLink: string;
  sponsored?: boolean;
  tokenAddress?: string;
}[];

type apyDataType = {
  timestamp: string;
  tvlUsd: number | null;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
  il7d: number | null;
  apyBase7d: number | null;
}[];

type apyInfoType = {
  spotApy: number;
  spotApyAlternative?: number;
  weeklyApy: number;
  weeklyApyAlternative?: number;
  monthlyApy: number;
  monthlyApyAlternative?: number;
  lifeTimeApy: number;
  operatingSince: number;
};

export type poolInfoDataType = {
  poolId: string;
  network: string;
  vault: string;
  platform: string;
  productName: string;
  productLink: string;
  tvl: number;
  tvlAlternative?: number;
  sponsored?: boolean;
} & apyInfoType;

export type poolsInfoDataType = poolInfoDataType[];

export type Chain = 'Mainnet' | 'Base' | 'Arbitrum' | 'BNB' | 'Sonic' | 'Avalanche' | null;

export type poolsInfoType = {
  updatedAt: string;
  indexData: poolsInfoDataType;
};

export async function getGoogleSheetsData(ranges: string[]) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    ranges,
  });
  return response?.data?.valueRanges;
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function formatPoolData(rawData: any[][]) {
  const formatedData: poolInfoType = rawData.map(
    ([
      vault,
      network,
      platform,
      productName,
      poolId,
      readApyBase,
      productLink,
      isSponsored,
      tokenAddress,
    ]) => ({
      vault: (vault as string) || '',
      network: (network as string) || '',
      platform: (platform as string) || '',
      productName: (productName as string) || '',
      poolId: (poolId as string) || '',
      readApyBase: !!readApyBase,
      productLink: (productLink as string) || '',
      sponsored: !!isSponsored,
      tokenAddress: tokenAddress ? (tokenAddress as string) : undefined,
    })
  );
  return formatedData;
}

export async function getPoolApyData(poolInfo: poolInfoType) {
  try {
    const poolApyInfo: poolsInfoDataType = [];
    for (const platformData of poolInfo) {
      const {
        poolId,
        readApyBase,
        vault,
        platform,
        productLink,
        productName,
        network,
        sponsored,
        tokenAddress,
      } = platformData;
      const rawApyData = await fetch(`https://yields.llama.fi/chart/${poolId}`);
      const rawApyDataJson = await rawApyData.json();
      const apyData: apyDataType = rawApyDataJson?.data || [];
      const newestData = apyData.slice(-1)[0];
      const spotApy = Number((readApyBase ? newestData?.apyBase : newestData?.apy) || 0);
      const weeklyApy =
        (apyData.slice(-7).reduce((acc, { apy, apyBase }) => {
          const apyNumber = Number(readApyBase ? apyBase : apy) || 0;
          return acc + apyNumber;
        }, 0) || 0) / 7;
      const monthlyApy =
        (apyData.slice(-30).reduce((acc, { apy, apyBase }) => {
          const apyNumber = Number(readApyBase ? apyBase : apy) || 0;
          return acc + apyNumber;
        }, 0) || 0) / 30;
      const lifeTimeApy =
        (apyData.reduce((acc, { apy, apyBase }) => {
          const apyNumber = Number(readApyBase ? apyBase : apy) || 0;
          return acc + apyNumber;
        }, 0) || 0) /
        (apyData.length - 1);
      const oldestData = apyData[0];
      const operatingSince = new Date(oldestData?.timestamp?.slice(0, 10))?.getTime() || 0;
      const tvl = newestData.tvlUsd || 0;
      let spotApyAlternative: number | undefined;
      let weeklyApyAlternative: number | undefined;
      let monthlyApyAlternative: number | undefined;
      let tvlAlternative: number | undefined;
      if (tokenAddress) {
        const dataFromApi = await getDataFromApi(platform, tokenAddress, network, vault);
        if (dataFromApi) {
          spotApyAlternative = dataFromApi.spotApy;
          weeklyApyAlternative = dataFromApi.weeklyApy;
          monthlyApyAlternative = dataFromApi.monthlyApy;
          tvlAlternative = dataFromApi.tvl;
        }
      }
      poolApyInfo.push({
        poolId,
        network,
        vault,
        platform,
        productName,
        productLink,
        spotApy,
        spotApyAlternative,
        weeklyApy,
        weeklyApyAlternative,
        monthlyApy,
        monthlyApyAlternative,
        lifeTimeApy,
        operatingSince,
        tvl,
        tvlAlternative,
        sponsored,
      });
    }
    return poolApyInfo;
  } catch (e) {
    console.log('Error in getPoolApyData in getPropsHelpers');
    console.log(e);
    return [];
  }
}

export function getNextFullHourTimestamp() {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return nextHour.getTime();
}
