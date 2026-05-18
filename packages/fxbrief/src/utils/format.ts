export function formatMetric(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${trimNumber(value / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${trimNumber(value / 1_000_000)}M`;
  if (abs >= 10_000) return `${trimNumber(value / 1_000)}K`;
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatCount(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '';
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPostDate(
  iso: string,
  timezone = 'Asia/Shanghai',
  style: 'short' | 'long' = 'short',
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  if (style === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatPostDetailDate(iso: string, timezone = 'Asia/Shanghai'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  const day = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);

  return `${time} · ${day}`;
}

export function formatCompactMetric(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function compactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return url;
  }
}

export function truncateMiddle(value: string, maxLength = 68): string {
  if (value.length <= maxLength) return value;
  const head = Math.ceil((maxLength - 1) * 0.65);
  const tail = Math.floor((maxLength - 1) * 0.35);
  return `${value.slice(0, head)}…${value.slice(value.length - tail)}`;
}

function trimNumber(value: number): string {
  return value.toFixed(value >= 10 ? 0 : 1).replace(/\.0$/, '');
}
