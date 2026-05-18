import type { ReactNode } from 'react';
import type { SocialPost } from '../../../types.js';
import { formatPostDate } from '../../../utils/format.js';
import { Avatar } from './Avatar.js';
import { VerificationBadge } from './VerificationBadge.js';

interface PostHeaderProps {
  post: SocialPost;
  timezone: string;
  showTimestamp: boolean;
  compact?: boolean;
  showAvatar?: boolean;
  actions?: ReactNode;
}

export function PostHeader({ post, timezone, showTimestamp, compact = false, showAvatar = true, actions }: PostHeaderProps) {
  return (
    <div className={`header-row${showAvatar ? '' : ' no-avatar'}`}>
      {showAvatar ? <Avatar author={post.author} /> : null}
      <div className="author-block">
        <div className="author-line">
          <span className="author-name">{post.author.name}</span>
          <VerificationBadge author={post.author} />
        </div>
        <div className="meta-line">
          @{post.author.handle}
          {showTimestamp ? ` · ${formatPostDate(post.createdAt, timezone, compact ? 'short' : 'long')}` : null}
        </div>
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </div>
  );
}
