"use strict"

import { Network, Networkish } from "@ethersproject/networks"
import { defineReadOnly } from "@ethersproject/properties"
import { ConnectionInfo } from "@ethersproject/web"
import ChainId from "../../data/ChainId"
import { ethers, version } from "ethers"
import { Logger } from "ethers/lib/utils.js"

// This key was provided to ethers.js by Alchemy to be used by the
// default provider, but it is recommended that for your own
// production environments, that you acquire your own API key at:
//   https://dashboard.alchemyapi.io

const defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC"

const logger = new Logger(version)

export class AlchemyWebSocketProvider
    extends ethers.providers.WebSocketProvider
    implements ethers.providers.CommunityResourcable
{
    readonly apiKey!: string

    constructor(network?: Networkish, apiKey?: string) {
        const provider = new AlchemyProvider(network, apiKey)

        const url = provider.connection.url
            .replace(/^http/i, "ws")
            .replace(".alchemyapi.", ".ws.alchemyapi.")

        super(url, provider.network)
        defineReadOnly(this, "apiKey", apiKey!)
    }

    isCommunityResource(): boolean {
        return this.apiKey === defaultApiKey
    }
}

const ALCHEMY_ENDPOINTS: { [key: number]: string } = {
    [ChainId.MAINNET]: "https://eth-mainnet.alchemyapi.io/v2/{{}}",
    [ChainId.GOERLI]: "https://eth-goerli.g.alchemy.com/v2/{{}}",
    [ChainId.POLYGON]: "https://polygon-mainnet.g.alchemy.com/v2/{{}}",
    [ChainId.ARBITRUM]: "https://arb-mainnet.g.alchemy.com/v2/{{}}",
    [ChainId.OPTIMISM]: "https://opt-mainnet.g.alchemy.com/v2/{{}}",
    [ChainId.BASE]: "https://base-mainnet.g.alchemy.com/v2/{{}}",
    [ChainId.SEPOLIA]: "https://eth-sepolia.g.alchemy.com/v2/{{}}",
    [ChainId.SONIC]: "https://sonic-mainnet.g.alchemy.com/v2/{{}}",
    [ChainId.HEMI]: `https://rpc.hemi.network/rpc`, // TODO: replace with Alchemy endpoint when supported
    [ChainId.AVALANCHE]: `https://avax-mainnet.g.alchemy.com/v2/{{}}`,
    [ChainId.BSC]: `https://bnb-mainnet.g.alchemy.com/v2/{{}}`,
    [ChainId.HYPEREVM]: `https://hyperliquid-mainnet.g.alchemy.com/v2/{{}}`,
    [ChainId.KATANA]: `https://rpc.katana.network`, // TODO: alchemy
}

const getEndpoint = (network: Network) => {
    const endpoint = ALCHEMY_ENDPOINTS[network.chainId]
    if (!endpoint) {
        logger.throwArgumentError("unsupported network", "network", network)
        return ""
    }
    return endpoint
}

export class AlchemyProvider extends ethers.providers.UrlJsonRpcProvider {
    static getWebSocketProvider(
        network?: Networkish,
        apiKey?: string
    ): AlchemyWebSocketProvider {
        return new AlchemyWebSocketProvider(network, apiKey)
    }

    static getApiKey(apiKey: string): string {
        if (apiKey === null) {
            return defaultApiKey
        }
        if (apiKey && typeof apiKey !== "string") {
            logger.throwArgumentError("invalid apiKey", "apiKey", apiKey)
        }
        return apiKey
    }

    static getUrl(network: Network, apiKey: string): ConnectionInfo {
        const endpoint = getEndpoint(network)?.replace("{{}}", apiKey)
        return {
            allowGzip: true,
            url: endpoint,
            throttleCallback: () => {
                if (apiKey === defaultApiKey) {
                    ethers.providers.showThrottleMessage()
                }
                return Promise.resolve(true)
            },
        }
    }

    isCommunityResource(): boolean {
        return this.apiKey === defaultApiKey
    }
}
