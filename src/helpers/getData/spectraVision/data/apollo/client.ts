import { NormalizedCacheObject } from "@apollo/client"
import { InMemoryCache } from "apollo-cache-inmemory"
import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import ChainId from "../ChainId"
import {
    BLOCKS_SUBGRAPH,
    PROTOCOL_SUBGRAPH,
    VISION_SPS_SUBGRAPH,
} from "../subgraph"
import { Cache } from "../../utils/Cache"
import fetchWithTimeout from "../../utils/fetchWithTimeout"
import { isSSR } from "../../utils/ssr"

const subgraphClientCache = new Cache<ApolloClient<NormalizedCacheObject>>()
export const clientFromURI = (uri: string, timeout?: number, apiKey?: string) =>
    subgraphClientCache.getOrSync(uri, () => {
        const link = new HttpLink({
            ...(apiKey
                ? {
                      headers: {
                          Authorization: `Bearer ${apiKey}`,
                      },
                  }
                : {}),
            uri,
            fetch:
                typeof timeout === "number"
                    ? (uri, options) => fetchWithTimeout(uri, options, timeout) // if timeout is set, use fetchWithTimeout
                    : undefined,
        })
        return new ApolloClient({
            ssrMode: isSSR,
            link,
            cache: new InMemoryCache(),
        })
    })

export const getProtocolClient = (chainId: ChainId) =>
    PROTOCOL_SUBGRAPH[chainId]
        ? clientFromURI(
              PROTOCOL_SUBGRAPH[chainId]?.url,
              undefined,
              PROTOCOL_SUBGRAPH[chainId]?.apiKey
          )
        : null

export const getVisionClient = (chainId: ChainId) =>
    VISION_SPS_SUBGRAPH[chainId]
        ? clientFromURI(
              VISION_SPS_SUBGRAPH[chainId]?.url,
              undefined,
              VISION_SPS_SUBGRAPH[chainId]?.apiKey
          )
        : null

export const getBlocksClient = (chainId: ChainId) => {
    if (BLOCKS_SUBGRAPH[chainId]) {
        return clientFromURI(
            BLOCKS_SUBGRAPH[chainId]?.url,
            undefined,
            BLOCKS_SUBGRAPH[chainId]?.apiKey
        )
    } else {
        throw new Error(`No block subgraph for chainId ${chainId}`)
    }
}
