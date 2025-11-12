import { SECONDS_PER_YEAR } from "../data/constants"
import { BigNumber } from "ethers"

const precision = 1_000_000

export default function computeAPRFromRates(
    _previousRate: BigNumber | bigint,
    _newRate: BigNumber | bigint,
    timeDelta: number
) {
    const timeFactor = SECONDS_PER_YEAR / timeDelta
    const previousRate =
        typeof _previousRate === "bigint"
            ? BigNumber.from(_previousRate)
            : _previousRate
    const newRate =
        typeof _newRate === "bigint" ? BigNumber.from(_newRate) : _newRate
    return (
        (newRate.mul(precision).div(previousRate).sub(precision).toNumber() *
            timeFactor *
            100) /
        precision
    )
}
