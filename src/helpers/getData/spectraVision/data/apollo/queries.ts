import { gql } from "graphql-tag"

export const BATCH_RATES_GQL = (tokens: string[]) => {
    let queryString = "query BatchRates {"
    queryString += tokens.map((token) => {
        return `t${token}:rates(first: 168, orderBy: timestamp, orderDirection: desc, where: { erc4626: "${token}" }) {
            timestamp
            convertToAssets
        }`
    })
    queryString += "}"
    return gql(queryString)
}

export const GET_BLOCKS = (timestamps: number[]) => {
    let queryString = "query Blocks {"
    queryString += timestamps.map((timestamp) => {
        return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
            timestamp + 1200
        } }) {
            number
        }`
    })
    queryString += "}"
    return gql(queryString)
}
