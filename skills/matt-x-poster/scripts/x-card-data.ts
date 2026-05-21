#!/usr/bin/env bun

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type Command = "prepare" | "profile" | "post" | "article";

type Args = {
  command: Command;
  input: string;
  outDir: string;
  lang?: string;
  baseUrl: string;
};

type ProfileContext = {
  id?: string;
  name: string;
  handle: string;
  url: string;
  description?: string;
  avatar_url?: string;
  avatar_local_path?: string;
  banner_url?: string;
  banner_local_path?: string;
  location?: string;
  joined?: string;
  website?: string;
  verified?: boolean;
  verification_type?: string | null;
  metrics: {
    followers?: number;
    following?: number;
    posts?: number;
    media?: number;
    likes?: number;
  };
  display_counts: {
    label: "Following" | "Followers";
    value: number;
    text: string;
  }[];
};

type MediaContext = {
  type: string;
  url: string;
  local_path?: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  alt_text?: string;
};

type PostContext = {
  id: string;
  url: string;
  text: string;
  created_at?: string;
  lang?: string;
  author: {
    name: string;
    handle: string;
    avatar_url?: string;
    verified?: boolean;
    verification_type?: string | null;
  };
  media: MediaContext[];
  quote?: {
    id?: string;
    url?: string;
    text?: string;
    author_name?: string;
    author_handle?: string;
    media: MediaContext[];
  };
  metrics: {
    replies?: number;
    reposts?: number;
    quotes?: number;
    likes?: number;
    views?: number;
    bookmarks?: number;
  };
};

type ArticleContext = {
  source_post_id: string;
  source_url: string;
  article_id?: string;
  title: string;
  preview_text?: string;
  cover_url?: string;
  cover_local_path?: string;
  cover_alt_text?: string;
  created_at?: string;
  modified_at?: string;
  author: {
    name: string;
    handle: string;
    avatar_url?: string;
    verified?: boolean;
  };
  media: MediaContext[];
};

type CardContext = {
  schema_version: "matt-x-poster-card-context-v1";
  generated_at: string;
  source_input: string;
  source_type: "profile" | "post" | "article";
  source_url?: string;
  profile?: ProfileContext;
  post?: PostContext;
  article?: ArticleContext;
  assets: {
    profile_avatar_url?: string;
    profile_avatar_path?: string;
    profile_banner_url?: string;
    profile_banner_path?: string;
    post_media_urls: string[];
    post_media_paths: string[];
    article_media_urls: string[];
    article_media_paths: string[];
  };
  prompt_notes: string[];
  prompt_guards: string[];
};

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    await mkdir(args.outDir, { recursive: true });

    const client = new FxTwitterClient(args.baseUrl);
    const context = await buildContext(client, args);
    await downloadContextAssets(context, args.outDir);
    refreshAssetIndex(context);
    context.prompt_guards = buildPromptGuards(context);
    const manifest = {
      ok: true,
      command: args.command,
      input: args.input,
      out_dir: args.outDir,
      context_path: path.join(args.outDir, "card-context.json"),
      generated_at: context.generated_at,
      source_type: context.source_type,
    };

    await writeJson(path.join(args.outDir, "card-context.json"), context);
    await writeJson(path.join(args.outDir, "manifest.json"), manifest);

    console.log(JSON.stringify(manifest, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ ok: false, error: message }, null, 2));
    process.exit(1);
  }
}

async function buildContext(client: FxTwitterClient, args: Args): Promise<CardContext> {
  const maybeStatusId = tryParseStatusId(args.input);

  if (args.command === "profile" || (args.command === "prepare" && !maybeStatusId)) {
    const handle = parseProfileHandle(args.input);
    const rawProfile = await client.getProfile(handle);
    await writeJson(path.join(args.outDir, "raw-profile.fxembed.json"), rawProfile);
    const profile = normalizeProfile(rawProfile);
    return baseContext(args, "profile", profile.url, { profile });
  }

  const statusId = maybeStatusId ?? parseStatusId(args.input);
  const rawPost = await client.getPost(statusId, args.lang);
  await writeJson(path.join(args.outDir, "raw-post.fxembed.json"), rawPost);

  const rawStatus = asRecord(asRecord(rawPost).status ?? rawPost);
  const article = hasArticle(rawStatus) ? normalizeArticle(rawPost) : undefined;
  const post = normalizePost(rawPost);
  const authorHandle = article?.author.handle ?? post.author.handle ?? parseHandleFromStatusUrl(args.input);
  let profile: ProfileContext | undefined;

  if (authorHandle) {
    try {
      const rawProfile = await client.getProfile(authorHandle);
      await writeJson(path.join(args.outDir, "raw-profile.fxembed.json"), rawProfile);
      profile = normalizeProfile(rawProfile);
    } catch {
      profile = profileFromPostAuthor(post);
    }
  } else {
    profile = profileFromPostAuthor(post);
  }

  if (args.command === "article" && !article) {
    throw new Error("The supplied status does not contain an X Article payload.");
  }

  if (article && (args.command === "article" || args.command === "prepare")) {
    return baseContext(args, "article", article.source_url, { profile, post, article });
  }

  return baseContext(args, "post", post.url, { profile, post });
}

function baseContext(
  args: Args,
  sourceType: CardContext["source_type"],
  sourceUrl: string | undefined,
  values: Pick<CardContext, "profile"> & Partial<Pick<CardContext, "post" | "article">>,
): CardContext {
  const postMediaUrls = values.post?.media.map((item) => item.url).filter(Boolean) ?? [];
  const articleMediaUrls = [
    ...(values.article?.cover_url ? [values.article.cover_url] : []),
    ...(values.article?.media.map((item) => item.url).filter(Boolean) ?? []),
  ];

  return {
    schema_version: "matt-x-poster-card-context-v1",
    generated_at: new Date().toISOString(),
    source_input: args.input,
    source_type: sourceType,
    ...(sourceUrl ? { source_url: sourceUrl } : {}),
    ...values,
    assets: {
      ...(values.profile?.avatar_url ? { profile_avatar_url: values.profile.avatar_url } : {}),
      ...(values.profile?.banner_url ? { profile_banner_url: values.profile.banner_url } : {}),
      post_media_urls: postMediaUrls,
      post_media_paths: [],
      article_media_urls: articleMediaUrls,
      article_media_paths: [],
    },
    prompt_notes: [
      "Use card-context.json as the only factual content source.",
      "Use bundled true X app screenshots from assets/reference-screenshots/ and HTML references from assets/fxbrief-reference/ or assets/static-reference/ only for structure, spacing, hierarchy, and X mobile UI layout cues.",
      "Do not quote or reuse any text, images, metrics, or media from bundled reference screenshots or HTML.",
      "Preserve exact text, handle, profile name, article title, and media relationships from the fetched FxEmbed data.",
    ],
    prompt_guards: buildPromptGuards(values),
  };
}

async function downloadContextAssets(context: CardContext, outDir: string): Promise<void> {
  const mediaDir = path.join(outDir, "media");
  const failures: string[] = [];

  if (context.profile?.avatar_url) {
    const localPath = await downloadAsset(context.profile.avatar_url, mediaDir, "profile-avatar").catch(() => undefined);
    if (localPath) context.profile.avatar_local_path = localPath;
    else failures.push("profile avatar");
  }

  if (context.profile?.banner_url) {
    const localPath = await downloadAsset(context.profile.banner_url, mediaDir, "profile-banner").catch(() => undefined);
    if (localPath) context.profile.banner_local_path = localPath;
    else failures.push("profile banner");
  }

  for (let index = 0; index < (context.post?.media.length ?? 0); index += 1) {
    const item = context.post?.media[index];
    if (!item?.url) continue;
    const localPath = await downloadAsset(item.url, mediaDir, `post-media-${String(index + 1).padStart(2, "0")}`).catch(() => undefined);
    if (localPath) item.local_path = localPath;
    else failures.push(`post media ${index + 1}`);
  }

  if (context.article?.cover_url) {
    const localPath = await downloadAsset(context.article.cover_url, mediaDir, "article-cover").catch(() => undefined);
    if (localPath) context.article.cover_local_path = localPath;
    else failures.push("article cover");
  }

  for (let index = 0; index < (context.article?.media.length ?? 0); index += 1) {
    const item = context.article?.media[index];
    if (!item?.url) continue;
    const localPath = await downloadAsset(item.url, mediaDir, `article-media-${String(index + 1).padStart(2, "0")}`).catch(() => undefined);
    if (localPath) item.local_path = localPath;
    else failures.push(`article media ${index + 1}`);
  }

  if (failures.length > 0) {
    context.prompt_notes.push(`Some remote image assets could not be downloaded: ${failures.join(", ")}. Keep their original URLs in the prompt.`);
  }
}

function refreshAssetIndex(context: CardContext): void {
  context.assets = {
    ...(context.profile?.avatar_url ? { profile_avatar_url: context.profile.avatar_url } : {}),
    ...(context.profile?.avatar_local_path ? { profile_avatar_path: context.profile.avatar_local_path } : {}),
    ...(context.profile?.banner_url ? { profile_banner_url: context.profile.banner_url } : {}),
    ...(context.profile?.banner_local_path ? { profile_banner_path: context.profile.banner_local_path } : {}),
    post_media_urls: context.post?.media.map((item) => item.url).filter(Boolean) ?? [],
    post_media_paths: context.post?.media.map((item) => item.local_path).filter((item): item is string => Boolean(item)) ?? [],
    article_media_urls: [
      ...(context.article?.cover_url ? [context.article.cover_url] : []),
      ...(context.article?.media.map((item) => item.url).filter(Boolean) ?? []),
    ],
    article_media_paths: [
      ...(context.article?.cover_local_path ? [context.article.cover_local_path] : []),
      ...(context.article?.media.map((item) => item.local_path).filter((item): item is string => Boolean(item)) ?? []),
    ],
  };
}

function buildPromptGuards(values: Pick<CardContext, "profile"> & Partial<Pick<CardContext, "post" | "article">>): string[] {
  const guards: string[] = [];
  const displayCounts = values.profile?.display_counts ?? [];

  if (displayCounts.length > 0) {
    const countText = displayCounts.map((item) => item.text).join(" then ");
    guards.push(
      `On the X profile screen, render the profile count row exactly in X order: ${countText}. Use these exact compact count strings from profile.display_counts.text, including K/M suffixes. Never render raw unformatted follower counts, never swap Following and Followers, and do not add a Posts count to this profile count row.`,
    );
  }

  if (values.profile?.avatar_local_path) {
    guards.push(`Use the local avatar image as the strict avatar source: ${values.profile.avatar_local_path}. The X UI avatar should look like a direct circular crop of this image, not a newly invented portrait. Preserve the exact subject type, face, pose, crop, accessories, held objects or text, color/monochrome treatment, and background mood. If fidelity is uncertain, keep the avatar smaller and flatter rather than reimagining it.`);
  }

  if (values.profile?.banner_local_path) {
    guards.push(`Use the local banner only if it improves the profile screen; if the banner is visually plain, the poster atmosphere may reinterpret it while keeping profile facts unchanged.`);
  }

  if (values.post?.media.some((item) => item.local_path)) {
    guards.push("Use local post media paths as strict references for the post's attached image. The media may be embedded in a liquid-glass/holographic frame, but its visible content must match the source media.");
  }

  return guards;
}

async function downloadAsset(url: string, mediaDir: string, basename: string): Promise<string | undefined> {
  if (!/^https?:\/\//i.test(url)) return undefined;
  await mkdir(mediaDir, { recursive: true });
  const response = await fetch(url, {
    headers: { "user-agent": "matt-x-poster/0.1" },
  });
  if (!response.ok) throw new Error(`Image download failed: ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
    throw new Error(`Unexpected image content type: ${contentType}`);
  }
  const ext = extensionFromContentType(contentType) ?? extensionFromUrl(url) ?? "jpg";
  const localPath = path.join(mediaDir, `${basename}.${ext}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 256) throw new Error("Downloaded image is unexpectedly small.");
  await writeFile(localPath, bytes);
  return localPath;
}

function extensionFromContentType(contentType: string): string | undefined {
  if (contentType.includes("jpeg")) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return undefined;
}

function extensionFromUrl(url: string): string | undefined {
  try {
    const match = new URL(url).pathname.match(/\.([A-Za-z0-9]+)$/);
    const ext = match?.[1]?.toLowerCase();
    if (!ext) return undefined;
    return ext === "jpeg" ? "jpg" : ext;
  } catch {
    return undefined;
  }
}

class FxTwitterClient {
  constructor(private readonly baseUrl: string) {}

  async getPost(id: string, lang?: string): Promise<unknown> {
    return this.get(`/2/status/${id}`, {
      about_account: "1",
      ...(lang ? { lang } : {}),
    });
  }

  async getProfile(handle: string): Promise<unknown> {
    return this.get(`/2/profile/${encodeURIComponent(handle)}`, {
      about_account: "1",
    });
  }

  private async get(pathname: string, query: Record<string, string | undefined>): Promise<unknown> {
    const url = new URL(pathname, this.baseUrl);
    for (const [key, value] of Object.entries(query)) {
      if (value) url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "matt-x-poster/0.1 (+https://github.com/mate-matt/matt-skills)",
      },
    });

    const text = await response.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`FxEmbed returned non-JSON response (${response.status}) from ${url.toString()}`);
    }

    const envelope = asRecord(json);
    const code = asNumber(envelope.code);
    if (!response.ok || code === undefined || code < 200 || code >= 300) {
      const message = asString(envelope.message) ?? asString(envelope.error) ?? response.statusText;
      throw new Error(`FxEmbed request failed (${response.status}/${code ?? "unknown"}): ${message}`);
    }

    return json;
  }
}

function normalizeProfile(raw: unknown): ProfileContext {
  const source = asRecord(asRecord(raw).user ?? asRecord(raw).profile ?? raw);
  const handle = stripAt(
    asString(source.screen_name) ??
      asString(source.handle) ??
      asString(source.username) ??
      "",
  );
  if (!handle) throw new Error("FxEmbed profile payload is missing a handle.");

  const website = normalizeWebsite(source.website);
  const verification = asRecord(source.verification);
  const profile: ProfileContext = {
    ...(asString(source.id) ? { id: asString(source.id) } : {}),
    name: asString(source.name) ?? handle,
    handle,
    url: asString(source.url) ?? `https://x.com/${handle}`,
    ...(asString(source.description) ? { description: asString(source.description) } : {}),
    ...(normalizeAvatarUrl(asString(source.avatar_url)) ? { avatar_url: normalizeAvatarUrl(asString(source.avatar_url)) } : {}),
    ...(normalizeBannerUrl(asString(source.banner_url)) ? { banner_url: normalizeBannerUrl(asString(source.banner_url)) } : {}),
    ...(asString(source.location) ? { location: asString(source.location) } : {}),
    ...(asString(source.joined) ? { joined: asString(source.joined) } : {}),
    ...(website ? { website } : {}),
    ...(asBoolean(verification.verified) !== undefined ? { verified: asBoolean(verification.verified) } : {}),
    ...(verification.type === null || asString(verification.type) ? { verification_type: asString(verification.type) ?? null } : {}),
    metrics: {
      ...(asNumber(source.followers) !== undefined ? { followers: asNumber(source.followers) } : {}),
      ...(asNumber(source.following) !== undefined ? { following: asNumber(source.following) } : {}),
      ...(asNumber(source.statuses) !== undefined ? { posts: asNumber(source.statuses) } : {}),
      ...(asNumber(source.media_count) !== undefined ? { media: asNumber(source.media_count) } : {}),
      ...(asNumber(source.likes) !== undefined ? { likes: asNumber(source.likes) } : {}),
    },
    display_counts: buildDisplayCounts({
      following: asNumber(source.following),
      followers: asNumber(source.followers),
    }),
  };
  return profile;
}

function normalizePost(raw: unknown): PostContext {
  const source = asRecord(asRecord(raw).status ?? raw);
  const author = asRecord(source.author);
  const id = requiredString(source.id, "status.id");
  const handle = stripAt(asString(author.screen_name) ?? asString(author.handle) ?? "unknown");
  const verification = asRecord(author.verification);
  const post: PostContext = {
    id,
    url: asString(source.url) ?? `https://x.com/${handle}/status/${id}`,
    text: asString(source.text) ?? asString(asRecord(source.raw_text).text) ?? "",
    ...(asString(source.created_at) ? { created_at: asString(source.created_at) } : {}),
    ...(asString(source.lang) ? { lang: asString(source.lang) } : {}),
    author: {
      name: asString(author.name) ?? handle,
      handle,
      ...(normalizeAvatarUrl(asString(author.avatar_url)) ? { avatar_url: normalizeAvatarUrl(asString(author.avatar_url)) } : {}),
      ...(asBoolean(verification.verified) !== undefined ? { verified: asBoolean(verification.verified) } : {}),
      ...(verification.type === null || asString(verification.type) ? { verification_type: asString(verification.type) ?? null } : {}),
    },
    media: normalizeMedia(source.media),
    metrics: normalizeMetrics(source),
  };

  const quote = normalizeQuote(source.quote);
  if (quote) post.quote = quote;
  return post;
}

function normalizeArticle(raw: unknown): ArticleContext {
  const status = asRecord(asRecord(raw).status ?? raw);
  const article = asRecord(status.article);
  if (Object.keys(article).length === 0) {
    throw new Error("FxEmbed status payload does not contain an X Article.");
  }

  const author = asRecord(status.author);
  const handle = stripAt(asString(author.screen_name) ?? asString(author.handle) ?? "unknown");
  const verification = asRecord(author.verification);
  const cover = normalizeArticleMedia(article.cover_media);
  const mediaEntities = Array.isArray(article.media_entities) ? article.media_entities : [];
  const media = mediaEntities.map(normalizeArticleMedia).filter((item): item is MediaContext => Boolean(item));
  const sourcePostId = requiredString(status.id, "status.id");

  return {
    source_post_id: sourcePostId,
    source_url: asString(status.url) ?? `https://x.com/${handle}/status/${sourcePostId}`,
    ...(asString(article.id) ? { article_id: asString(article.id) } : {}),
    title: requiredString(article.title, "article.title"),
    ...(asString(article.preview_text) ? { preview_text: asString(article.preview_text) } : {}),
    ...(cover?.url ? { cover_url: cover.url } : {}),
    ...(cover?.alt_text ? { cover_alt_text: cover.alt_text } : {}),
    ...(asString(article.created_at) ? { created_at: asString(article.created_at) } : {}),
    ...(asString(article.modified_at) ? { modified_at: asString(article.modified_at) } : {}),
    author: {
      name: asString(author.name) ?? handle,
      handle,
      ...(normalizeAvatarUrl(asString(author.avatar_url)) ? { avatar_url: normalizeAvatarUrl(asString(author.avatar_url)) } : {}),
      ...(asBoolean(verification.verified) !== undefined ? { verified: asBoolean(verification.verified) } : {}),
    },
    media,
  };
}

function normalizeQuote(raw: unknown): PostContext["quote"] | undefined {
  const quote = asRecord(raw);
  if (Object.keys(quote).length === 0 || quote.type === "tombstone") return undefined;
  const author = asRecord(quote.author);
  return {
    ...(asString(quote.id) ? { id: asString(quote.id) } : {}),
    ...(asString(quote.url) ? { url: asString(quote.url) } : {}),
    ...(asString(quote.text) ? { text: asString(quote.text) } : {}),
    ...(asString(author.name) ? { author_name: asString(author.name) } : {}),
    ...(asString(author.screen_name) ? { author_handle: stripAt(asString(author.screen_name) ?? "") } : {}),
    media: normalizeMedia(quote.media),
  };
}

function normalizeMedia(raw: unknown): MediaContext[] {
  const record = asRecord(raw);
  const candidates: unknown[] = [];
  if (Array.isArray(record.all)) candidates.push(...record.all);
  if (candidates.length === 0 && Array.isArray(record.photos)) candidates.push(...record.photos);
  if (candidates.length === 0 && Array.isArray(record.videos)) candidates.push(...record.videos);
  if (isObject(record.external)) candidates.push(record.external);

  const seen = new Set<string>();
  const output: MediaContext[] = [];
  for (const item of candidates) {
    const media = normalizeMediaItem(item);
    if (!media || seen.has(media.url)) continue;
    seen.add(media.url);
    output.push(media);
  }
  return output;
}

function normalizeMediaItem(raw: unknown): MediaContext | undefined {
  const source = asRecord(raw);
  const url = asString(source.url) ?? asString(source.thumbnail_url);
  if (!url) return undefined;
  return {
    type: asString(source.type) ?? "photo",
    url,
    ...(asString(source.thumbnail_url) ? { thumbnail_url: asString(source.thumbnail_url) } : {}),
    ...(asNumber(source.width) !== undefined ? { width: asNumber(source.width) } : {}),
    ...(asNumber(source.height) !== undefined ? { height: asNumber(source.height) } : {}),
    ...(asString(source.altText) ?? asString(source.alt_text) ? { alt_text: asString(source.altText) ?? asString(source.alt_text) } : {}),
  };
}

function normalizeArticleMedia(raw: unknown): MediaContext | undefined {
  const record = asRecord(raw);
  const info = asRecord(record.media_info);
  const url = asString(info.original_img_url) ?? asString(info.media_url_https) ?? asString(info.url);
  if (!url) return undefined;
  return {
    type: asString(info.__typename) === "ApiVideo" ? "video" : "image",
    url,
    ...(asNumber(info.original_img_width) !== undefined ? { width: asNumber(info.original_img_width) } : {}),
    ...(asNumber(info.original_img_height) !== undefined ? { height: asNumber(info.original_img_height) } : {}),
    ...(asString(info.ext_alt_text) ? { alt_text: asString(info.ext_alt_text) } : {}),
  };
}

function normalizeMetrics(source: Record<string, unknown>): PostContext["metrics"] {
  return {
    ...(asNumber(source.replies) !== undefined ? { replies: asNumber(source.replies) } : {}),
    ...(asNumber(source.reposts) !== undefined ? { reposts: asNumber(source.reposts) } : {}),
    ...(asNumber(source.quotes) !== undefined ? { quotes: asNumber(source.quotes) } : {}),
    ...(asNumber(source.likes) !== undefined ? { likes: asNumber(source.likes) } : {}),
    ...(asNumber(source.views) !== undefined ? { views: asNumber(source.views) } : {}),
    ...(asNumber(source.bookmarks) !== undefined ? { bookmarks: asNumber(source.bookmarks) } : {}),
  };
}

function profileFromPostAuthor(post: PostContext): ProfileContext {
  return {
    name: post.author.name,
    handle: post.author.handle,
    url: `https://x.com/${post.author.handle}`,
    ...(post.author.avatar_url ? { avatar_url: post.author.avatar_url } : {}),
    ...(post.author.verified !== undefined ? { verified: post.author.verified } : {}),
    ...(post.author.verification_type !== undefined ? { verification_type: post.author.verification_type } : {}),
    metrics: {},
    display_counts: [],
  };
}

function buildDisplayCounts(metrics: { following?: number; followers?: number }): ProfileContext["display_counts"] {
  const counts: ProfileContext["display_counts"] = [];
  if (metrics.following !== undefined) counts.push({ label: "Following", value: metrics.following, text: `${formatXCompactCount(metrics.following)} Following` });
  if (metrics.followers !== undefined) counts.push({ label: "Followers", value: metrics.followers, text: `${formatXCompactCount(metrics.followers)} Followers` });
  return counts;
}

function formatXCompactCount(value: number): string {
  const abs = Math.abs(value);
  if (abs < 1_000) return String(value);

  const threshold = abs >= 1_000_000 ? 1_000_000 : 1_000;
  const suffix = threshold === 1_000_000 ? "M" : "K";
  const rounded = Math.round((value / threshold) * 10) / 10;

  if (suffix === "K" && Math.abs(rounded) >= 1_000) {
    return `${trimTrailingZero(Math.round((value / 1_000_000) * 10) / 10)}M`;
  }

  return `${trimTrailingZero(rounded)}${suffix}`;
}

function trimTrailingZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

function hasArticle(status: Record<string, unknown>): boolean {
  return Object.keys(asRecord(status.article)).length > 0;
}

function parseArgs(argv: string[]): Args {
  const command = argv[0] as Command | undefined;
  if (!command || !["prepare", "profile", "post", "article"].includes(command)) {
    fail("Usage: bun run scripts/x-card-data.ts <prepare|profile|post|article> <x-url-or-handle> [--out DIR] [--lang zh-cn]");
  }
  const input = argv[1];
  if (!input) fail("Missing X URL, status id, or handle.");

  const defaultId = safeSlug(input);
  const args: Args = {
    command,
    input,
    outDir: path.resolve("output", "matt-x-poster", `${defaultId}-${timestampForPath()}`),
    baseUrl: "https://api.fxtwitter.com",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value) fail(`Missing value for ${token}`);
      return value;
    };
    if (token === "--out" || token === "-o") args.outDir = path.resolve(next());
    else if (token === "--lang") args.lang = next();
    else if (token === "--base-url") args.baseUrl = next();
    else fail(`Unknown argument: ${token}`);
  }

  return args;
}

function parseStatusId(input: string): string {
  const statusId = tryParseStatusId(input);
  if (statusId) return statusId;
  throw new Error(`Could not find a numeric X status id in: ${input}`);
}

function tryParseStatusId(input: string): string | undefined {
  if (/^\d{2,20}$/.test(input)) return input;
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return undefined;
  }
  const match = url.pathname.match(/\/status(?:es)?\/(\d{2,20})(?:\/|$)/);
  return match?.[1];
}

function parseProfileHandle(input: string): string {
  const direct = normalizeHandle(input);
  if (direct) return direct;
  const url = parseUrl(input);
  const first = url.pathname.split("/").filter(Boolean)[0];
  const handle = first ? normalizeHandle(first) : undefined;
  if (!handle) throw new Error(`Could not find an X profile handle in: ${input}`);
  return handle;
}

function parseHandleFromStatusUrl(input: string): string | undefined {
  try {
    const url = parseUrl(input);
    const [first] = url.pathname.split("/").filter(Boolean);
    return first ? normalizeHandle(first) : undefined;
  } catch {
    return undefined;
  }
}

function parseUrl(input: string): URL {
  try {
    return new URL(input);
  } catch {
    throw new Error(`Expected an X URL or numeric status id, got: ${input}`);
  }
}

function normalizeHandle(input: string): string | undefined {
  const value = input.trim().replace(/^@/, "");
  return /^[A-Za-z0-9_]{1,15}$/.test(value) ? value : undefined;
}

function normalizeWebsite(raw: unknown): string | undefined {
  if (typeof raw === "string") return raw;
  const record = asRecord(raw);
  return asString(record.expanded_url) ?? asString(record.display_url) ?? asString(record.url);
}

function normalizeAvatarUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/_normal(\.[a-zA-Z0-9]+)(?:\?.*)?$/, "_400x400$1");
}

function normalizeBannerUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (/pbs\.twimg\.com\/profile_banners\/[^/]+\/[^/]+$/i.test(url)) return `${url}/1500x500`;
  return url;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function asRecord(value: unknown): Record<string, unknown> {
  return isObject(value) ? (value as Record<string, unknown>) : {};
}

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function requiredString(value: unknown, fieldName: string): string {
  const stringValue = asString(value);
  if (stringValue === undefined) throw new Error(`FxEmbed payload is missing ${fieldName}.`);
  return stringValue;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function stripAt(handle: string): string {
  return handle.startsWith("@") ? handle.slice(1) : handle;
}

function safeSlug(value: string): string {
  const status = value.match(/status(?:es)?\/(\d{2,20})/)?.[1];
  if (status) return status;
  return value.replace(/^https?:\/\//, "").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "x";
}

function timestampForPath(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function fail(message: string): never {
  throw new Error(message);
}

main();
