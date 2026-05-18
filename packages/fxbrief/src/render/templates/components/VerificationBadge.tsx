import type { SocialAuthor } from '../../../types.js';

interface VerificationBadgeProps {
  author: SocialAuthor;
}

export function VerificationBadge({ author }: VerificationBadgeProps) {
  if (!author.verified) return null;

  const isBlueVerified = author.verificationType === undefined || author.verificationType === null || author.verificationType === 'individual';
  if (!isBlueVerified) {
    return <span className="verified verified-standard">✓</span>;
  }

  return (
    <span className="verified-rosette" aria-label="Verified account">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          className="rosette-shape"
          d="M12 1.9 14.1 4l2.9-.7 1 2.8 2.8 1-.7 2.9 2.1 2.1-2.1 2.1.7 2.9-2.8 1-1 2.8-2.9-.7L12 22.1 9.9 20l-2.9.7-1-2.8-2.8-1 .7-2.9-2.1-2.1L3.9 10l-.7-2.9 2.8-1 1-2.8 2.9.7L12 1.9Z"
        />
        <path className="rosette-check" d="m8.3 12.2 2.3 2.3 5.2-5.4" />
      </svg>
    </span>
  );
}
