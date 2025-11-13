type APR = { '1d': string | null; '7d': string | null; '30d': string | null };
export type HistoricalAPR = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  data: {
    timestamp: number;
    tvl?: number;
    apr: APR;
  }[];
};
