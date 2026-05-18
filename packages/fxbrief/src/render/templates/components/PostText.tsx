import type { SocialPost } from '../../../types.js';

interface PostTextProps {
  post: SocialPost;
  className?: string;
  showTranslation: boolean;
}

export function PostText({ post, className = 'post-text', showTranslation }: PostTextProps) {
  return (
    <>
      <p className={className}>{post.text || '[No text]'}</p>
      {showTranslation && post.translation?.text ? (
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
