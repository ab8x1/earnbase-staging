import ChainId from "../data/ChainId"
import { getBlocksClient } from "../data/apollo/client"
import { GET_BLOCKS } from "../data/apollo/queries"

import { splitQuery } from "./splitQuery"

export const getBlocksFromTimestamps = async (
    timestamps: number[],
    chainId: ChainId,
    skipCount = 500
) => {
    if (timestamps?.length === 0) {
        return []
    }

    try {
        const fetchedData = await splitQuery(
            GET_BLOCKS,
            getBlocksClient(chainId),
            [],
            timestamps,
            skipCount
        )

        const blocks: { timestamp: string; number: number }[] = []
        if (fetchedData) {
            for (const t in fetchedData) {
                if (fetchedData[t].length > 0) {
                    blocks.push({
                        timestamp: t.split("t")[1],
                        number: Number(fetchedData[t][0].number),
                    })
                }
            }
        }
        return blocks
    } catch (error) {
        console.error(error)

        return []
    }
}
