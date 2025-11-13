import ChainId from './ChainId';

const THE_GRAPH_API_KEY = process.env.NEXT_PUBLIC_THE_GRAPH_API_KEY;

export type Subgraph = {
  url: string;
  startBlock: number;
  apiKey?: string;
  limit?: number;
};
type SubgraphByChainId = Record<number, Subgraph>;

export const PROTOCOL_SUBGRAPH: SubgraphByChainId = {
  [ChainId.MAINNET]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/spectra-mainnet/api',
    startBlock: 19727260,
  },
  [ChainId.ARBITRUM]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/spectra-arbitrum/api',
    startBlock: 204419220,
  },
  [ChainId.OPTIMISM]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/spectra-optimism/api',
    startBlock: 122130545,
  },
  [ChainId.BASE]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/spectra-base/api',
    startBlock: 16537641,
  },
  [ChainId.SONIC]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/spectra-sonic/api',
    startBlock: 1856000,
  },
  [ChainId.HEMI]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/spectra-hemi/api',
    startBlock: 1289400,
  },
  [ChainId.AVALANCHE]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/spectra-avalanche/api',
    startBlock: 62814000,
  },
  [ChainId.BNB]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/spectra-bsc/api',
    startBlock: 50411000,
  },
  [ChainId.HYPEREVM]: {
    url: 'https://api.goldsky.com/api/public/project_cm55feuq3euos01xjb3w504ls/subgraphs/spectra-hyperevm/1.2.0/gn',
    startBlock: 6375000,
    limit: 1000,
  },
  [ChainId.KATANA]: {
    url: 'https://gateway.thegraph.com/api/subgraphs/id/EtJtXWeQSmDtYtxY3tnfQXWBLkVp9ajWg1BX3f9L1qmV',
    startBlock: 4715200,
    apiKey: THE_GRAPH_API_KEY,
    limit: 1000,
  },
};
export const DEFAULT_PROTOCOL_SUBGRAPH = PROTOCOL_SUBGRAPH[ChainId.MAINNET];

export const VISION_SPS_SUBGRAPH: SubgraphByChainId = {
  [ChainId.MAINNET]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/vision-mainnet/api',
    startBlock: 18982509,
  },
  [ChainId.ARBITRUM]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/vision-arbitrum/api',
    startBlock: 204419220,
  },
  [ChainId.OPTIMISM]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/vision-optimism/api',
    startBlock: 122130545,
  },
  [ChainId.BASE]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/vision-base/api',
    startBlock: 16537641,
  },
  [ChainId.SONIC]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/vision-sonic/api',
    startBlock: 1856000,
  },
  [ChainId.HEMI]: {
    url: 'https://api.studio.thegraph.com/query/17172/vision-hemi/version/latest',
    startBlock: 1000000,
    limit: 1000,
  },
  [ChainId.AVALANCHE]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/vision-avalanche/api',
    startBlock: 62814000,
  },
  [ChainId.BNB]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/vision-bsc/api',
    startBlock: 50411000,
  },
  [ChainId.HYPEREVM]: {
    url: 'https://api.goldsky.com/api/public/project_cm55feuq3euos01xjb3w504ls/subgraphs/vision-hyperevm/0.0.1/gn',
    startBlock: 6375000,
    limit: 1000,
  },
  [ChainId.KATANA]: {
    url: 'https://gateway.thegraph.com/api/subgraphs/id/CbHLh7pBSskQbVXQUAhzMjZjYccAo6vhGiNB6NxTBvgK',
    startBlock: 4715200,
    apiKey: THE_GRAPH_API_KEY,
    limit: 1000,
  },
};
export const DEFAULT_VISION_SPS = VISION_SPS_SUBGRAPH[ChainId.MAINNET];

export const BLOCKS_SUBGRAPH: SubgraphByChainId = {
  [ChainId.MAINNET]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/community/blocks-mainnet/version/v1/api',
    startBlock: 19727260,
  },
  [ChainId.ARBITRUM]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/community/blocks-arbitrum-one/version/v1/api',
    startBlock: 204419220,
  },
  [ChainId.OPTIMISM]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/community/blocks-optimism/version/v1/api',
    startBlock: 122130545,
  },
  [ChainId.BASE]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/community/blocks-base/version/v1/api',
    startBlock: 16537641,
  },
  [ChainId.SONIC]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/blocks-sonic/api',
    startBlock: 1856000,
  },
  [ChainId.HEMI]: {
    url: 'https://api.studio.thegraph.com/query/17172/blocks-hemi/version/latest',
    startBlock: 1856000,
  },
  [ChainId.AVALANCHE]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/community/blocks-avalanche/version/v1/api',
    startBlock: 62814000,
  },
  [ChainId.BNB]: {
    url: 'https://subgraph.satsuma-prod.com/93c7f5423489/perspective/community/blocks-bsc/version/v1/api',
    startBlock: 50411000,
  },
  [ChainId.HYPEREVM]: {
    url: 'https://api.goldsky.com/api/public/project_cm55feuq3euos01xjb3w504ls/subgraphs/hyperevm-blocks/1.0.0/gn',
    startBlock: 6375000,
    limit: 1000,
  },
  [ChainId.KATANA]: {
    url: 'https://gateway.thegraph.com/api/subgraphs/id/FFz8eoWmY2G8ntMnhHZqeAu71CEpstm7wVZbhyMh7GNa',
    startBlock: 4715200,
    apiKey: THE_GRAPH_API_KEY,
    limit: 1000,
  },
};
