import getDataFromAave from './aaveApi/getDatafromAave';
import getDataFromIPOR from './iporApi/getDataFromIpor';
import getDataFromMorpho from './morphoApi/getDatafromMorpho';
import ChainId from './spectraVision/data/ChainId';
import getDataFromVision from './spectraVision/getDataFromVision';

export default async function getDataFromApi(protocol: string, address: string, network: string) {
  try {
    const chainKey = network.toUpperCase() as keyof typeof ChainId;
    if (!(chainKey in ChainId)) {
      throw new Error('Wrong chain for api');
    }
    const chainId = ChainId[chainKey];
    switch (protocol) {
      case 'Morpho':
        return await getDataFromMorpho(address, chainId);

      case 'Aave':
        return await getDataFromAave(address, chainId);

      case 'IPOR':
        return await getDataFromIPOR(address, chainId);

      default:
        return await getDataFromVision(address, chainId);
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}
