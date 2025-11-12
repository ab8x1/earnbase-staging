export function formatNumberWithSpaces(num: number | string): string {
  // Convert to string if it's a number
  const str = typeof num === 'number' ? num.toString() : num;

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = str.split('.');

  // Format the integer part with spaces
  const formattedInteger = integerPart
    .replace(/^(-?\d+)(\d{3})/, '$1 $2') // Handle negative numbers
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // Recombine with decimal part if it exists
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

export function formatMillionsToNumber(num: number, decimalPlaces: number = 0): number {
  if (isNaN(num)) return 0;

  const MILLION = 1_000_000;
  const roundedValue = num / MILLION;

  // Round to specified decimal places (default: 0)
  const rounded =
    decimalPlaces > 0 ? Number(roundedValue.toFixed(decimalPlaces)) : Math.round(roundedValue);

  return rounded;
}

export function formatMillions(num: number, decimalPlaces: number = 0): string {
  const rounded = formatMillionsToNumber(num, decimalPlaces);

  return `${rounded}M`; // "M" for Millions
}
