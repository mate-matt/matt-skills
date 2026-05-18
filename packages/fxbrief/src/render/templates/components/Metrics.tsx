import type { SocialMetrics } from '../../../types.js';
import { formatMetric } from '../../../utils/format.js';

interface MetricsProps {
  metrics?: SocialMetrics | undefined;
}

export function Metrics({ metrics }: MetricsProps) {
  if (!metrics) return null;

  const items = [
    ['Replies', metrics.replies],
    ['Reposts', metrics.reposts],
    ['Quotes', metrics.quotes],
    ['Likes', metrics.likes],
    ['Views', metrics.views],
  ] as const;

  const visible = items.filter(([, value]) => value !== undefined);
  if (visible.length === 0) return null;

  return (
    <div className="metrics">
      {visible.map(([label, value]) => (
        <span className="metric" key={label}>
          <strong>{formatMetric(value)}</strong>
          <span>{label}</span>
        </span>
      ))}
    </div>
  );
}
