import type { RenderOptions, SocialPost } from '../../types.js';
import { MediaGrid } from './components/MediaGrid.js';
import { PostHeader } from './components/PostHeader.js';
import { PostText } from './components/PostText.js';
import { QuotedPost } from './components/QuotedPost.js';
import { SourceFooter } from './components/SourceFooter.js';

interface PostCleanProps {
  post: SocialPost;
  options: RenderOptions;
}

export function PostClean({ post, options }: PostCleanProps) {
  return (
    <article className="capture post-clean" data-capture>
      <div className="clean-kicker">Source quotation</div>
      <PostText post={post} className="clean-text" showTranslation={options.showTranslation} translatedText={options.translatedText} />
      <MediaGrid media={post.media} mode={options.mediaMode === 'grid' ? 'first' : options.mediaMode} />
      <QuotedPost post={post.quote} timezone={options.timezone} mediaMode={options.mediaMode} translatedText={options.translatedText} />
      <div className="clean-author">
        <PostHeader post={post} timezone={options.timezone} showTimestamp={options.showTimestamp} />
      </div>
      {options.showSourceFooter ? <SourceFooter post={post} /> : null}
    </article>
  );
}
