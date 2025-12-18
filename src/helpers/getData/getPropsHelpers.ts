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

// type apyDataType = {
//   timestamp: string;
//   tvlUsd: number | null;
//   apy: number | null;
//   apyBase: number | null;
//   apyReward: number | null;
//   il7d: number | null;
//   apyBase7d: number | null;
// }[];

type apyInfoType = {
  spotApy: number;
  weeklyApy: number;
  monthlyApy: number;
  operatingSince: number;
};

export type poolInfoDataType = {
  sheetId: string;
  poolId: string;
  network: string;
  vault: string;
  platform: string;
  productName: string;
  productLink: string;
  tvl: number;
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
        vault,
        platform,
        productLink,
        productName,
        network,
        sponsored,
        tokenAddress,
      } = platformData;
      let spotApy: number = 0;
      let weeklyApy: number = 0;
      let monthlyApy: number = 0;
      let tvl: number = 0;
      if (tokenAddress) {
        const dataFromApi = await getDataFromApi(platform, tokenAddress, network, vault);
        if (dataFromApi) {
          spotApy = dataFromApi.spotApy || 0;
          weeklyApy = dataFromApi.weeklyApy || 0;
          monthlyApy = dataFromApi.monthlyApy || 0;
          tvl = dataFromApi.tvl || 0;
        }
      }
      poolApyInfo.push({
        sheetId: `${vault}-${network}-${platform}-${productName}`.trim().replace(/\s+/g, '-'),
        poolId,
        network,
        vault,
        platform,
        productName,
        productLink,
        spotApy,
        weeklyApy,
        monthlyApy,
        operatingSince: 0,
        tvl,
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
