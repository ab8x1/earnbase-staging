import IndexTable from '@/components/IndexTable';
import { poolsInfoDataType } from '@/helpers/getData/getPropsHelpers';
import dbConnect from '../../lib/dbConnect';
import Pool from '../../lib/models/Pool';
import { getLastFullHourUTC } from '@/helpers/formatTimeAgo';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EarnBase – Track & Compare the Best Yields in DeFi',
  description:
    'Tracking the real performance of DeFi vaults with pure, on-chain returns. Excludes manually claimable rewards, points programs, and cooldowns. Updated hourly.',
  twitter: {
    card: 'summary_large_image',
    title: 'EarnBase – Track & Compare the Best Yields in DeFi',
    description:
      'Tracking the real performance of DeFi vaults with pure, on-chain returns. Excludes manually claimable rewards, points programs, and cooldowns. Updated hourly.',
    images: 'https://earnbase.finance/social-card.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://earnbase.finance/',
    title: 'EarnBase – Track & Compare the Best Yields in DeFi',
    description:
      'Tracking the real performance of DeFi vaults with pure, on-chain returns. Excludes manually claimable rewards, points programs, and cooldowns. Updated hourly.',
    images: 'https://earnbase.finance/social-card.png',
  },
};

const emptyData = {
  updatedAt: '',
  indexData: [],
};

async function getData() {
  try {
    await dbConnect();
    const rawPoolData: poolsInfoDataType = (await Pool.find({ vault: 'USDC' })) || [];
    const poolData: poolsInfoDataType = JSON.parse(JSON.stringify(rawPoolData));
    return {
      updatedAt: getLastFullHourUTC(),
      indexData: poolData,
    };
  } catch (e) {
    console.log(e);
    return emptyData;
  }
}

export default async function Home() {
  const data = await getData();
  return <IndexTable poolsApyInfo={data} selectedNetwork={null} coin="USDC" />;
}
