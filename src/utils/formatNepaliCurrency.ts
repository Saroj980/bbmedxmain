// utils/formatNepaliCurrency.ts
export function formatNepaliCurrency(
  value: number | string
): string {
  if (value === null || value === undefined || value === '') return '0';

  const num = Number(value);
  if (isNaN(num)) return '0';

  // Keep 2 decimals only if needed
  const hasDecimal = num % 1 !== 0;
  const fixed = hasDecimal ? num.toFixed(2) : String(Math.trunc(num));

  const [integer, fraction] = fixed.split('.');

  // Handle negative numbers
  const sign = integer.startsWith('-') ? '-' : '';
  const int = integer.replace('-', '');

  const lastThree = int.slice(-3);
  const other = int.slice(0, -3);

  const formatted =
    other !== ''
      ? other.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
      : lastThree;

  return sign + formatted + (fraction ? '.' + fraction : '');
}
