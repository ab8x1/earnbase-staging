import ChainId from "./data/ChainId"
import { HistoricalAPR } from "./data/HistoricalAPR"
import { SECONDS_PER_DAY, SECONDS_PER_MONTH } from "./data/constants"
import { BigNumber, ethers } from "ethers"
import computeAPRFromRates from "./utils/computeAPRFromRates"
import { getBlocksFromTimestamps } from "./utils/getBlocksFromTimestamps"

import fetchFromAlchemy from "./fetchFromAlchemy"

export default async function getLatestAPRAndMetadataFromAlchemy(
    tokenAddress: string,
    chainId: ChainId
): Promise<HistoricalAPR> {
    const to = Math.floor(Date.now() / 1000 / SECONDS_PER_DAY) * SECONDS_PER_DAY // get current day timestamp and align it on the same scale as the subgraph
    const timestamps = [
        to,
        to - SECONDS_PER_DAY,
        to - SECONDS_PER_DAY * 7,
        to - SECONDS_PER_MONTH,
    ]
    const [timestamp, timestamp1d, timestamp7d, timestamp30d] = timestamps
    const blocks = await getBlocksFromTimestamps(timestamps, chainId)

    // * Metadata calls
    // name(), symbol(), decimals() as sha3
    // We have to build eth_calls from raw hex selectors to batch them in one Alchemy request
    const calls = ["0x06fdde03", "0x95d89b41", "0x313ce567"].map(
        (selector, i) => ({
            method: "eth_call",
            params: [
                {
                    from: null,
                    to: tokenAddress,
                    data: selector,
                },
                "latest",
            ],
            id: i + 1,
            jsonrpc: "2.0",
        })
    )

    // * 4626 convertToAssets(UNIT) calls
    const CALLS_RATE_START_INDEX = calls.length
    const convertOneAssetUnitToSharesEncoded =
        "0x07a2d13a0000000000000000000000000000000000000000000000000de0b6b3a7640000"
    calls.push(
        ...blocks.map((block, i) => ({
            method: "eth_call",
            params: [
                {
                    from: null,
                    to: tokenAddress,
                    data: convertOneAssetUnitToSharesEncoded,
                },
                `0x${block.number.toString(16)}`,
            ],
            id: CALLS_RATE_START_INDEX + i + 1,
            jsonrpc: "2.0",
        }))
    )

    const result = await fetchFromAlchemy(calls, chainId)

    const [name, symbol, decimals] = result.splice(0, 3)
    const rates = result.map(({ result }) => {
        try {
            return BigNumber.from(result)
        } catch (e) {
            return null
        }
    })
    const [rate, rate1d, rate7d, rate30d] = rates
    return {
        address: tokenAddress,
        name: ethers.utils.defaultAbiCoder.decode(
            ["string"],
            name.result
        )[0] as string,
        symbol: ethers.utils.defaultAbiCoder.decode(
            ["string"],
            symbol.result
        )[0] as string,
        decimals: BigNumber.from(decimals.result).toNumber(),
        data: [
            {
                timestamp,
                apr: {
                    "1d":
                        rate1d &&
                        rate &&
                        computeAPRFromRates(
                            rate1d,
                            rate,
                            timestamp - timestamp1d
                        ).toString(),
                    "7d":
                        rate7d &&
                        rate &&
                        computeAPRFromRates(
                            rate7d,
                            rate,
                            timestamp - timestamp7d
                        ).toString(),
                    "30d":
                        rate30d &&
                        rate &&
                        computeAPRFromRates(
                            rate30d,
                            rate,
                            timestamp - timestamp30d
                        ).toString(),
                },
            },
        ],
    }
}
