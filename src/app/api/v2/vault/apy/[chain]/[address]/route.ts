import { type NextRequest } from 'next/server';
import getLatestAPRAndMetadataFromAlchemy from '@/helpers/getData/spectraVision/getLatestAPRAndMetadataFromAlchemy';
import ChainId from '@/helpers/getData/spectraVision/data/ChainId';

export const runtime = 'nodejs'; // use Node runtime
export const dynamic = 'force-dynamic'; // don’t let Next cache the handler

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string, address: string }> },
) {
  const address = (await params).address;
  const chain = (await params).chain;
  
  const chainKey = chain.toUpperCase() as keyof typeof ChainId;

  if (!(chainKey in ChainId)) {
    throw new Error(`Unknown network: ${chain}`);
  }

  const chainId = ChainId[chainKey];


  const vaultData = await getLatestAPRAndMetadataFromAlchemy(address, chainId);

  return new Response(JSON.stringify({...vaultData, source: {
    company: "Spectra",
    website: "https://www.spectra.finance/"
  }}));
}
