import { ApolloClient } from 'apollo-client';

export const splitQuery = async <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  localClient: ApolloClient<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vars: any[],
  blocks: number[],
  skipCount = 100
) => {
  let fetchedData: Record<string, T[]> = {};
  let allFound = false;
  let skip = 0;

  while (!allFound) {
    let end = blocks.length;
    if (skip + skipCount < blocks.length) {
      end = skip + skipCount;
    }
    const sliced = blocks.slice(skip, end);
    if (sliced.length === 0) break;
    const result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: 'no-cache', //FIXME: set to cache-first
    });
    fetchedData = {
      ...fetchedData,
      ...result.data,
    };
    allFound = Object.keys(result.data).length < skipCount || skip + skipCount > blocks.length;
    if (!allFound) {
      skip += skipCount;
    }
  }

  return fetchedData;
};
