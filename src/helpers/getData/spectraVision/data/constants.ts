export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_DAY = SECONDS_PER_HOUR * 24;
export const MILLISECONDS_PER_HOUR = SECONDS_PER_HOUR * 1000;
export const MILLISECONDS_PER_DAY = SECONDS_PER_DAY * 1000;
export const SECONDS_PER_MONTH = SECONDS_PER_DAY * 30;
export const SECONDS_PER_YEAR = SECONDS_PER_DAY * 365;

// one year & one additional month to compute the 30d APR for the first day in the range (30D APR is always computed from the rates at day D and day D-30)
export const HISTORICAL_RANGE_MONTHS = 12 + 1;
export const HISTORICAL_RANGE_DAYS = HISTORICAL_RANGE_MONTHS * 30;
export const HISTORICAL_RANGE_SECONDS = HISTORICAL_RANGE_MONTHS * SECONDS_PER_MONTH;
