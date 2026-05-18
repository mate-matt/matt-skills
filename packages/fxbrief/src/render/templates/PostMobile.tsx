import type { RenderOptions, SocialPost } from '../../types.js';
import { formatCompactMetric, formatMetric, formatPostDetailDate } from '../../utils/format.js';
import { MediaGrid } from './components/MediaGrid.js';
import { Poll } from './components/Poll.js';
import { PostHeader } from './components/PostHeader.js';
import { PostText } from './components/PostText.js';
import { QuotedPost } from './components/QuotedPost.js';
import { SourceFooter } from './components/SourceFooter.js';

interface PostMobileProps {
  post: SocialPost;
  options: RenderOptions;
}

export function PostMobile({ post, options }: PostMobileProps) {
  return (
    <article className="capture post-mobile" data-capture>
      <PostHeader post={post} timezone={options.timezone} showTimestamp={false} actions={<MobileHeaderActions />} />
      <PostText post={post} showTranslation={options.showTranslation} translatedText={options.translatedText} />
      <MediaGrid media={post.media} mode={options.mediaMode} />
      <Poll poll={post.poll} />
      <QuotedPost post={post.quote} timezone={options.timezone} mediaMode={options.mediaMode} translatedText={options.translatedText} />
      {options.showTimestamp ? <MobileDetailMeta post={post} timezone={options.timezone} /> : null}
      {options.showStats ? <MobileActionBar post={post} /> : null}
      {options.showSourceFooter ? <SourceFooter post={post} /> : null}
    </article>
  );
}

function MobileHeaderActions() {
  return (
    <div className="mobile-header-actions">
      <button className="subscribe-button" type="button">
        Subscribe
      </button>
      <button className="icon-button" type="button" aria-label="Grok">
        <GrokIcon />
      </button>
      <button className="icon-button more-button" type="button" aria-label="More">
        <span />
        <span />
        <span />
      </button>
    </div>
  );
}

function GrokIcon() {
  return (
    <svg viewBox="0 0 33 32" aria-hidden="true">
      <path d="M12.745 20.54l10.97-8.19c.539-.4 1.307-.244 1.564.38 1.349 3.288.746 7.241-1.938 9.955-2.683 2.714-6.417 3.31-9.83 1.954l-3.728 1.745c5.347 3.697 11.84 2.782 15.898-1.324 3.219-3.255 4.216-7.692 3.284-11.693l.008.009c-1.351-5.878.332-8.227 3.782-13.031L33 0l-4.54 4.59v-.014L12.743 20.544m-2.263 1.987c-3.837-3.707-3.175-9.446.1-12.755 2.42-2.449 6.388-3.448 9.852-1.979l3.72-1.737c-.67-.49-1.53-1.017-2.515-1.387-4.455-1.854-9.789-.931-13.41 2.728-3.483 3.523-4.579 8.94-2.697 13.561 1.405 3.454-.899 5.898-3.22 8.364C1.49 30.2.666 31.074 0 32l10.478-9.466" />
    </svg>
  );
}

function MobileDetailMeta({ post, timezone }: { post: SocialPost; timezone: string }) {
  const views = formatCompactMetric(post.metrics?.views);
  return (
    <div className="mobile-detail-meta">
      {formatPostDetailDate(post.createdAt, timezone)}
      {views ? (
        <>
          {' · '}
          <strong>{views}</strong> Views
        </>
      ) : null}
    </div>
  );
}

function MobileActionBar({ post }: { post: SocialPost }) {
  const reposts = (post.metrics?.reposts ?? 0) + (post.metrics?.quotes ?? 0);
  return (
    <div className="mobile-actions">
      <MobileAction label="Replies" value={post.metrics?.replies} icon="reply" />
      <MobileAction label="Reposts" value={reposts || undefined} icon="repost" />
      <MobileAction label="Likes" value={post.metrics?.likes} icon="like" />
      <MobileAction label="Bookmarks" value={post.metrics?.bookmarks} icon="bookmark" />
      <MobileAction label="Share" icon="share" />
    </div>
  );
}

function MobileAction({
  label,
  value,
  icon,
}: {
  label: string;
  value?: number | undefined;
  icon: 'reply' | 'repost' | 'like' | 'bookmark' | 'share';
}) {
  return (
    <div className="mobile-action" aria-label={label}>
      <ActionIcon name={icon} />
      {value !== undefined ? <strong>{formatMetric(value)}</strong> : null}
    </div>
  );
}

function ActionIcon({ name }: { name: 'reply' | 'repost' | 'like' | 'bookmark' | 'share' }) {
  if (name === 'reply') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 12a7.5 7.5 0 0 1-7.9 7.5 8.3 8.3 0 0 1-3.2-.8L4 20l1.4-4.4A7.3 7.3 0 0 1 4 12a7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 8 7.5Z" />
      </svg>
    );
  }
  if (name === 'repost') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17 3l3 3-3 3" />
        <path d="M4 11V8a2 2 0 0 1 2-2h14" />
        <path d="M7 21l-3-3 3-3" />
        <path d="M20 13v3a2 2 0 0 1-2 2H4" />
      </svg>
    );
  }
  if (name === 'like') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 8.9c0 5.1-8.5 10.2-8.5 10.2S3.5 14 3.5 8.9A4.4 4.4 0 0 1 8 4.5a5 5 0 0 1 4 2 5 5 0 0 1 4-2 4.4 4.4 0 0 1 4.5 4.4Z" />
      </svg>
    );
  }
  if (name === 'bookmark') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v11" />
      <path d="M8 8l4-4 4 4" />
      <path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}
