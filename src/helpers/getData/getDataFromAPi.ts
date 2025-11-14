import getDataFromMorpho from "./morphoApi/getDatafromMorpho";
import ChainId from "./spectraVision/data/ChainId";
import getDataFromVision from "./spectraVision/getDataFromVision";

export default async function getDataFromApi(protocol: string, address: string, network: string){
    try{
        const chainKey = network.toUpperCase() as keyof typeof ChainId;
        if(!(chainKey in ChainId)){
            throw new Error("Wrong chain for api")
        } 
        const chainId = ChainId[chainKey];
        if(protocol === "Morpho"){
            const dataFromMorpho = await getDataFromMorpho(address, chainId);
            return dataFromMorpho;
        }
        else {
            const dataFromVision = await getDataFromVision(address, chainId);
            return dataFromVision;
        }
    }
    catch(e){
        console.log(e);
        return null;
    }
    
}