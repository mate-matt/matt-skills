import type {
  ProviderName,
  SocialAuthor,
  SocialMedia,
  SocialMetrics,
  SocialPoll,
  SocialPost,
  SocialThread,
  SocialTranslation,
} from '../types.js';

export function normalizePost(raw: unknown, provider: ProviderName = 'x', depth = 0): SocialPost {
  const source = asRecord(raw);
  const author = normalizeAuthor(source.author, provider);
  const createdAt = asString(source.created_at) ?? timestampToIso(asNumber(source.created_timestamp)) ?? '';
  const text = asString(source.text) ?? asString(asRecord(source.raw_text).text) ?? '';
  const id = asString(source.id) ?? '';

  if (!id) {
    throw new Error('FxEmbed status payload is missing an id.');
  }

  const post: SocialPost = {
    provider,
    id,
    url: asString(source.url) ?? fallbackStatusUrl(provider, author.handle, id),
    text,
    createdAt,
    author,
    media: normalizeMedia(source.media),
    sourceLabel: provider === 'x' ? 'X' : 'Bluesky',
  };

  const createdTimestamp = asNumber(source.created_timestamp);
  if (createdTimestamp !== undefined) post.createdTimestamp = createdTimestamp;

  const metrics = normalizeMetrics(source);
  if (Object.keys(metrics).length > 0) post.metrics = metrics;

  const quoteRaw = source.quote;
  if (depth < 2 && isObject(quoteRaw) && asString(asRecord(quoteRaw).type) !== 'tombstone') {
    try {
      post.quote = normalizePost(quoteRaw, provider, depth + 1);
    } catch {
      // FxEmbed can return tombstones or partial quote bodies; omit them from visual output.
    }
  }

  const poll = normalizePoll(source.poll);
  if (poll) post.poll = poll;

  const translation = normalizeTranslation(source.translation);
  if (translation) post.translation = translation;

  const lang = asString(source.lang);
  if (lang !== undefined) post.lang = lang;

  const sourceName = asString(source.source);
  if (sourceName !== undefined) post.source = sourceName;

  const possiblySensitive = asBoolean(source.possibly_sensitive);
  if (possiblySensitive !== undefined) post.possiblySensitive = possiblySensitive;

  const isPinned = asBoolean(source.is_pinned) ?? asBoolean(source.pinned);
  if (isPinned !== undefined) post.isPinned = isPinned;

  const communityNote = normalizeCommunityNote(source.community_note);
  if (communityNote !== undefined) post.communityNote = communityNote;

  return post;
}

export function normalizeThreadResponse(raw: unknown, provider: ProviderName = 'x'): SocialThread {
  const envelope = asRecord(raw);
  const root = normalizePost(envelope.status, provider);
  const rawThread = Array.isArray(envelope.thread) ? envelope.thread : [];
  const posts = rawThread
    .map((item) => safeNormalizePost(item, provider))
    .filter((post): post is SocialPost => Boolean(post));

  if (!posts.some((post) => post.id === root.id)) {
    posts.unshift(root);
  }

  return {
    provider,
    root,
    posts,
    author: root.author,
  };
}

export function normalizePostResponse(raw: unknown, provider: ProviderName = 'x'): SocialPost {
  const envelope = asRecord(raw);
  return normalizePost(envelope.status ?? raw, provider);
}

export function normalizeQuotesResponse(raw: unknown, provider: ProviderName = 'x'): SocialPost[] {
  const envelope = asRecord(raw);
  const results = Array.isArray(envelope.results) ? envelope.results : [];
  return results.flatMap((item) => extractPosts(item, provider));
}

function extractPosts(raw: unknown, provider: ProviderName): SocialPost[] {
  const record = asRecord(raw);
  if (record.type === 'status' || record.author) {
    const post = safeNormalizePost(record, provider);
    return post ? [post] : [];
  }

  if (isObject(record.status)) {
    const post = safeNormalizePost(record.status, provider);
    return post ? [post] : [];
  }

  if (Array.isArray(record.thread)) {
    return record.thread
      .map((item) => safeNormalizePost(item, provider))
      .filter((post): post is SocialPost => Boolean(post));
  }

  return [];
}

function safeNormalizePost(raw: unknown, provider: ProviderName): SocialPost | undefined {
  try {
    return normalizePost(raw, provider);
  } catch {
    return undefined;
  }
}

function normalizeAuthor(raw: unknown, provider: ProviderName): SocialAuthor {
  const record = asRecord(raw);
  const handle = stripAt(
    asString(record.screen_name) ??
      asString(record.handle) ??
      asString(record.username) ??
      asString(record.did) ??
      'unknown',
  );

  const author: SocialAuthor = {
    name: asString(record.name) ?? asString(record.display_name) ?? handle,
    handle,
  };

  const id = asString(record.id);
  if (id !== undefined) author.id = id;

  const avatarUrl = asString(record.avatar_url) ?? asString(record.avatar) ?? asString(record.avatarUrl);
  if (avatarUrl !== undefined) author.avatarUrl = avatarUrl;

  const bannerUrl = asString(record.banner_url) ?? asString(record.bannerUrl);
  if (bannerUrl !== undefined) author.bannerUrl = bannerUrl;

  const description = asString(record.description);
  if (description !== undefined) author.description = description;

  const verification = asRecord(record.verification);
  const verified = asBoolean(verification.verified);
  if (verified !== undefined) author.verified = verified;

  const verificationType = asString(verification.type);
  if (verificationType === 'organization' || verificationType === 'government' || verificationType === 'individual') {
    author.verificationType = verificationType;
  } else if (verification.type === null) {
    author.verificationType = null;
  }

  const followers = asNumber(record.followers);
  if (followers !== undefined) author.followers = followers;

  const following = asNumber(record.following);
  if (following !== undefined) author.following = following;

  const location = asString(record.location);
  if (location !== undefined) author.location = location;

  const joined = asString(record.joined);
  if (joined !== undefined) author.joined = joined;

  if (provider === 'bluesky' && author.handle === 'unknown') author.handle = author.name;
  return author;
}

function normalizeMedia(raw: unknown): SocialMedia[] {
  const record = asRecord(raw);
  const candidates: unknown[] = [];

  if (Array.isArray(record.all)) candidates.push(...record.all);
  if (candidates.length === 0 && Array.isArray(record.photos)) candidates.push(...record.photos);
  if (candidates.length === 0 && Array.isArray(record.videos)) candidates.push(...record.videos);
  if (candidates.length === 0 && isObject(record.mosaic)) candidates.push(record.mosaic);
  if (isObject(record.external)) candidates.push(record.external);

  const seen = new Set<string>();
  const media: SocialMedia[] = [];
  for (const item of candidates) {
    const normalized = normalizeMediaItem(item);
    if (!normalized) continue;
    const key = `${normalized.type}:${normalized.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    media.push(normalized);
  }
  return media;
}

function normalizeMediaItem(raw: unknown): SocialMedia | undefined {
  const record = asRecord(raw);
  const originalType = asString(record.type) ?? 'photo';
  const url = asString(record.url) ?? asString(record.thumbnail_url);
  if (!url) return undefined;

  const mediaType =
    originalType === 'mosaic_photo'
      ? 'mosaic'
      : originalType === 'video'
        ? 'video'
        : originalType === 'gif'
          ? 'gif'
          : originalType === 'external'
            ? 'external'
            : 'photo';

  const media: SocialMedia = {
    type: mediaType,
    url,
  };

  const id = asString(record.id);
  if (id !== undefined) media.id = id;

  const thumbnailUrl = asString(record.thumbnail_url);
  if (thumbnailUrl !== undefined) media.thumbnailUrl = thumbnailUrl;

  const width = asNumber(record.width);
  if (width !== undefined) media.width = width;

  const height = asNumber(record.height);
  if (height !== undefined) media.height = height;

  const altText = asString(record.altText) ?? asString(record.alt_text);
  if (altText !== undefined) media.altText = altText;

  const duration = asNumber(record.duration);
  if (duration !== undefined) media.duration = duration;

  return media;
}

function normalizeMetrics(source: Record<string, unknown>): SocialMetrics {
  const metrics: SocialMetrics = {};
  const replies = asNumber(source.replies);
  if (replies !== undefined) metrics.replies = replies;
  const reposts = asNumber(source.reposts);
  if (reposts !== undefined) metrics.reposts = reposts;
  const quotes = asNumber(source.quotes);
  if (quotes !== undefined) metrics.quotes = quotes;
  const likes = asNumber(source.likes);
  if (likes !== undefined) metrics.likes = likes;
  const views = asNumber(source.views);
  if (views !== undefined) metrics.views = views;
  const bookmarks = asNumber(source.bookmarks);
  if (bookmarks !== undefined) metrics.bookmarks = bookmarks;
  return metrics;
}

function normalizePoll(raw: unknown): SocialPoll | undefined {
  const record = asRecord(raw);
  if (!Array.isArray(record.choices)) return undefined;

  const choices = record.choices
    .map((choice) => {
      const item = asRecord(choice);
      const label = asString(item.label);
      const count = asNumber(item.count);
      const percentage = asNumber(item.percentage);
      if (!label || count === undefined || percentage === undefined) return undefined;
      return { label, count, percentage };
    })
    .filter((choice): choice is { label: string; count: number; percentage: number } => Boolean(choice));

  if (choices.length === 0) return undefined;

  const poll: SocialPoll = {
    choices,
    totalVotes: asNumber(record.total_votes) ?? 0,
  };

  const endsAt = asString(record.ends_at);
  if (endsAt !== undefined) poll.endsAt = endsAt;

  const timeLeft = asString(record.time_left_en);
  if (timeLeft !== undefined) poll.timeLeft = timeLeft;

  return poll;
}

function normalizeTranslation(raw: unknown): SocialTranslation | undefined {
  const record = asRecord(raw);
  const text = asString(record.text);
  if (!text) return undefined;

  const translation: SocialTranslation = { text };
  const sourceLang = asString(record.source_lang);
  if (sourceLang !== undefined) translation.sourceLang = sourceLang;
  const targetLang = asString(record.target_lang);
  if (targetLang !== undefined) translation.targetLang = targetLang;
  const provider = asString(record.provider);
  if (provider !== undefined) translation.provider = provider;
  return translation;
}

function normalizeCommunityNote(raw: unknown): { text: string } | null | undefined {
  if (raw === null) return null;
  const record = asRecord(raw);
  const text = asString(record.text);
  return text ? { text } : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return isObject(value) ? (value as Record<string, unknown>) : {};
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function stripAt(handle: string): string {
  return handle.startsWith('@') ? handle.slice(1) : handle;
}

function timestampToIso(timestamp: number | undefined): string | undefined {
  if (timestamp === undefined) return undefined;
  const millis = timestamp >= 1e12 ? timestamp : timestamp * 1000;
  const date = new Date(millis);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function fallbackStatusUrl(provider: ProviderName, handle: string, id: string): string {
  if (provider === 'x') return `https://x.com/${handle}/status/${id}`;
  return `https://bsky.app/profile/${handle}/post/${id}`;
}
