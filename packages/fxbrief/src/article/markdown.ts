import type { ArticleBlock, ArticleEntity, ArticleMedia, SocialArticle } from '../types.js';

export interface ArticleAssetReference {
  media: ArticleMedia;
  markdownPath: string;
}

export interface ArticleMarkdownAssets {
  cover?: ArticleAssetReference;
  media: Map<string, ArticleAssetReference>;
}

export interface ArticleMarkdownOptions {
  assets: ArticleMarkdownAssets;
  includeTitle: boolean;
  includeCover: boolean;
}

export function articleToMarkdown(article: SocialArticle, options: ArticleMarkdownOptions): string {
  const entityMap = new Map(article.entities.map((entity) => [entity.key, entity]));
  const parts: string[] = [];

  if (options.includeTitle) {
    parts.push(`# ${article.title}`);
  }

  if (options.includeCover && options.assets.cover) {
    parts.push(renderImage(options.assets.cover, 'cover'));
  }

  for (const block of article.blocks) {
    const rendered = renderBlock(block, entityMap, options.assets);
    if (rendered.length === 0) continue;

    const previous = parts.at(-1);
    if (isListItem(rendered) && previous && isListItem(previous)) {
      parts[parts.length - 1] = `${previous}\n${rendered}`;
    } else {
      parts.push(rendered);
    }
  }

  return `${parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

function renderBlock(block: ArticleBlock, entityMap: Map<string, ArticleEntity>, assets: ArticleMarkdownAssets): string {
  if (block.type === 'atomic') {
    return renderAtomicBlock(block, entityMap, assets);
  }

  const text = renderInlineText(block, entityMap);
  if (text.length === 0) return '';

  switch (block.type) {
    case 'header-one':
      return `# ${text}`;
    case 'header-two':
      return `## ${text}`;
    case 'header-three':
      return `### ${text}`;
    case 'header-four':
      return `#### ${text}`;
    case 'header-five':
      return `##### ${text}`;
    case 'header-six':
      return `###### ${text}`;
    case 'unordered-list-item':
      return `- ${text}`;
    case 'ordered-list-item':
      return `1. ${text}`;
    case 'blockquote':
      return text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
    case 'code-block':
      return `\`\`\`\n${block.text}\n\`\`\``;
    default:
      return text;
  }
}

function renderAtomicBlock(block: ArticleBlock, entityMap: Map<string, ArticleEntity>, assets: ArticleMarkdownAssets): string {
  const range = block.entityRanges[0];
  if (!range) return '';

  const entity = entityMap.get(String(range.key));
  if (!entity) return '';

  if (entity.type === 'MARKDOWN') {
    const markdown = entity.data.markdown;
    return typeof markdown === 'string' ? markdown.trimEnd() : '';
  }

  if (entity.type === 'MEDIA') {
    return renderMediaEntity(entity, assets);
  }

  if (entity.type === 'TWEET') {
    const tweetId = entity.data.tweetId;
    return typeof tweetId === 'string' ? `https://x.com/i/status/${tweetId}` : '';
  }

  return '';
}

function renderMediaEntity(entity: ArticleEntity, assets: ArticleMarkdownAssets): string {
  const mediaItems = Array.isArray(entity.data.mediaItems) ? entity.data.mediaItems : [];
  return mediaItems
    .map((item) => {
      const mediaId = asRecord(item).mediaId;
      if (typeof mediaId !== 'string') return '';
      const asset = assets.media.get(mediaId);
      return asset ? renderImage(asset) : '';
    })
    .filter(Boolean)
    .join('\n\n');
}

function renderInlineText(block: ArticleBlock, entityMap: Map<string, ArticleEntity>): string {
  const text = block.text;
  if (text.length === 0) return '';

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
  let output = '';

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index] ?? 0;
    const end = points[index + 1] ?? start;
    if (end <= start) continue;

    const segment = text.slice(start, end);
    const activeStyles = block.inlineStyleRanges.filter((range) => range.offset <= start && range.offset + range.length >= end);
    const activeEntityRange = block.entityRanges.find((range) => range.offset <= start && range.offset + range.length >= end);
    const entity = activeEntityRange ? entityMap.get(String(activeEntityRange.key)) : undefined;

    let rendered = applyInlineStyles(segment, activeStyles.map((range) => range.style));
    if (entity?.type === 'LINK' && typeof entity.data.url === 'string') {
      rendered = `[${rendered}](${entity.data.url})`;
    }
    output += rendered;
  }

  return output;
}

function applyInlineStyles(segment: string, styles: string[]): string {
  const normalized = new Set(styles.map((style) => style.toUpperCase()));
  let rendered = segment;

  if (normalized.has('CODE')) rendered = wrapMarkdown(rendered, '`');
  if (normalized.has('BOLD')) rendered = wrapMarkdown(rendered, '**');
  if (normalized.has('ITALIC')) rendered = wrapMarkdown(rendered, '*');
  if (normalized.has('STRIKETHROUGH')) rendered = wrapMarkdown(rendered, '~~');

  return rendered;
}

function wrapMarkdown(value: string, marker: string): string {
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const core = value.slice(leading.length, value.length - trailing.length);
  if (core.length === 0) return value;
  return `${leading}${marker}${core}${marker}${trailing}`;
}

function renderImage(asset: ArticleAssetReference, fallbackAlt?: string): string {
  const alt = asset.media.altText?.trim() || fallbackAlt || '';
  return `![${escapeImageAlt(alt)}](${asset.markdownPath})`;
}

function isListItem(value: string): boolean {
  return value.startsWith('- ') || /^\d+\. /.test(value);
}

function escapeImageAlt(value: string): string {
  return value.replace(/]/g, '\\]');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
