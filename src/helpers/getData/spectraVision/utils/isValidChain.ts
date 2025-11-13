import ChainId from "../data/ChainId";

export default function isValidChain(chainName: string){
    const chain = chainName.toUpperCase() as keyof typeof ChainId;

  if (!(chain in ChainId)) return false;
  else return true;
   
}