import IndexTable from '@/components/IndexTable';
import { poolsInfoDataType } from '@/helpers/getData/getPropsHelpers';
import dbConnect from '../../../lib/dbConnect';
import Pool from '../../../lib/models/Pool';
import { getLastFullHourUTC } from '@/helpers/formatTimeAgo';
import { Metadata } from 'next';
import { stables } from '@/consts/constants';

type Props = {
  params: Promise<{ coin: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const coin = (await params).coin;

  return {
    title: `Best ${coin} APY — Track & Compare ${stables.includes(coin) ? 'Stablecoin' : ''} Yield | Earnbase`,
    description: `Discover top ${coin} yield opportunities. Track verified APY and performance data from trusted platforms and earn with confidence.`,
    twitter: {
      card: 'summary_large_image',
      title: `Best ${coin} APY — Track & Compare ${stables.includes(coin) ? 'Stablecoin' : ''} Yield | Earnbase`,
      description: `Discover top ${coin} yield opportunities. Track verified APY and performance data from trusted platforms and earn with confidence.`,
      images: 'https://earnbase.finance/social-card.png',
    },
    openGraph: {
      type: 'website',
      url: 'https://earnbase.finance/',
      title: `Best ${coin} APY — Track & Compare ${stables.includes(coin) ? 'Stablecoin' : ''} Yield | Earnbase`,
      description: `Discover top ${coin} yield opportunities. Track verified APY and performance data from trusted platforms and earn with confidence.`,
      images: 'https://earnbase.finance/social-card.png',
    },
  };
}

const emptyData = {
  updatedAt: '',
  indexData: [],
};

async function getData(coin: string) {
  try {
    await dbConnect();
    const rawPoolData: poolsInfoDataType = (await Pool.find({ vault: coin })) || [];
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

export default async function CoinPage({ params }: { params: Promise<{ coin: string }> }) {
  const { coin } = (await params) || 'USDC';
  const data = await getData(coin);
  return <IndexTable poolsApyInfo={data} selectedNetwork={null} coin={coin} />;
}
