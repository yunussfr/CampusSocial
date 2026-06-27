export function formatCount(value) {
  if (typeof value !== 'number') {
    return '0';
  }
  if (value < 1000) {
    return String(value);
  }
  return `${(value / 1000).toFixed(1)}k`;
}
