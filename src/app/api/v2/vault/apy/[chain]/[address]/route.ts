import { type NextRequest } from 'next/server';
import getLatestAPRAndMetadataFromAlchemy from '@/helpers/getData/spectraVision/getLatestAPRAndMetadataFromAlchemy';
import ChainId from '@/helpers/getData/spectraVision/data/ChainId';
import isValidChain from '@/helpers/getData/spectraVision/utils/isValidChain';
import { HistoricalAPR } from '@/helpers/getData/spectraVision/data/HistoricalAPR';
import getDataFromMorpho, { MorphoData } from '@/helpers/getData/morphoApi/getDatafromMorpho';

export const runtime = 'nodejs'; // use Node runtime
export const dynamic = 'force-dynamic'; // don’t let Next cache the handler

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  try {
    const address = (await params).address;
    const chain = (await params).chain;
    const isMorpho = request.nextUrl.searchParams.get('morpho') === "true";

    if (!isValidChain(chain)) throw new Error('Invalid chain');

    const chainKey = chain.toUpperCase() as keyof typeof ChainId;

    if (!(chainKey in ChainId)) {
      throw new Error(`Unknown network: ${chain}`);
    }

    const chainId = ChainId[chainKey];

    let vaultData: HistoricalAPR | MorphoData | {} = {};

    if(isMorpho){
      const morphoData = await getDataFromMorpho(address, chainId as number);
      if(morphoData) vaultData = {
        ...morphoData,
          source: {
            company: 'Morpho',
            website: 'https://morpho.org/',
          },
      }
    }
    else{
        const visionData = await getLatestAPRAndMetadataFromAlchemy(address, chainId);
        vaultData = {
          ...visionData,
          source: {
            company: 'Spectra',
            website: 'https://www.spectra.finance/',
          },
        }
    }

    

    return new Response(
      JSON.stringify(vaultData)
    );
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify({ data: 'error' }));
  }
}
