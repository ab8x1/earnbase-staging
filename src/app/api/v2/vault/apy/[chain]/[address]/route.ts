import { type NextRequest } from 'next/server';
import getLatestAPRAndMetadataFromAlchemy from '@/helpers/getData/spectraVision/getLatestAPRAndMetadataFromAlchemy';
import ChainId from '@/helpers/getData/spectraVision/data/ChainId';
import isValidChain from '@/helpers/getData/spectraVision/utils/isValidChain';
import { HistoricalAPR } from '@/helpers/getData/spectraVision/data/HistoricalAPR';
import getDataFromMorpho, { MorphoData } from '@/helpers/getData/morphoApi/getDatafromMorpho';
import getDataFromAave from '@/helpers/getData/aaveApi/getDatafromAave';

export const runtime = 'nodejs'; // use Node runtime
export const dynamic = 'force-dynamic'; // don’t let Next cache the handler

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  try {
    const address = (await params).address;
    const chain = (await params).chain;
    const platform = request.nextUrl.searchParams.get('platform');

    if (!isValidChain(chain)) throw new Error('Invalid chain');

    const chainKey = chain.toUpperCase() as keyof typeof ChainId;

    if (!(chainKey in ChainId)) {
      throw new Error(`Unknown network: ${chain}`);
    }

    const chainId = ChainId[chainKey];

    /* eslint-disable  @typescript-eslint/no-empty-object-type*/
    let vaultData: HistoricalAPR | MorphoData | {} = {};

    switch (platform) {
      case 'morpho': {
        const data = await getDataFromMorpho(address, chainId);
        if (data) {
          vaultData = {
            ...data,
            source: { company: 'Morpho', website: 'https://morpho.org/' },
          };
        }
        break;
      }

      case 'aave': {
        const data = await getDataFromAave(address, chainId);
        if (data) {
          vaultData = {
            ...data,
            source: { company: 'Aave', website: 'https://aave.com/' },
          };
        }
        break;
      }

      default: {
        const data = await getLatestAPRAndMetadataFromAlchemy(address, chainId);
        vaultData = {
          ...data,
          source: { company: 'Spectra', website: 'https://www.spectra.finance/' },
        };
      }
    }

    return new Response(JSON.stringify(vaultData));
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify({ data: 'error' }));
  }
}
