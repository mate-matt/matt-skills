import type { SocialAuthor } from '../../../types.js';

interface AvatarProps {
  author: SocialAuthor;
}

export function Avatar({ author }: AvatarProps) {
  const src = author.avatarAssetUrl ?? author.avatarUrl;
  const initials = getInitials(author.name || author.handle);

  return (
    <div className="avatar" aria-label={`${author.name} avatar`}>
      {src ? <img src={src} alt="" /> : <span>{initials}</span>}
    </div>
  );
}

function getInitials(value: string): string {
  const cleaned = value.trim().replace(/^@/, '');
  if (!cleaned) return '?';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}
