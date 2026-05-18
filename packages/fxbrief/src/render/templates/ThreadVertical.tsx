import type { RenderOptions, SocialThread } from '../../types.js';
import { Avatar } from './components/Avatar.js';
import { MediaGrid } from './components/MediaGrid.js';
import { Metrics } from './components/Metrics.js';
import { PostHeader } from './components/PostHeader.js';
import { PostText } from './components/PostText.js';
import { SourceFooter } from './components/SourceFooter.js';

interface ThreadVerticalProps {
  thread: SocialThread;
  options: RenderOptions;
}

export function ThreadVertical({ thread, options }: ThreadVerticalProps) {
  const posts = thread.posts.slice(0, options.maxPosts ?? thread.posts.length);

  return (
    <section className="capture thread-vertical" data-capture>
      {posts.map((post, index) => (
        <article className="thread-item" key={post.id}>
          <div className="thread-rail">
            <Avatar author={post.author} />
            <div className="thread-line" />
          </div>
          <div className="thread-body">
            <PostHeader post={post} timezone={options.timezone} showTimestamp={options.showTimestamp} compact showAvatar={false} />
            <PostText post={post} showTranslation={options.showTranslation} />
            <MediaGrid media={post.media} mode={options.mediaMode} />
            {options.showStats ? <Metrics metrics={post.metrics} /> : null}
            {options.showSourceFooter && index === posts.length - 1 ? <SourceFooter post={thread.root} /> : null}
          </div>
        </article>
      ))}
    </section>
  );
}
