import type { MediaMode, SocialPost } from '../../../types.js';
import { PostHeader } from './PostHeader.js';
import { MediaGrid } from './MediaGrid.js';
import { postBodyText } from './displayText.js';

interface QuotedPostProps {
  post?: SocialPost | undefined;
  timezone: string;
  mediaMode: MediaMode;
  translatedText: boolean;
}

export function QuotedPost({ post, timezone, mediaMode, translatedText }: QuotedPostProps) {
  if (!post) return null;

  return (
    <div className="quote-card">
      <PostHeader post={post} timezone={timezone} showTimestamp={false} compact />
      <div className="quote-text">{postBodyText(post, translatedText)}</div>
      <MediaGrid media={post.media} mode={mediaMode === 'none' ? 'none' : 'first'} />
    </div>
  );
}
