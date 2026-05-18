import type { SocialPost } from '../../../types.js';
import { postBodyText } from './displayText.js';

interface PostTextProps {
  post: SocialPost;
  className?: string;
  showTranslation: boolean;
  translatedText: boolean;
}

export function PostText({ post, className = 'post-text', showTranslation, translatedText }: PostTextProps) {
  return (
    <>
      <p className={className}>{postBodyText(post, translatedText)}</p>
      {showTranslation && !translatedText && post.translation?.text ? (
        <div className="translation-box">
          <div className="translation-label">Translation</div>
          {post.translation.text}
        </div>
      ) : null}
      {post.communityNote?.text ? (
        <div className="community-note">
          <div className="note-label">Community note</div>
          {post.communityNote.text}
        </div>
      ) : null}
    </>
  );
}
