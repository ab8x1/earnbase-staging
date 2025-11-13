import ChainId from './data/ChainId';
import { ALCHEMY_API_KEY } from './env';
import { ethers } from 'ethers';

import { AlchemyProvider } from './hooks/useWallet/AlchemyProvider';

export const CHAIN_HISTORICAL_DATA_UNSUPPORTED: { [key in ChainId]?: boolean } = {};

export default async function fetchFromAlchemy<T>(body: T, chainId: ChainId) {
  const alchemyUrl = AlchemyProvider.getUrl(ethers.providers.getNetwork(chainId), ALCHEMY_API_KEY);
  const result = await fetch(alchemyUrl.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (result.status !== 200) throw new Error('Remote provider error');
  return (await result.json()) as { result: string }[];
}
