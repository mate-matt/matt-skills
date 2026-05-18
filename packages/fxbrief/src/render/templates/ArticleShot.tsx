import type { ReactNode } from 'react';
import type { ArticleBlock, ArticleEntity, ArticleMedia, ArticleShotRenderOptions, SocialArticle } from '../../types.js';
import { formatCompactMetric, formatPostDetailDate } from '../../utils/format.js';
import { Avatar } from './components/Avatar.js';
import { SourceFooter } from './components/SourceFooter.js';
import { VerificationBadge } from './components/VerificationBadge.js';

interface ArticleShotProps {
  article: SocialArticle;
  options: ArticleShotRenderOptions;
}

export function ArticleShot({ article, options }: ArticleShotProps) {
  return (
    <article className={`capture article-shot ${options.style}`} data-capture>
      {options.style === 'article-x' ? <ArticleXChrome article={article} options={options} /> : <ArticleCleanChrome article={article} options={options} />}
      {options.showSourceFooter ? <ArticleSourceFooter article={article} /> : null}
    </article>
  );
}

function ArticleXChrome({ article, options }: ArticleShotProps) {
  return (
    <>
      <div className="article-topbar">
        <Icon name="back" />
        <div className="article-topbar-title">Article</div>
        <Icon name="expand" />
      </div>
      <ArticleAuthorRow article={article} showActions={options.showActions} />
      <ArticleCover article={article} showCover={options.showCover} />
      <h1 className="article-title">{article.title}</h1>
      {options.showActions ? <ArticleActionBar article={article} /> : null}
      <ArticleMeta article={article} timezone={options.timezone} />
      <ArticleBody article={article} />
    </>
  );
}

function ArticleCleanChrome({ article, options }: ArticleShotProps) {
  return (
    <>
      <div className="article-clean-kicker">X Article</div>
      <ArticleCover article={article} showCover={options.showCover} />
      <h1 className="article-title">{article.title}</h1>
      <div className="article-clean-byline">
        <ArticleAuthorIdentity article={article} />
        <ArticleMeta article={article} timezone={options.timezone} />
      </div>
      <ArticleBody article={article} />
    </>
  );
}

function ArticleAuthorRow({ article, showActions }: { article: SocialArticle; showActions: boolean }) {
  return (
    <div className="article-author-row">
      <ArticleAuthorIdentity article={article} />
      {showActions ? (
        <div className="article-header-actions">
          <button className="article-boost-button" type="button">
            Boost
          </button>
          <button className="article-icon-button" type="button" aria-label="Grok">
            <GrokIcon />
          </button>
          <button className="article-icon-button article-more-button" type="button" aria-label="More">
            <span />
            <span />
            <span />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ArticleAuthorIdentity({ article }: { article: SocialArticle }) {
  return (
    <div className="article-author-identity">
      <Avatar author={article.author} />
      <div className="article-author-text">
        <div className="article-author-name-line">
          <span className="article-author-name">{article.author.name}</span>
          <VerificationBadge author={article.author} />
        </div>
        <div className="article-author-handle">@{article.author.handle}</div>
      </div>
    </div>
  );
}

function ArticleCover({ article, showCover }: { article: SocialArticle; showCover: boolean }) {
  if (!showCover || !article.cover) return null;
  return <ArticleImage media={article.cover} className="article-cover" altFallback="cover" />;
}

function ArticleBody({ article }: { article: SocialArticle }) {
  const entityMap = new Map(article.entities.map((entity) => [entity.key, entity]));
  const mediaMap = new Map(article.media.map((media) => [media.mediaId, media]));
  const nodes: ReactNode[] = [];
  let orderedIndex = 1;

  for (let index = 0; index < article.blocks.length; index += 1) {
    const block = article.blocks[index];
    if (!block) continue;
    const rendered = renderBlock(block, entityMap, mediaMap, orderedIndex);
    if (rendered === null) continue;
    nodes.push(<BlockWrapper key={block.key ?? index}>{rendered}</BlockWrapper>);
    orderedIndex = block.type === 'ordered-list-item' ? orderedIndex + 1 : 1;
  }

  return <div className="article-body">{nodes}</div>;
}

function BlockWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function renderBlock(
  block: ArticleBlock,
  entityMap: Map<string, ArticleEntity>,
  mediaMap: Map<string, ArticleMedia>,
  orderedIndex: number,
): ReactNode | null {
  if (block.type === 'atomic') return renderAtomicBlock(block, entityMap, mediaMap);

  const text = renderInlineText(block, entityMap);
  if (text.length === 0) return null;

  switch (block.type) {
    case 'header-one':
      return <h2 className="article-heading article-heading-one">{text}</h2>;
    case 'header-two':
      return <h2 className="article-heading">{text}</h2>;
    case 'header-three':
    case 'header-four':
    case 'header-five':
    case 'header-six':
      return <h3 className="article-subheading">{text}</h3>;
    case 'unordered-list-item':
      return (
        <div className="article-list-item">
          <span className="article-list-marker">•</span>
          <div>{text}</div>
        </div>
      );
    case 'ordered-list-item':
      return (
        <div className="article-list-item">
          <span className="article-list-marker">{orderedIndex}.</span>
          <div>{text}</div>
        </div>
      );
    case 'blockquote':
      return <blockquote className="article-blockquote">{text}</blockquote>;
    case 'code-block':
      return (
        <pre className="article-code">
          <code>{block.text}</code>
        </pre>
      );
    default:
      return <p className="article-paragraph">{text}</p>;
  }
}

function renderAtomicBlock(
  block: ArticleBlock,
  entityMap: Map<string, ArticleEntity>,
  mediaMap: Map<string, ArticleMedia>,
): ReactNode | null {
  const range = block.entityRanges[0];
  if (!range) return null;

  const entity = entityMap.get(String(range.key));
  if (!entity) return null;

  if (entity.type === 'MEDIA') {
    const mediaItems = Array.isArray(entity.data.mediaItems) ? entity.data.mediaItems : [];
    const images = mediaItems
      .map((item) => {
        const mediaId = asRecord(item).mediaId;
        return typeof mediaId === 'string' ? mediaMap.get(mediaId) : undefined;
      })
      .filter(isDefined);

    if (images.length === 0) return null;
    return (
      <figure className={`article-media article-media-count-${Math.min(images.length, 4)}`}>
        {images.map((media) => (
          <ArticleImage key={media.mediaId} media={media} className="article-inline-image" />
        ))}
      </figure>
    );
  }

  if (entity.type === 'MARKDOWN') {
    const markdown = entity.data.markdown;
    return typeof markdown === 'string' && markdown.trim().length > 0 ? <MarkdownBlock markdown={markdown} /> : null;
  }

  if (entity.type === 'TWEET') {
    const tweetId = entity.data.tweetId;
    return typeof tweetId === 'string' ? <div className="article-embed-link">https://x.com/i/status/{tweetId}</div> : null;
  }

  return null;
}

function MarkdownBlock({ markdown }: { markdown: string }) {
  const parsed = parseCodeFence(markdown);
  if (parsed) {
    return (
      <pre className="article-code">
        {parsed.language ? <span className="article-code-language">{parsed.language}</span> : null}
        <code>{parsed.code}</code>
      </pre>
    );
  }

  return <pre className="article-markdown">{markdown.trimEnd()}</pre>;
}

function ArticleImage({ media, className, altFallback }: { media: ArticleMedia; className: string; altFallback?: string }) {
  const src = media.assetUrl ?? media.url;
  const alt = media.altText ?? altFallback ?? '';
  return (
    <div className={className}>
      <img src={src} alt={alt} />
      {media.type !== 'image' ? <span className="article-media-badge">{media.type}</span> : null}
    </div>
  );
}

function renderInlineText(block: ArticleBlock, entityMap: Map<string, ArticleEntity>): ReactNode[] {
  const text = block.text;
  if (text.length === 0) return [];

  const boundaries = new Set<number>([0, text.length]);
  for (const range of block.inlineStyleRanges) {
    boundaries.add(clamp(range.offset, 0, text.length));
    boundaries.add(clamp(range.offset + range.length, 0, text.length));
  }
  for (const range of block.entityRanges) {
    boundaries.add(clamp(range.offset, 0, text.length));
    boundaries.add(clamp(range.offset + range.length, 0, text.length));
  }

  const points = [...boundaries].sort((a, b) => a - b);
  const nodes: ReactNode[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index] ?? 0;
    const end = points[index + 1] ?? start;
    if (end <= start) continue;

    const segment = text.slice(start, end);
    const activeStyles = block.inlineStyleRanges.filter((range) => range.offset <= start && range.offset + range.length >= end);
    const activeEntityRange = block.entityRanges.find((range) => range.offset <= start && range.offset + range.length >= end);
    const entity = activeEntityRange ? entityMap.get(String(activeEntityRange.key)) : undefined;

    nodes.push(renderInlineSegment(segment, activeStyles.map((range) => range.style), entity, `${start}-${end}`));
  }

  return nodes;
}

function renderInlineSegment(segment: string, styles: string[], entity: ArticleEntity | undefined, key: string): ReactNode {
  const normalized = new Set(styles.map((style) => style.toUpperCase()));
  let node: ReactNode = segment;

  if (normalized.has('CODE')) node = <code>{node}</code>;
  if (normalized.has('BOLD')) node = <strong>{node}</strong>;
  if (normalized.has('ITALIC')) node = <em>{node}</em>;
  if (normalized.has('STRIKETHROUGH')) node = <s>{node}</s>;
  if (entity?.type === 'LINK' && typeof entity.data.url === 'string') {
    node = (
      <a className="article-link" href={entity.data.url}>
        {node}
      </a>
    );
  }

  return <span key={key}>{node}</span>;
}

function ArticleActionBar({ article }: { article: SocialArticle }) {
  const metrics = article.sourceMetrics;
  const reposts = (metrics?.reposts ?? 0) + (metrics?.quotes ?? 0);
  return (
    <div className="article-actions">
      <ArticleAction label="Replies" value={metrics?.replies} icon="reply" />
      <ArticleAction label="Reposts" value={reposts || undefined} icon="repost" />
      <ArticleAction label="Likes" value={metrics?.likes} icon="like" highlight />
      <ArticleAction label="Views" value={metrics?.views} icon="views" />
      <ArticleAction label="Bookmarks" value={metrics?.bookmarks} icon="bookmark" />
      <ArticleAction label="Share" icon="share" />
    </div>
  );
}

function ArticleAction({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value?: number | undefined;
  icon: 'reply' | 'repost' | 'like' | 'views' | 'bookmark' | 'share';
  highlight?: boolean;
}) {
  return (
    <div className={`article-action ${highlight ? 'is-highlighted' : ''}`} aria-label={label}>
      <ActionIcon name={icon} />
      {value !== undefined ? <span>{formatCompactMetric(value)}</span> : null}
    </div>
  );
}

function ArticleMeta({ article, timezone }: { article: SocialArticle; timezone: string }) {
  const date = article.sourceCreatedAt ?? article.createdAt;
  return <div className="article-meta">{formatPostDetailDate(date, timezone)}</div>;
}

function ArticleSourceFooter({ article }: { article: SocialArticle }) {
  return (
    <SourceFooter
      post={{
        provider: article.provider,
        id: article.sourcePostId,
        url: article.sourceUrl,
        text: article.title,
        createdAt: article.sourceCreatedAt ?? article.createdAt,
        author: article.author,
        media: [],
        sourceLabel: article.provider === 'x' ? 'X' : article.provider,
      }}
    />
  );
}

function Icon({ name }: { name: 'back' | 'expand' }) {
  if (name === 'back') {
    return (
      <svg className="article-topbar-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 12H5" />
        <path d="m12 5-7 7 7 7" />
      </svg>
    );
  }

  return (
    <svg className="article-topbar-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 3H3v5" />
      <path d="M3 3l7 7" />
      <path d="M16 21h5v-5" />
      <path d="m21 21-7-7" />
    </svg>
  );
}

function GrokIcon() {
  return (
    <svg viewBox="0 0 33 32" aria-hidden="true">
      <path d="M12.745 20.54l10.97-8.19c.539-.4 1.307-.244 1.564.38 1.349 3.288.746 7.241-1.938 9.955-2.683 2.714-6.417 3.31-9.83 1.954l-3.728 1.745c5.347 3.697 11.84 2.782 15.898-1.324 3.219-3.255 4.216-7.692 3.284-11.693l.008.009c-1.351-5.878.332-8.227 3.782-13.031L33 0l-4.54 4.59v-.014L12.743 20.544m-2.263 1.987c-3.837-3.707-3.175-9.446.1-12.755 2.42-2.449 6.388-3.448 9.852-1.979l3.72-1.737c-.67-.49-1.53-1.017-2.515-1.387-4.455-1.854-9.789-.931-13.41 2.728-3.483 3.523-4.579 8.94-2.697 13.561 1.405 3.454-.899 5.898-3.22 8.364C1.49 30.2.666 31.074 0 32l10.478-9.466" />
    </svg>
  );
}

function ActionIcon({ name }: { name: 'reply' | 'repost' | 'like' | 'views' | 'bookmark' | 'share' }) {
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
  if (name === 'views') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20V8" />
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

function parseCodeFence(markdown: string): { language?: string; code: string } | undefined {
  const match = markdown.trim().match(/^```([A-Za-z0-9_-]+)?\n([\s\S]*?)\n?```$/);
  if (!match) return undefined;
  const language = match[1];
  const code = match[2] ?? '';
  return language ? { language, code } : { code };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
