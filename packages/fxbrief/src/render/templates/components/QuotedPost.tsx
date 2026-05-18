import type { MediaMode, SocialPost } from '../../../types.js';
import { PostHeader } from './PostHeader.js';
import { MediaGrid } from './MediaGrid.js';

interface QuotedPostProps {
  post?: SocialPost | undefined;
  timezone: string;
  mediaMode: MediaMode;
}

export function QuotedPost({ post, timezone, mediaMode }: QuotedPostProps) {
  if (!post) return null;

  return (
    <div className="quote-card">
      <PostHeader post={post} timezone={timezone} showTimestamp={false} compact />
      <div className="quote-text">{post.text || '[No text]'}</div>
      <MediaGrid media={post.media} mode={mediaMode === 'none' ? 'none' : 'first'} />
    </div>
  );
}
