import IndexTable from '@/components/IndexTable';
import { poolsInfoDataType } from '@/helpers/getData/getPropsHelpers';
import dbConnect from '../../../../lib/dbConnect';
import Pool from '../../../../lib/models/Pool';
import { getLastFullHourUTC } from '@/helpers/formatTimeAgo';
import { Chain } from '@/helpers/getData/getPropsHelpers';
import { Metadata } from 'next';
import { stables } from '@/consts/constants';

type Props = {
  params: Promise<{ coin: string; network: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const coin = (await params).coin;
  const network = (await params).network;

  return {
    title: `Best ${coin} APY on ${network} — Track & Compare ${stables.includes(coin) ? 'Stablecoin' : ''} Yield | Earnbase`,
    description: `Discover top ${coin} yield opportunities on ${network}. Track verified APY and performance data from trusted platforms and earn with confidence.`,
    twitter: {
      card: 'summary_large_image',
      title: `Best ${coin} APY on ${network} — Track & Compare ${stables.includes(coin) ? 'Stablecoin' : ''} Yield | Earnbase`,
      description: `Discover top ${coin} yield opportunities on ${network}. Track verified APY and performance data from trusted platforms and earn with confidence.`,
      images: 'https://earnbase.finance/social-card.png',
    },
    openGraph: {
      type: 'website',
      url: 'https://earnbase.finance/',
      title: `Best ${coin} APY on ${network} — Track & Compare ${stables.includes(coin) ? 'Stablecoin' : ''} Yield | Earnbase`,
      description: `Discover top ${coin} yield opportunities on ${network}. Track verified APY and performance data from trusted platforms and earn with confidence.`,
      images: 'https://earnbase.finance/social-card.png',
    },
  };
}

const emptyData = {
  updatedAt: '',
  indexData: [],
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
function isValidChain(value: any): value is Chain {
  const chains: Chain[] = ['Mainnet', 'Base', 'Arbitrum', 'BNB', 'Sonic', 'Avalanche', null];
  return chains.includes(value);
}

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

export default async function CoinNetworkPage({
  params,
}: {
  params: Promise<{ coin: string; network: string }>;
}) {
  const { coin } = (await params) || 'USDC';
  const rawNetwork = (await params).network;
  const network: Chain = isValidChain(rawNetwork) ? rawNetwork : 'Mainnet';
  const data = await getData(coin);
  return <IndexTable poolsApyInfo={data} selectedNetwork={network} coin={coin} />;
}
