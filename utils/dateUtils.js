/**
 * Date Utilities
 */

export function formatISODate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(isoDateString) {
  if (!isoDateString) return new Date();
  if (isoDateString instanceof Date) return isoDateString;
  const parts = String(isoDateString).split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(isoDateString);
}

export function getFriendlyDateLabel(isoDateString) {
  const today = formatISODate(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatISODate(yesterdayDate);

  if (isoDateString === today) return 'Today';
  if (isoDateString === yesterday) return 'Yesterday';

  const parts = isoDateString.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  return isoDateString;
}

export function shiftDate(isoDateString, daysDelta) {
  const parts = isoDateString.split('-');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  d.setDate(d.getDate() + daysDelta);
  return formatISODate(d);
}

export function getLastNDays(count = 7) {
  const dates = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatISODate(d));
  }
  return dates;
}
