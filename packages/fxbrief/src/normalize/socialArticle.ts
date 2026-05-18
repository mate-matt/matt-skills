import type {
  ArticleBlock,
  ArticleEntity,
  ArticleEntityRange,
  ArticleInlineStyleRange,
  ArticleMedia,
  ProviderName,
  SocialArticle,
  SocialAuthor,
} from '../types.js';

export function normalizeArticleResponse(raw: unknown, provider: ProviderName = 'x'): SocialArticle {
  const envelope = asRecord(raw);
  const status = asRecord(envelope.status ?? raw);
  const article = asRecord(status.article);
  if (Object.keys(article).length === 0) {
    throw new Error('FxEmbed status payload does not contain an X Article.');
  }

  const sourcePostId = requiredString(status.id, 'status.id');
  const author = normalizeArticleAuthor(status.author);
  const content = asRecord(article.content);
  const blocks = Array.isArray(content.blocks) ? content.blocks.map(normalizeBlock) : [];
  const entities = normalizeEntityMap(content.entityMap);
  const media = Array.isArray(article.media_entities) ? article.media_entities.map((item) => normalizeArticleMedia(item)).filter(isDefined) : [];
  const cover = normalizeArticleMedia(article.cover_media, 'cover');

  const normalized: SocialArticle = {
    provider,
    sourcePostId,
    sourceUrl: asString(status.url) ?? `https://x.com/${author.handle}/status/${sourcePostId}`,
    articleId: requiredString(article.id, 'article.id'),
    title: requiredString(article.title, 'article.title'),
    previewText: asString(article.preview_text) ?? '',
    createdAt: requiredString(article.created_at, 'article.created_at'),
    author,
    blocks,
    entities,
    media,
  };

  const modifiedAt = asString(article.modified_at);
  if (modifiedAt !== undefined) normalized.modifiedAt = modifiedAt;
  if (cover !== undefined) normalized.cover = cover;

  return normalized;
}

function normalizeArticleAuthor(raw: unknown): SocialAuthor {
  const record = asRecord(raw);
  const verification = asRecord(record.verification);
  const handle = stripAt(asString(record.screen_name) ?? asString(record.handle) ?? 'unknown');
  const author: SocialAuthor = {
    name: asString(record.name) ?? handle,
    handle,
  };

  const id = asString(record.id);
  if (id !== undefined) author.id = id;
  const avatarUrl = asString(record.avatar_url);
  if (avatarUrl !== undefined) author.avatarUrl = avatarUrl;
  const verified = asBoolean(verification.verified);
  if (verified !== undefined) author.verified = verified;

  const verificationType = asString(verification.type);
  if (verificationType === 'organization' || verificationType === 'government' || verificationType === 'individual') {
    author.verificationType = verificationType;
  } else if (verification.type === null) {
    author.verificationType = null;
  }

  return author;
}

function normalizeBlock(raw: unknown): ArticleBlock {
  const record = asRecord(raw);
  const block: ArticleBlock = {
    type: asString(record.type) ?? 'unstyled',
    text: typeof record.text === 'string' ? record.text : '',
    inlineStyleRanges: Array.isArray(record.inlineStyleRanges)
      ? record.inlineStyleRanges.map(normalizeInlineStyleRange).filter(isDefined)
      : [],
    entityRanges: Array.isArray(record.entityRanges) ? record.entityRanges.map(normalizeEntityRange).filter(isDefined) : [],
    data: asRecord(record.data),
  };

  const key = asString(record.key);
  if (key !== undefined) block.key = key;
  return block;
}

function normalizeInlineStyleRange(raw: unknown): ArticleInlineStyleRange | undefined {
  const record = asRecord(raw);
  const offset = asNumber(record.offset);
  const length = asNumber(record.length);
  const style = asString(record.style);
  if (offset === undefined || length === undefined || style === undefined) return undefined;
  return { offset, length, style };
}

function normalizeEntityRange(raw: unknown): ArticleEntityRange | undefined {
  const record = asRecord(raw);
  const offset = asNumber(record.offset);
  const length = asNumber(record.length);
  const key = asNumber(record.key);
  if (offset === undefined || length === undefined || key === undefined) return undefined;
  return { offset, length, key };
}

function normalizeEntityMap(raw: unknown): ArticleEntity[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeEntity).filter(isDefined);
  }

  const record = asRecord(raw);
  return Object.entries(record)
    .map(([key, value]) => normalizeEntity({ key, value }))
    .filter(isDefined);
}

function normalizeEntity(raw: unknown): ArticleEntity | undefined {
  const record = asRecord(raw);
  const key = asString(record.key);
  const value = asRecord(record.value);
  const type = asString(value.type);
  if (key === undefined || type === undefined) return undefined;
  return {
    key,
    type,
    data: asRecord(value.data),
  };
}

function normalizeArticleMedia(raw: unknown, fallbackMediaId?: string): ArticleMedia | undefined {
  const record = asRecord(raw);
  const mediaInfo = asRecord(record.media_info);
  const typename = asString(mediaInfo.__typename);
  const url = asString(mediaInfo.original_img_url) ?? asString(mediaInfo.media_url_https) ?? asString(mediaInfo.url);
  if (url === undefined) return undefined;

  const mediaId = asString(record.media_id) ?? asString(record.id) ?? fallbackMediaId;
  if (mediaId === undefined) return undefined;

  const media: ArticleMedia = {
    mediaId,
    type: typename === 'ApiVideo' ? 'video' : typename === 'ApiGif' ? 'gif' : 'image',
    url,
  };

  const id = asString(record.id);
  if (id !== undefined) media.id = id;
  const mediaKey = asString(record.media_key);
  if (mediaKey !== undefined) media.mediaKey = mediaKey;
  const width = asNumber(mediaInfo.original_img_width) ?? asNumber(asRecord(mediaInfo.original_info).width);
  if (width !== undefined) media.width = width;
  const height = asNumber(mediaInfo.original_img_height) ?? asNumber(asRecord(mediaInfo.original_info).height);
  if (height !== undefined) media.height = height;
  const altText = asString(mediaInfo.ext_alt_text);
  if (altText !== undefined) media.altText = altText;

  return media;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function requiredString(value: unknown, fieldName: string): string {
  const stringValue = asString(value);
  if (stringValue === undefined) throw new Error(`FxEmbed article payload is missing ${fieldName}.`);
  return stringValue;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function stripAt(value: string): string {
  return value.startsWith('@') ? value.slice(1) : value;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
