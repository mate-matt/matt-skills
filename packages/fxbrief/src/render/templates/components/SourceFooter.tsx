import type { SocialPost } from '../../../types.js';
import { compactUrl, truncateMiddle } from '../../../utils/format.js';

interface SourceFooterProps {
  post: SocialPost;
}

export function SourceFooter({ post }: SourceFooterProps) {
  const label = post.sourceLabel ?? post.provider;
  const url = truncateMiddle(compactUrl(post.url), 88);
  return (
    <div className="source-footer">
      Source: {label} / @{post.author.handle} · {url}
    </div>
  );
}
