export type MorphoData = {
  spotApy: number;
  weeklyApy: number;
  monthlyApy: number;
  tvl: number;
};

export default async function getDataFromMorpho(
  address: string,
  chainId: number
): Promise<MorphoData | null> {
  try {
    const query = `
    query VaultApy($address: String!, $chainId: Int!) {
      vaultByAddress(address: $address, chainId: $chainId) {
        address
        state {
          dailyApy
          weeklyApy
          monthlyApy
          allocation {
            supplyAssetsUsd
          }
        }
      }
    }
  `;

    const res = await fetch('https://api.morpho.org/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { address, chainId },
      }),
    });

    if (!res.ok) {
      throw new Error(`Morpho API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    if (json.errors?.length) {
      throw new Error(json.errors[0].message || 'Unknown GraphQL error');
    }

    const vault = json.data?.vaultByAddress;
    if (!vault?.state) {
      throw new Error('Vault not found or missing state');
    }

    const state: MorphoData = {
      spotApy: (Number(vault?.state?.dailyApy) || 0) * 100,
      weeklyApy: (Number(vault?.state?.weeklyApy) || 0) * 100,
      monthlyApy: (Number(vault?.state?.monthlyApy) || 0) * 100,
      tvl: (vault?.state?.allocation ?? []).reduce(
        (acc: number, alloc: { supplyAssetsUsd: number }) => acc + alloc.supplyAssetsUsd,
        0
      ) as number,
    };

    return state;
  } catch (e) {
    console.log('Failed to fech data from Morpho');
    console.log(e);
    return null;
  }
}
