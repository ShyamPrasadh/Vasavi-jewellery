/** Indian digit grouping (e.g. 2,92,759). */

export function formatInr(
  value: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString('en-IN', options);
}

/** Format a numeric input string with Indian commas while typing. */
export function formatInrDigits(raw: string): string {
  if (raw === '') return '';
  if (raw.includes('.')) {
    const [intPart, decPart = ''] = raw.split('.');
    const formattedInt = intPart === '' ? '' : Number(intPart).toLocaleString('en-IN');
    return `${formattedInt}.${decPart}`;
  }
  return Number(raw).toLocaleString('en-IN');
}
