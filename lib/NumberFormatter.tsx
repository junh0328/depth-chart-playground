import BigNumber from 'bignumber.js';

// Options for number formatting
export interface NumberFormatterOptions {
  value: number | string | BigNumber | null | undefined;
  decimalPlaces?: number;
  showSign?: boolean;
  prefix?: string;
  suffix?: string;
  showThousandSeparator?: boolean;
  roundingMode?: BigNumber.RoundingMode;
}

// Helper function to parse numeric values
const parseNumericValue = (
  value: number | string | BigNumber | null | undefined
): BigNumber | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (BigNumber.isBigNumber(value)) {
    return value;
  }

  try {
    const cleanValue =
      typeof value === 'string' ? value.replace(/[,\s]/g, '') : value;
    const bn = new BigNumber(cleanValue);
    return bn.isNaN() ? null : bn;
  } catch {
    return null;
  }
};

// Helper function to format number with thousand separators
const addThousandSeparators = (str: string): string => {
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * NumberFormatter - A utility function that formats numbers to strings with various options
 *
 * @param options - Formatting options object
 * @param options.value - The numeric value to format. Accepts number, string, BigNumber, null, or undefined
 * @param options.decimalPlaces - Number of decimal places to display. If undefined, uses the natural precision of the number
 * @param options.showSign - Whether to show + sign for positive numbers. Negative numbers always show - sign. Default: false
 * @param options.prefix - String to prepend to the formatted number (e.g., '$', '€'). Default: ''
 * @param options.suffix - String to append to the formatted number (e.g., ' USD', '%'). Default: ''
 * @param options.showThousandSeparator - Whether to add comma separators for thousands (e.g., 1,234). Default: true
 * @param options.roundingMode - BigNumber rounding mode for decimal places. Default: BigNumber.ROUND_FLOOR
 *
 * @returns Formatted number string or '--' for null/invalid values
 *
 * @example
 * // Basic formatting with decimal places
 * formatNumber({ value: 1234.56789, decimalPlaces: 2 }) // "1,234.57"
 *
 * // Show positive sign
 * formatNumber({ value: 1234.56, showSign: true }) // "+1,234.56"
 * formatNumber({ value: -1234.56, showSign: true }) // "-1,234.56"
 *
 * // With prefix and suffix
 * formatNumber({ value: 1234.56, prefix: '$', suffix: ' USD' }) // "$1,234.56 USD"
 *
 * // Disable thousand separators
 * formatNumber({ value: 1234.56, showThousandSeparator: false }) // "1234.56"
 *
 * // Different rounding modes
 * formatNumber({ value: 1234.567, decimalPlaces: 2, roundingMode: BigNumber.ROUND_UP }) // "1,234.57"
 * formatNumber({ value: 1234.561, decimalPlaces: 2, roundingMode: BigNumber.ROUND_DOWN }) // "1,234.56"
 *
 * // Handle null/undefined values
 * formatNumber({ value: null }) // "--"
 * formatNumber({ value: undefined }) // "--"
 * formatNumber({ value: '' }) // "--"
 *
 * // BigNumber input
 * formatNumber({ value: new BigNumber('1234.56789'), decimalPlaces: 3 }) // "1,234.568"
 *
 * // String input with commas (automatically cleaned)
 * formatNumber({ value: '1,234.56789', decimalPlaces: 2 }) // "1,234.57"
 */
export function formatNumber({
  value,
  decimalPlaces,
  showSign = false,
  prefix = '',
  suffix = '',
  showThousandSeparator = true,
  roundingMode = BigNumber.ROUND_FLOOR,
}: NumberFormatterOptions): string {
  const numericValue = parseNumericValue(value);

  if (numericValue === null) {
    return '--';
  }

  let formatted: string;
  if (decimalPlaces !== undefined) {
    formatted = numericValue.toFixed(decimalPlaces, roundingMode);
  } else {
    formatted = numericValue.toString();
  }

  const [integer, decimal] = formatted.split('.');

  // Add thousand separators to integer part if enabled
  const formattedInteger = showThousandSeparator
    ? addThousandSeparators(integer)
    : integer;

  // Reconstruct the number string
  let result = decimal ? `${formattedInteger}.${decimal}` : formattedInteger;

  // Add sign if requested and number is not zero
  if (showSign && !numericValue.isZero()) {
    const sign = numericValue.isPositive() ? '+' : '';
    result = numericValue.isNegative()
      ? result // Keep the negative sign that's already there
      : `${sign}${result}`;
  }

  // Add prefix and suffix
  return `${prefix}${result}${suffix}`;
}

export function NumberFormatter(props: NumberFormatterOptions): string {
  const { ...options } = props;
  return formatNumber(options);
}

export default NumberFormatter;
