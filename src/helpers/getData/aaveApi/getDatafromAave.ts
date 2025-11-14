const aavemarketAddresses: {
  [key: string]: string;
} = {
  1: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  42161: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  8453: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  56: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
  146: '0x5362dBb1e601abF3a4c14c22ffEdA64042E5eAA3',
  43114: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
};

type Reserve = {
  underlyingToken: {
    address: string;
  };
  supplyInfo: {
    total: {
      value: string;
    };
    supplyCap: {
      usd: string;
      amount: {
        value: string;
      };
      usdPerToken: string;
    };
  };
};

type ApyHistory = {
  date: string;
  avgRate: {
    formatted: string;
  };
};

export type AaveData = {
  spotApy: number;
  weeklyApy: number;
  monthlyApy: number;
  tvl: number;
};

export default async function getDataFromAave(
  underlyingToken: string,
  chainId: number
): Promise<AaveData | null> {
  try {
    const query = `
      query Market(
        $request: MarketRequest!,
        $lastWeek: SupplyAPYHistoryRequest!,
        $lastMonth: SupplyAPYHistoryRequest!
      ) {
        market(request: $request) {
          totalMarketSize
          totalAvailableLiquidity
          name
          chain { name }
          address
          reserves {
            underlyingToken { address }
            supplyInfo {
              total { value }
              supplyCap {
                usd
                amount { value }
                usdPerToken
              }
            }
          }
        }

        lastWeekHistory: supplyAPYHistory(request: $lastWeek) {
          date
          avgRate { formatted }
        }

        lastMonthHistory: supplyAPYHistory(request: $lastMonth) {
          date
          avgRate { formatted }
        }
      }
  `;

    const res = await fetch('https://api.v3.aave.com/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          request: {
            chainId,
            address: aavemarketAddresses[chainId],
          },
          lastWeek: {
            market: aavemarketAddresses[chainId],
            underlyingToken,
            window: 'LAST_WEEK',
            chainId,
          },
          lastMonth: {
            market: aavemarketAddresses[chainId],
            underlyingToken,
            window: 'LAST_MONTH',
            chainId,
          },
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Aave API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    if (json.errors?.length) {
      throw new Error(json.errors[0].message || 'Unknown GraphQL error');
    }

    const rawTvl: string | undefined = json?.data?.market?.reserves?.find(
      (reserve: Reserve) =>
        reserve.underlyingToken.address.toLowerCase() === underlyingToken.toLowerCase()
    )?.supplyInfo?.supplyCap?.usd;
    const tvl = rawTvl ? Number(rawTvl) : 0;

    const spotApy =
      (json?.data?.lastWeekHistory.slice(0, 25) ?? []).reduce(
        (acc: number, history: ApyHistory) => acc + (Number(history.avgRate.formatted) || 0),
        0
      ) / 25 || (0 as number);

    const weeklyApy =
      (json?.data?.lastWeekHistory ?? []).reduce(
        (acc: number, history: ApyHistory) => acc + (Number(history.avgRate.formatted) || 0),
        0
      ) / (json?.data?.lastWeekHistory?.length || 1) || (0 as number);

    const monthlyApy =
      (json?.data?.lastMonthHistory ?? []).reduce(
        (acc: number, history: ApyHistory) => acc + (Number(history.avgRate.formatted) || 0),
        0
      ) / (json?.data?.lastMonthHistory?.length || 1) || (0 as number);

    return {
      spotApy,
      weeklyApy,
      monthlyApy,
      tvl,
    };
  } catch (e) {
    console.log('Failed to fech data from Aave');
    console.log(e);
    return null;
  }
}
