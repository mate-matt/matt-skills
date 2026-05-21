#!/usr/bin/env node

// src/cli/index.ts
import { Command } from "commander";

// src/cli/commands/article.ts
import { writeFile as writeFile2 } from "fs/promises";
import path4 from "path";

// src/article/assets.ts
import { createHash } from "crypto";
import { writeFile } from "fs/promises";
import path2 from "path";

// src/utils/fs.ts
import { mkdir } from "fs/promises";
import path from "path";
async function ensureParentDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}
async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}
function toAbsolutePath(filePath, cwd = process.cwd()) {
  if (path.isAbsolute(filePath)) return filePath;
  return path.join(cwd, filePath);
}

// src/article/assets.ts
async function prepareArticleAssets(article, options) {
  const mediaMap = /* @__PURE__ */ new Map();
  const manifest = [];
  const coverRef = article.cover ? await prepareOneAsset(article.cover, "cover", 0, options, manifest) : void 0;
  for (let index = 0; index < article.media.length; index += 1) {
    const media = article.media[index];
    if (!media) continue;
    const ref = await prepareOneAsset(media, "media", index + 1, options, manifest);
    if (ref) mediaMap.set(media.mediaId, ref);
  }
  return {
    markdownAssets: {
      ...coverRef ? { cover: coverRef } : {},
      media: mediaMap
    },
    manifest
  };
}
async function prepareOneAsset(media, role, index, options, manifest) {
  if (options.assetMode === "none") {
    return void 0;
  }
  if (options.assetMode === "remote") {
    manifest.push(toManifestItem(media, role, void 0, media.url));
    return { media, markdownPath: media.url };
  }
  const assetDir = path2.join(options.outDir, options.assetsDirName);
  await ensureDir(assetDir);
  const asset = await readAsset(media.url);
  const extension = extensionForAsset(media.url, asset.contentType);
  const basename = role === "cover" ? `cover${extension}` : `image-${String(index).padStart(2, "0")}${extension}`;
  const filePath = path2.join(assetDir, basename);
  await writeFile(filePath, asset.bytes);
  const markdownPath = `${options.assetsDirName}/${basename}`;
  manifest.push(toManifestItem(media, role, filePath, markdownPath));
  return { media, markdownPath };
}
async function readAsset(url) {
  if (url.startsWith("data:")) {
    return readDataUrl(url);
  }
  const response = await fetch(url, {
    headers: {
      accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "user-agent": "fx-brief/0.1"
    }
  });
  if (!response.ok) {
    throw new Error(`Could not download article asset ${url}: ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || "application/octet-stream";
  return { bytes, contentType };
}
function readDataUrl(url) {
  const match = url.match(/^data:([^,]*),(.*)$/);
  if (!match) throw new Error("Invalid data URL asset.");
  const metadata = match[1] || "";
  const parts = metadata.split(";").filter(Boolean);
  const contentType = parts[0] && parts[0].includes("/") ? parts[0] : "application/octet-stream";
  const isBase64 = parts.includes("base64");
  const payload = match[2] ?? "";
  const bytes = isBase64 ? Buffer.from(payload, "base64") : Buffer.from(decodeURIComponent(payload), "utf8");
  return { bytes, contentType };
}
function extensionForAsset(url, contentType) {
  const extFromUrl = extensionFromUrl(url);
  if (extFromUrl) return extFromUrl;
  switch (contentType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    case "image/avif":
      return ".avif";
    default:
      return `.${createHash("sha1").update(contentType).digest("hex").slice(0, 8)}.bin`;
  }
}
function extensionFromUrl(url) {
  try {
    const parsed = new URL(url);
    const ext = path2.extname(parsed.pathname).toLowerCase();
    return ext && ext.length <= 6 ? ext : void 0;
  } catch {
    return void 0;
  }
}
function toManifestItem(media, role, file, markdownPath) {
  const item = {
    role,
    mediaId: media.mediaId,
    sourceUrl: media.url
  };
  if (file !== void 0) item.file = file;
  if (markdownPath !== void 0) item.markdownPath = markdownPath;
  if (media.width !== void 0) item.width = media.width;
  if (media.height !== void 0) item.height = media.height;
  if (media.altText !== void 0) item.altText = media.altText;
  return item;
}

// src/article/markdown.ts
function articleToMarkdown(article, options) {
  const entityMap = new Map(article.entities.map((entity) => [entity.key, entity]));
  const parts = [];
  if (options.includeTitle) {
    parts.push(`# ${article.title}`);
  }
  if (options.includeCover && options.assets.cover) {
    parts.push(renderImage(options.assets.cover, "cover"));
  }
  for (const block of article.blocks) {
    const rendered = renderBlock(block, entityMap, options.assets);
    if (rendered.length === 0) continue;
    const previous = parts.at(-1);
    if (isListItem(rendered) && previous && isListItem(previous)) {
      parts[parts.length - 1] = `${previous}
${rendered}`;
    } else {
      parts.push(rendered);
    }
  }
  return `${parts.join("\n\n").replace(/\n{3,}/g, "\n\n").trimEnd()}
`;
}
function renderBlock(block, entityMap, assets) {
  if (block.type === "atomic") {
    return renderAtomicBlock(block, entityMap, assets);
  }
  const text = renderInlineText(block, entityMap);
  if (text.length === 0) return "";
  switch (block.type) {
    case "header-one":
      return `# ${text}`;
    case "header-two":
      return `## ${text}`;
    case "header-three":
      return `### ${text}`;
    case "header-four":
      return `#### ${text}`;
    case "header-five":
      return `##### ${text}`;
    case "header-six":
      return `###### ${text}`;
    case "unordered-list-item":
      return `- ${text}`;
    case "ordered-list-item":
      return `1. ${text}`;
    case "blockquote":
      return text.split("\n").map((line) => `> ${line}`).join("\n");
    case "code-block":
      return `\`\`\`
${block.text}
\`\`\``;
    default:
      return text;
  }
}
function renderAtomicBlock(block, entityMap, assets) {
  const range = block.entityRanges[0];
  if (!range) return "";
  const entity = entityMap.get(String(range.key));
  if (!entity) return "";
  if (entity.type === "MARKDOWN") {
    const markdown = entity.data.markdown;
    return typeof markdown === "string" ? markdown.trimEnd() : "";
  }
  if (entity.type === "MEDIA") {
    return renderMediaEntity(entity, assets);
  }
  if (entity.type === "TWEET") {
    const tweetId = entity.data.tweetId;
    return typeof tweetId === "string" ? `https://x.com/i/status/${tweetId}` : "";
  }
  return "";
}
function renderMediaEntity(entity, assets) {
  const mediaItems = Array.isArray(entity.data.mediaItems) ? entity.data.mediaItems : [];
  return mediaItems.map((item) => {
    const mediaId = asRecord(item).mediaId;
    if (typeof mediaId !== "string") return "";
    const asset = assets.media.get(mediaId);
    return asset ? renderImage(asset) : "";
  }).filter(Boolean).join("\n\n");
}
function renderInlineText(block, entityMap) {
  const text = block.text;
  if (text.length === 0) return "";
  const boundaries = /* @__PURE__ */ new Set([0, text.length]);
  for (const range of block.inlineStyleRanges) {
    boundaries.add(clamp(range.offset, 0, text.length));
    boundaries.add(clamp(range.offset + range.length, 0, text.length));
  }
  for (const range of block.entityRanges) {
    boundaries.add(clamp(range.offset, 0, text.length));
    boundaries.add(clamp(range.offset + range.length, 0, text.length));
  }
  const points = [...boundaries].sort((a, b) => a - b);
  let output = "";
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index] ?? 0;
    const end = points[index + 1] ?? start;
    if (end <= start) continue;
    const segment = text.slice(start, end);
    const activeStyles = block.inlineStyleRanges.filter((range) => range.offset <= start && range.offset + range.length >= end);
    const activeEntityRange = block.entityRanges.find((range) => range.offset <= start && range.offset + range.length >= end);
    const entity = activeEntityRange ? entityMap.get(String(activeEntityRange.key)) : void 0;
    let rendered = applyInlineStyles(segment, activeStyles.map((range) => range.style));
    if (entity?.type === "LINK" && typeof entity.data.url === "string") {
      rendered = `[${rendered}](${entity.data.url})`;
    }
    output += rendered;
  }
  return output;
}
function applyInlineStyles(segment, styles) {
  const normalized = new Set(styles.map((style) => style.toUpperCase()));
  let rendered = segment;
  if (normalized.has("CODE")) rendered = wrapMarkdown(rendered, "`");
  if (normalized.has("BOLD")) rendered = wrapMarkdown(rendered, "**");
  if (normalized.has("ITALIC")) rendered = wrapMarkdown(rendered, "*");
  if (normalized.has("STRIKETHROUGH")) rendered = wrapMarkdown(rendered, "~~");
  return rendered;
}
function wrapMarkdown(value, marker) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.slice(leading.length, value.length - trailing.length);
  if (core.length === 0) return value;
  return `${leading}${marker}${core}${marker}${trailing}`;
}
function renderImage(asset, fallbackAlt) {
  const alt = asset.media.altText?.trim() || fallbackAlt || "";
  return `![${escapeImageAlt(alt)}](${asset.markdownPath})`;
}
function isListItem(value) {
  return value.startsWith("- ") || /^\d+\. /.test(value);
}
function escapeImageAlt(value) {
  return value.replace(/]/g, "\\]");
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function asRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
}

// src/normalize/socialArticle.ts
function normalizeArticleResponse(raw, provider = "x") {
  const envelope = asRecord2(raw);
  const status = asRecord2(envelope.status ?? raw);
  const article = asRecord2(status.article);
  if (Object.keys(article).length === 0) {
    throw new Error("FxEmbed status payload does not contain an X Article.");
  }
  const sourcePostId = requiredString(status.id, "status.id");
  const author = normalizeArticleAuthor(status.author);
  const content = asRecord2(article.content);
  const blocks = Array.isArray(content.blocks) ? content.blocks.map(normalizeBlock) : [];
  const entities = normalizeEntityMap(content.entityMap);
  const media = Array.isArray(article.media_entities) ? article.media_entities.map((item) => normalizeArticleMedia(item)).filter(isDefined) : [];
  const cover = normalizeArticleMedia(article.cover_media, "cover");
  const normalized = {
    provider,
    sourcePostId,
    sourceUrl: asString(status.url) ?? `https://x.com/${author.handle}/status/${sourcePostId}`,
    articleId: requiredString(article.id, "article.id"),
    title: requiredString(article.title, "article.title"),
    previewText: asString(article.preview_text) ?? "",
    createdAt: requiredString(article.created_at, "article.created_at"),
    author,
    blocks,
    entities,
    media
  };
  const modifiedAt = asString(article.modified_at);
  if (modifiedAt !== void 0) normalized.modifiedAt = modifiedAt;
  const sourceCreatedAt = asString(status.created_at);
  if (sourceCreatedAt !== void 0) normalized.sourceCreatedAt = sourceCreatedAt;
  const sourceMetrics = normalizeSourceMetrics(status);
  if (sourceMetrics !== void 0) normalized.sourceMetrics = sourceMetrics;
  if (cover !== void 0) normalized.cover = cover;
  return normalized;
}
function normalizeArticleAuthor(raw) {
  const record = asRecord2(raw);
  const verification = asRecord2(record.verification);
  const handle = stripAt(asString(record.screen_name) ?? asString(record.handle) ?? "unknown");
  const author = {
    name: asString(record.name) ?? handle,
    handle
  };
  const id = asString(record.id);
  if (id !== void 0) author.id = id;
  const avatarUrl = asString(record.avatar_url);
  if (avatarUrl !== void 0) author.avatarUrl = avatarUrl;
  const verified = asBoolean(verification.verified);
  if (verified !== void 0) author.verified = verified;
  const verificationType = asString(verification.type);
  if (verificationType === "organization" || verificationType === "government" || verificationType === "individual") {
    author.verificationType = verificationType;
  } else if (verification.type === null) {
    author.verificationType = null;
  }
  return author;
}
function normalizeBlock(raw) {
  const record = asRecord2(raw);
  const block = {
    type: asString(record.type) ?? "unstyled",
    text: typeof record.text === "string" ? record.text : "",
    inlineStyleRanges: Array.isArray(record.inlineStyleRanges) ? record.inlineStyleRanges.map(normalizeInlineStyleRange).filter(isDefined) : [],
    entityRanges: Array.isArray(record.entityRanges) ? record.entityRanges.map(normalizeEntityRange).filter(isDefined) : [],
    data: asRecord2(record.data)
  };
  const key = asString(record.key);
  if (key !== void 0) block.key = key;
  return block;
}
function normalizeInlineStyleRange(raw) {
  const record = asRecord2(raw);
  const offset = asNumber(record.offset);
  const length = asNumber(record.length);
  const style = asString(record.style);
  if (offset === void 0 || length === void 0 || style === void 0) return void 0;
  return { offset, length, style };
}
function normalizeEntityRange(raw) {
  const record = asRecord2(raw);
  const offset = asNumber(record.offset);
  const length = asNumber(record.length);
  const key = asNumber(record.key);
  if (offset === void 0 || length === void 0 || key === void 0) return void 0;
  return { offset, length, key };
}
function normalizeEntityMap(raw) {
  if (Array.isArray(raw)) {
    return raw.map(normalizeEntity).filter(isDefined);
  }
  const record = asRecord2(raw);
  return Object.entries(record).map(([key, value]) => normalizeEntity({ key, value })).filter(isDefined);
}
function normalizeEntity(raw) {
  const record = asRecord2(raw);
  const key = asString(record.key);
  const value = asRecord2(record.value);
  const type = asString(value.type);
  if (key === void 0 || type === void 0) return void 0;
  return {
    key,
    type,
    data: asRecord2(value.data)
  };
}
function normalizeArticleMedia(raw, fallbackMediaId) {
  const record = asRecord2(raw);
  const mediaInfo = asRecord2(record.media_info);
  const typename = asString(mediaInfo.__typename);
  const url = asString(mediaInfo.original_img_url) ?? asString(mediaInfo.media_url_https) ?? asString(mediaInfo.url);
  if (url === void 0) return void 0;
  const mediaId = asString(record.media_id) ?? asString(record.id) ?? fallbackMediaId;
  if (mediaId === void 0) return void 0;
  const media = {
    mediaId,
    type: typename === "ApiVideo" ? "video" : typename === "ApiGif" ? "gif" : "image",
    url
  };
  const id = asString(record.id);
  if (id !== void 0) media.id = id;
  const mediaKey = asString(record.media_key);
  if (mediaKey !== void 0) media.mediaKey = mediaKey;
  const width = asNumber(mediaInfo.original_img_width) ?? asNumber(asRecord2(mediaInfo.original_info).width);
  if (width !== void 0) media.width = width;
  const height = asNumber(mediaInfo.original_img_height) ?? asNumber(asRecord2(mediaInfo.original_info).height);
  if (height !== void 0) media.height = height;
  const altText = asString(mediaInfo.ext_alt_text);
  if (altText !== void 0) media.altText = altText;
  return media;
}
function normalizeSourceMetrics(status) {
  const metrics = {};
  const replies = asNumber(status.replies);
  const reposts = asNumber(status.reposts);
  const quotes = asNumber(status.quotes);
  const likes = asNumber(status.likes);
  const views = asNumber(status.views);
  const bookmarks = asNumber(status.bookmarks);
  if (replies !== void 0) metrics.replies = replies;
  if (reposts !== void 0) metrics.reposts = reposts;
  if (quotes !== void 0) metrics.quotes = quotes;
  if (likes !== void 0) metrics.likes = likes;
  if (views !== void 0) metrics.views = views;
  if (bookmarks !== void 0) metrics.bookmarks = bookmarks;
  return Object.keys(metrics).length > 0 ? metrics : void 0;
}
function asRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
}
function asString(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function requiredString(value, fieldName) {
  const stringValue = asString(value);
  if (stringValue === void 0) throw new Error(`FxEmbed article payload is missing ${fieldName}.`);
  return stringValue;
}
function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function asBoolean(value) {
  return typeof value === "boolean" ? value : void 0;
}
function stripAt(value) {
  return value.startsWith("@") ? value.slice(1) : value;
}
function isDefined(value) {
  return value !== void 0;
}

// src/providers/fxTwitter.ts
import { z } from "zod";
var ApiEnvelopeSchema = z.object({
  code: z.number()
}).passthrough();
var FxTwitterClient = class {
  baseUrl;
  userAgent;
  constructor(options = {}) {
    this.baseUrl = options.baseUrl ?? "https://api.fxtwitter.com";
    this.userAgent = options.userAgent ?? "fx-brief/0.1 (+https://docs.fxembed.com/)";
  }
  async getPost(id, options = {}) {
    return this.get(`/2/status/${id}`, {
      about_account: options.aboutAccount === false ? void 0 : "1",
      lang: options.lang
    });
  }
  async getThread(id, options = {}) {
    return this.get(`/2/thread/${id}`, {
      about_account: options.aboutAccount === false ? void 0 : "1",
      lang: options.lang
    });
  }
  async getQuotes(id, options = {}) {
    return this.get(`/2/status/${id}/quotes`, {
      count: options.count,
      cursor: options.cursor,
      lang: options.lang
    });
  }
  async getProfile(handle, options = {}) {
    return this.get(`/2/profile/${encodeURIComponent(handle)}`, {
      about_account: options.aboutAccount === false ? void 0 : "1"
    });
  }
  async getProfileStatuses(handle, options = {}) {
    return this.get(`/2/profile/${encodeURIComponent(handle)}/statuses`, {
      count: options.count,
      cursor: options.cursor,
      with_replies: options.withReplies ? "1" : void 0,
      groupthreads: options.groupThreads ? "1" : void 0,
      lang: options.lang
    });
  }
  async get(pathname, query) {
    const url = new URL(pathname, this.baseUrl);
    for (const [key, value] of Object.entries(query)) {
      if (value !== void 0 && value !== "") url.searchParams.set(key, String(value));
    }
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": this.userAgent
      }
    });
    if (response.status === 204) {
      return { code: 204, results: [] };
    }
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`FxEmbed returned non-JSON response (${response.status}) from ${url.toString()}`);
    }
    const envelope = ApiEnvelopeSchema.safeParse(json);
    if (!response.ok || !envelope.success || envelope.data.code < 200 || envelope.data.code >= 300) {
      const message = extractErrorMessage(json) ?? response.statusText;
      throw new Error(`FxEmbed request failed (${response.status}/${envelope.success ? envelope.data.code : "unknown"}): ${message}`);
    }
    return json;
  }
};
function extractErrorMessage(value) {
  if (!value || typeof value !== "object") return void 0;
  const record = value;
  const message = record.message ?? record.error ?? record.reason;
  return typeof message === "string" ? message : void 0;
}

// src/providers/parseUrl.ts
var X_HOSTS = /* @__PURE__ */ new Set([
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
  "mobile.twitter.com",
  "fxtwitter.com",
  "www.fxtwitter.com",
  "fixupx.com",
  "www.fixupx.com",
  "twittpr.com",
  "www.twittpr.com"
]);
function parseSocialUrl(input) {
  if (/^\d{2,20}$/.test(input)) {
    return { provider: "x", id: input, originalUrl: input };
  }
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error(`Expected an X/Twitter status URL or numeric status id, got: ${input}`);
  }
  const host = url.hostname.toLowerCase();
  if (X_HOSTS.has(host)) {
    const match = url.pathname.match(/\/status(?:es)?\/(\d{2,20})(?:\/|$)/);
    if (!match?.[1]) {
      throw new Error(`Could not find a numeric status id in URL: ${input}`);
    }
    return { provider: "x", id: match[1], originalUrl: input };
  }
  throw new Error(`Unsupported provider host "${url.hostname}". First version supports X/Twitter via FxEmbed.`);
}
function parseProfileUrl(input) {
  const directHandle = normalizeHandle(input);
  if (directHandle) {
    return { provider: "x", handle: directHandle, originalUrl: input };
  }
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error(`Expected an X/Twitter profile URL or handle, got: ${input}`);
  }
  const host = url.hostname.toLowerCase();
  if (!X_HOSTS.has(host)) {
    throw new Error(`Unsupported provider host "${url.hostname}". First version supports X/Twitter via FxEmbed.`);
  }
  const [firstSegment, secondSegment] = url.pathname.split("/").filter(Boolean);
  if (!firstSegment || secondSegment === "status" || secondSegment === "statuses") {
    throw new Error(`Could not find a profile handle in URL: ${input}`);
  }
  const handle = normalizeHandle(firstSegment);
  if (!handle) {
    throw new Error(`Could not find a profile handle in URL: ${input}`);
  }
  return { provider: "x", handle, originalUrl: input };
}
function normalizeHandle(value) {
  const handle = value.trim().replace(/^@/, "");
  if (/^[A-Za-z0-9_]{1,15}$/.test(handle)) return handle;
  return void 0;
}

// src/cli/options.ts
import { readFile } from "fs/promises";
import path3 from "path";

// src/render/renderHtml.tsx
import { renderToStaticMarkup } from "react-dom/server";

// src/render/styles/article.ts
function buildArticleStyles(options) {
  const dark = options.theme === "dark";
  const colors = dark ? {
    canvas: "#0f1419",
    surface: "#16181c",
    surfaceSoft: "#1f2329",
    text: "#f7f9f9",
    muted: "#8b98a5",
    border: "#2f3336",
    accent: "#1d9bf0",
    code: "#111418"
  } : {
    canvas: "#f6f8fa",
    surface: "#ffffff",
    surfaceSoft: "#f7f9fb",
    text: "#0f1419",
    muted: "#536471",
    border: "#eff3f4",
    accent: "#1d9bf0",
    code: "#f6f8fa"
  };
  return `
:root {
  --capture-width: ${options.width}px;
  --canvas: ${colors.canvas};
  --surface: ${colors.surface};
  --surface-soft: ${colors.surfaceSoft};
  --text: ${colors.text};
  --muted: ${colors.muted};
  --border: ${colors.border};
  --accent: ${colors.accent};
  --code: ${colors.code};
  --shadow-soft: 0 18px 52px rgba(15, 20, 25, ${dark ? "0.38" : "0.13"});
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: transparent;
  color: var(--text);
  font-family: var(--font);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

body {
  min-width: var(--capture-width);
}

a {
  color: inherit;
  text-decoration: none;
}

.capture {
  width: var(--capture-width);
  overflow: hidden;
}

.article-shot {
  background: var(--surface);
}

.article-x {
  padding: 0 20px 20px;
}

.article-clean {
  padding: 34px 38px 28px;
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
}

.article-topbar {
  height: 58px;
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  align-items: center;
  gap: 12px;
}

.article-topbar-title {
  font-size: 24px;
  line-height: 1;
  font-weight: 800;
}

.article-topbar-icon {
  width: 28px;
  height: 28px;
  stroke: var(--text);
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.article-author-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 10px;
  min-width: 0;
}

.article-author-identity,
.article-clean-byline {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.article-clean-byline {
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.article-author-identity .avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex: 0 0 auto;
  overflow: hidden;
  background: linear-gradient(135deg, #e6ecf0, #cfd9de);
  color: #42515c;
  display: grid;
  place-items: center;
  font-size: 15px;
  font-weight: 700;
}

.article-author-identity .avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.article-author-text {
  min-width: 0;
}

.article-author-name-line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.article-author-name {
  font-size: 19px;
  line-height: 1.18;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-author-handle,
.article-meta {
  color: var(--muted);
  font-size: 17px;
  line-height: 1.3;
}

.verified {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 12px;
  font-weight: 800;
  flex: 0 0 auto;
}

.verified-rosette {
  display: inline-flex;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.verified-rosette svg {
  width: 100%;
  height: 100%;
  display: block;
}

.rosette-shape {
  fill: var(--accent);
}

.rosette-check {
  fill: none;
  stroke: white;
  stroke-width: 2.15;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.article-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  flex: 0 0 auto;
}

.article-boost-button,
.article-icon-button {
  border: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  padding: 0;
}

.article-boost-button {
  height: 42px;
  padding: 0 22px;
  border-radius: 999px;
  background: var(--text);
  color: var(--surface);
  font-size: 18px;
  line-height: 42px;
  font-weight: 800;
}

.article-icon-button {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 36px;
  color: var(--text);
}

.article-icon-button svg {
  width: 28px;
  height: 28px;
  fill: currentColor;
}

.article-more-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--muted);
}

.article-more-button span {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: currentColor;
}

.article-clean-kicker {
  color: var(--accent);
  font-size: 13px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.article-cover {
  position: relative;
  margin-top: 28px;
  aspect-ratio: 2 / 0.8;
  overflow: hidden;
  background: var(--surface-soft);
}

.article-clean .article-cover {
  margin-top: 0;
  border-radius: 14px;
  border: 1px solid var(--border);
}

.article-cover img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.article-inline-image img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

.article-title {
  margin: 52px 0 28px;
  color: var(--text);
  font-size: 38px;
  line-height: 1.16;
  font-weight: 900;
}

.article-clean .article-title {
  margin: 28px 0 18px;
  font-size: 36px;
  line-height: 1.18;
}

.article-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.15fr 1fr 1fr;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px;
  padding: 0 0 18px;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
}

.article-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 0;
  height: 30px;
  color: var(--muted);
  font-size: 17px;
  line-height: 1;
  font-weight: 500;
}

.article-action.is-highlighted {
  color: #f91880;
}

.article-action svg {
  width: 22px;
  height: 22px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex: 0 0 auto;
}

.article-meta {
  margin: 0 0 28px;
}

.article-clean-byline .article-meta {
  margin: 0;
}

.article-body {
  padding-top: 0;
}

.article-paragraph,
.article-list-item,
.article-blockquote,
.article-embed-link,
.article-markdown {
  color: var(--text);
  font-size: 22px;
  line-height: 1.76;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.article-paragraph {
  margin: 0 0 28px;
}

.article-heading,
.article-heading-one,
.article-subheading {
  color: var(--text);
  font-weight: 900;
  line-height: 1.26;
}

.article-heading,
.article-heading-one {
  margin: 46px 0 18px;
  font-size: 29px;
}

.article-subheading {
  margin: 34px 0 14px;
  font-size: 24px;
}

.article-list-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  margin: 0 0 18px;
}

.article-list-marker {
  text-align: center;
  color: var(--text);
  font-weight: 800;
}

.article-blockquote {
  margin: 28px 0;
  padding: 8px 0 8px 20px;
  border-left: 4px solid var(--border);
  color: var(--text);
}

.article-link {
  color: var(--accent);
}

.article-paragraph code,
.article-list-item code,
.article-blockquote code {
  font-family: var(--mono);
  font-size: 0.86em;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.06em 0.28em;
}

.article-media {
  position: relative;
  display: grid;
  gap: 8px;
  margin: 30px 0 34px;
}

.article-media-count-2,
.article-media-count-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.article-media-count-3 {
  grid-template-columns: 1.15fr 0.85fr;
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.article-media-count-3 .article-inline-image:first-child {
  grid-row: span 2;
}

.article-inline-image {
  position: relative;
  border-radius: 14px;
  border: 1px solid var(--border);
  overflow: hidden;
  background: var(--surface-soft);
}

.article-media-badge {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  color: white;
  background: rgba(15, 20, 25, 0.72);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.article-code,
.article-markdown {
  position: relative;
  margin: 28px 0 34px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--code);
  color: var(--text);
  font-family: var(--mono);
  font-size: 15px;
  line-height: 1.62;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.article-code code {
  font-family: inherit;
}

.article-code-language {
  display: block;
  margin-bottom: 12px;
  color: var(--muted);
  font-family: var(--font);
  font-size: 12px;
  line-height: 1;
  font-weight: 800;
  text-transform: uppercase;
}

.article-embed-link {
  margin: 24px 0 30px;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface-soft);
  color: var(--accent);
  font-size: 18px;
  line-height: 1.4;
}

.source-footer {
  margin-top: 34px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

@media (max-width: 560px) {
  .article-x {
    padding: 0 18px 18px;
  }

  .article-clean {
    padding: 28px 24px 24px;
    border-radius: 14px;
  }

  .article-title {
    font-size: 34px;
  }

  .article-paragraph,
  .article-list-item,
  .article-blockquote,
  .article-markdown {
    font-size: 21px;
  }
}
`;
}

// src/render/styles/base.ts
function buildStyles(options) {
  const dark = options.theme === "dark";
  const colors = dark ? {
    canvas: "#0f1419",
    surface: "#16181c",
    surfaceSoft: "#1f2329",
    text: "#f7f9f9",
    muted: "#8b98a5",
    border: "#2f3336",
    accent: "#1d9bf0",
    quote: "#1f2329"
  } : {
    canvas: "#f6f8fa",
    surface: "#ffffff",
    surfaceSoft: "#f7f9fb",
    text: "#0f1419",
    muted: "#536471",
    border: "#dce3ea",
    accent: "#1d9bf0",
    quote: "#f7f9fb"
  };
  return `
:root {
  --capture-width: ${options.width}px;
  --canvas: ${colors.canvas};
  --surface: ${colors.surface};
  --surface-soft: ${colors.surfaceSoft};
  --text: ${colors.text};
  --muted: ${colors.muted};
  --border: ${colors.border};
  --accent: ${colors.accent};
  --quote: ${colors.quote};
  --shadow-soft: 0 14px 40px rgba(15, 20, 25, ${dark ? "0.35" : "0.12"});
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: transparent;
  color: var(--text);
  font-family: var(--font);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

body {
  min-width: var(--capture-width);
}

a {
  color: inherit;
  text-decoration: none;
}

.capture {
  width: var(--capture-width);
  overflow: hidden;
}

.post-mobile {
  background: var(--surface);
  border: 0;
  border-radius: 0;
  padding: 16px 18px 12px;
}

.post-clean {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 22px;
  box-shadow: var(--shadow-soft);
}

.thread-vertical {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 0;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}

.quote-wall {
  background: var(--canvas);
  border-radius: 20px;
  padding: 22px;
}

.header-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.header-row.no-avatar {
  gap: 0;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  flex: 0 0 auto;
  background: linear-gradient(135deg, #e6ecf0, #cfd9de);
  color: #42515c;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 14px;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.author-block {
  min-width: 0;
  flex: 1;
}

.author-line {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.author-name {
  color: var(--text);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.18;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verified {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 11px;
  font-weight: 800;
  flex: 0 0 auto;
}

.verified-rosette {
  display: inline-flex;
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.verified-rosette svg {
  width: 100%;
  height: 100%;
  display: block;
}

.rosette-shape {
  fill: var(--accent);
}

.rosette-check {
  fill: none;
  stroke: white;
  stroke-width: 2.15;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.header-actions {
  flex: 0 0 auto;
}

.mobile-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: -2px;
}

.subscribe-button,
.icon-button {
  border: 0;
  font: inherit;
  color: var(--text);
  background: transparent;
  padding: 0;
}

.subscribe-button {
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--text);
  color: var(--surface);
  font-size: 14px;
  line-height: 30px;
  font-weight: 800;
}

.icon-button {
  display: inline-grid;
  place-items: center;
  width: 23px;
  height: 30px;
  color: var(--text);
}

.icon-button svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.icon-button svg path {
  stroke: none;
}

.more-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--muted);
}

.more-button span {
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: currentColor;
}

.meta-line {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-text {
  color: var(--text);
  font-size: 19px;
  line-height: 1.38;
  margin: 14px 0 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.post-mobile .post-text {
  font-size: 18px;
  line-height: 1.35;
  margin-top: 22px;
}

.translation-box,
.community-note {
  margin-top: 12px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  border-radius: 12px;
  padding: 10px 12px;
  color: var(--text);
  font-size: 14px;
  line-height: 1.45;
  white-space: pre-wrap;
}

.translation-label,
.note-label {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.media-grid {
  margin-top: 14px;
  display: grid;
  gap: 2px;
  border: 1px solid var(--border);
  border-radius: 15px;
  overflow: hidden;
  background: var(--border);
}

.media-grid.count-1 {
  grid-template-columns: 1fr;
}

.media-grid.count-2,
.media-grid.count-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.media-grid.count-3 {
  grid-template-columns: 1.15fr 0.85fr;
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.media-grid.count-3 .media-item:first-child {
  grid-row: span 2;
}

.media-item {
  position: relative;
  min-height: 128px;
  background: var(--surface-soft);
}

.media-grid.count-1 .media-item {
  min-height: 190px;
}

.media-item img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.media-badge {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  color: white;
  background: rgba(15, 20, 25, 0.72);
  font-size: 12px;
  font-weight: 700;
}

.quote-card {
  margin-top: 14px;
  border: 1px solid var(--border);
  border-radius: 15px;
  padding: 11px;
  background: var(--quote);
}

.quote-card .avatar {
  width: 28px;
  height: 28px;
  font-size: 11px;
}

.quote-card .author-name {
  font-size: 13px;
}

.quote-card .meta-line {
  font-size: 12px;
}

.quote-text {
  margin: 9px 0 0;
  font-size: 14px;
  line-height: 1.35;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.poll {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.poll-choice {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 999px;
  height: 34px;
  overflow: hidden;
  background: var(--surface-soft);
}

.poll-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: rgba(29, 155, 240, 0.16);
}

.poll-label {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 650;
}

.poll-total {
  color: var(--muted);
  font-size: 12px;
  margin-top: 1px;
}

.metrics {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  column-gap: 14px;
  row-gap: 6px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 13px;
}

.mobile-detail-meta {
  margin-top: 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.35;
}

.mobile-detail-meta strong {
  color: var(--text);
  font-weight: 800;
}

.mobile-actions {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 13px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  color: var(--muted);
}

.mobile-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  height: 26px;
  font-size: 13px;
  line-height: 1;
}

.mobile-action svg {
  width: 19px;
  height: 19px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex: 0 0 auto;
}

.mobile-action strong {
  font-size: 13px;
  font-weight: 650;
}

.metric {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.source-footer {
  margin-top: 12px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.clean-kicker {
  color: var(--accent);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.clean-text {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 23px;
  line-height: 1.35;
  margin: 16px 0 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.clean-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.thread-item {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 0;
  padding: 16px 16px 0;
  position: relative;
}

.thread-item:last-child {
  padding-bottom: 16px;
}

.thread-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.thread-rail .avatar {
  width: 40px;
  height: 40px;
  z-index: 1;
}

.thread-line {
  flex: 1;
  width: 2px;
  background: var(--border);
  margin-top: 8px;
}

.thread-item:last-child .thread-line {
  display: none;
}

.thread-body {
  min-width: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.thread-item:last-child .thread-body {
  border-bottom: 0;
  padding-bottom: 0;
}

.thread-body .post-text {
  margin-top: 8px;
  font-size: 16px;
  line-height: 1.4;
}

.wall-title {
  color: var(--text);
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
  margin: 0 0 6px;
}

.wall-subtitle {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.35;
  margin: 0 0 18px;
}

.wall-grid {
  display: grid;
  grid-template-columns: repeat(var(--wall-columns, 2), minmax(0, 1fr));
  gap: 12px;
}

.wall-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 13px;
  box-shadow: 0 8px 22px rgba(15, 20, 25, ${dark ? "0.18" : "0.07"});
}

.wall-card .avatar {
  width: 32px;
  height: 32px;
  font-size: 11px;
}

.wall-card .post-text {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.42;
}

.empty-state {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  color: var(--muted);
  font-size: 14px;
}

.profile-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0;
  box-shadow: 0 14px 36px rgba(15, 20, 25, ${dark ? "0.26" : "0.08"});
}

.profile-banner {
  height: 174px;
  background:
    radial-gradient(circle at 78% 18%, rgba(29, 155, 240, 0.36), transparent 34%),
    linear-gradient(135deg, #dce8f4 0%, #f6f8fa 48%, #c8d8e8 100%);
  background-position: center;
  background-size: cover;
}

.profile-content {
  padding: 0 34px 24px;
}

.profile-avatar-wrap {
  width: 124px;
  height: 124px;
  border: 4px solid var(--surface);
  border-radius: 999px;
  background: var(--surface);
  overflow: hidden;
  margin-top: -65px;
}

.profile-avatar-wrap .avatar {
  width: 116px;
  height: 116px;
  font-size: 28px;
}

.profile-identity {
  margin-top: 26px;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.profile-name-row h1 {
  margin: 0;
  color: var(--text);
  font-size: 26px;
  line-height: 1.08;
  font-weight: 850;
  overflow-wrap: anywhere;
}

.profile-handle {
  margin-top: 6px;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.25;
}

.profile-description {
  margin: 16px 0 0;
  color: var(--text);
  font-size: 17px;
  line-height: 1.48;
  white-space: pre-wrap;
}

.profile-meta-grid {
  display: flex;
  flex-wrap: wrap;
  column-gap: 16px;
  row-gap: 7px;
  margin-top: 17px;
}

.profile-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-meta-item svg {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.profile-stats {
  display: flex;
  align-items: baseline;
  gap: 22px;
  margin-top: 18px;
}

.profile-stat {
  min-width: 0;
}

.profile-stat strong {
  display: inline;
  color: var(--text);
  font-size: 17px;
  line-height: 1;
  font-weight: 800;
}

.profile-stat span {
  display: inline;
  margin-left: 5px;
  color: var(--muted);
  font-size: 17px;
  line-height: 1;
  font-weight: 400;
}

.profile-tabs {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: end;
  margin: 34px -34px 0;
  border-bottom: 1px solid var(--border);
}

.profile-tabs span {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 46px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1;
  font-weight: 800;
  white-space: nowrap;
}

.profile-tabs span.active {
  color: var(--text);
}

.profile-tabs span.active::after {
  content: "";
  position: absolute;
  left: 28%;
  right: 28%;
  bottom: 0;
  height: 4px;
  border-radius: 999px;
  background: var(--accent);
}

.profile-timeline {
  margin: 0 -34px;
}

.profile-timeline-post {
  position: relative;
  border-bottom: 1px solid var(--border);
  padding: 14px 16px 10px;
}

.profile-timeline-post:last-child {
  border-bottom: 0;
}

.profile-pinned {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 54px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1;
  font-weight: 800;
}

.profile-pinned svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.profile-post-main {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
}

.profile-post-main > .avatar {
  width: 42px;
  height: 42px;
  margin-top: 1px;
}

.profile-post-body {
  min-width: 0;
}

.profile-post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.profile-post-author {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  flex-wrap: wrap;
}

.profile-post-name {
  color: var(--text);
  font-size: 16px;
  line-height: 1.2;
  font-weight: 800;
}

.profile-post-meta {
  color: var(--muted);
  font-size: 16px;
  line-height: 1.2;
}

.profile-post-actions-top {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: var(--muted);
  flex: 0 0 auto;
}

.profile-post-actions-top svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.profile-more-icon {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.profile-more-icon span {
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: currentColor;
}

.profile-post-text {
  margin: 0;
  color: var(--text);
  font-size: 16px;
  line-height: 1.42;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.profile-timeline-post .quote-card,
.profile-timeline-post .media-grid {
  margin-top: 12px;
}

.profile-post-action-row {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: center;
  margin-top: 15px;
  color: var(--muted);
}

.profile-post-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 14px;
  line-height: 1.2;
}

.profile-post-action svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.profile-card .source-footer {
  margin-top: 24px;
  padding-top: 14px;
}

@media (max-width: 560px) {
  .quote-wall {
    padding: 16px;
  }

  .wall-grid {
    grid-template-columns: 1fr;
  }
}
`;
}

// src/utils/format.ts
function formatMetric(value) {
  if (value === void 0 || Number.isNaN(value)) return "";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${trimNumber(value / 1e9)}B`;
  if (abs >= 1e6) return `${trimNumber(value / 1e6)}M`;
  if (abs >= 1e4) return `${trimNumber(value / 1e3)}K`;
  return new Intl.NumberFormat("en-US").format(value);
}
function formatCount(value) {
  if (value === void 0 || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("en-US").format(value);
}
function formatPostDate(iso, timezone = "Asia/Shanghai", style = "short") {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  if (style === "long") {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
function formatPostDetailDate(iso, timezone = "Asia/Shanghai") {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
  return `${time} \xB7 ${day}`;
}
function formatCompactMetric(value) {
  if (value === void 0 || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}
function compactUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}
function truncateMiddle(value, maxLength = 68) {
  if (value.length <= maxLength) return value;
  const head = Math.ceil((maxLength - 1) * 0.65);
  const tail = Math.floor((maxLength - 1) * 0.35);
  return `${value.slice(0, head)}\u2026${value.slice(value.length - tail)}`;
}
function trimNumber(value) {
  return value.toFixed(value >= 10 ? 0 : 1).replace(/\.0$/, "");
}

// src/render/templates/components/Avatar.tsx
import { jsx } from "react/jsx-runtime";
function Avatar({ author }) {
  const src = author.avatarAssetUrl ?? author.avatarUrl;
  const initials = getInitials(author.name || author.handle);
  return /* @__PURE__ */ jsx("div", { className: "avatar", "aria-label": `${author.name} avatar`, children: src ? /* @__PURE__ */ jsx("img", { src, alt: "" }) : /* @__PURE__ */ jsx("span", { children: initials }) });
}
function getInitials(value) {
  const cleaned = value.trim().replace(/^@/, "");
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}

// src/render/templates/components/SourceFooter.tsx
import { jsxs } from "react/jsx-runtime";
function SourceFooter({ post }) {
  const label = post.sourceLabel ?? post.provider;
  const url = truncateMiddle(compactUrl(post.url), 88);
  return /* @__PURE__ */ jsxs("div", { className: "source-footer", children: [
    "Source: ",
    label,
    " / @",
    post.author.handle,
    " \xB7 ",
    url
  ] });
}

// src/render/templates/components/VerificationBadge.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function VerificationBadge({ author }) {
  if (!author.verified) return null;
  const isBlueVerified = author.verificationType === void 0 || author.verificationType === null || author.verificationType === "individual";
  if (!isBlueVerified) {
    return /* @__PURE__ */ jsx2("span", { className: "verified verified-standard", children: "\u2713" });
  }
  return /* @__PURE__ */ jsx2("span", { className: "verified-rosette", "aria-label": "Verified account", children: /* @__PURE__ */ jsxs2("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx2(
      "path",
      {
        className: "rosette-shape",
        d: "M12 1.9 14.1 4l2.9-.7 1 2.8 2.8 1-.7 2.9 2.1 2.1-2.1 2.1.7 2.9-2.8 1-1 2.8-2.9-.7L12 22.1 9.9 20l-2.9.7-1-2.8-2.8-1 .7-2.9-2.1-2.1L3.9 10l-.7-2.9 2.8-1 1-2.8 2.9.7L12 1.9Z"
      }
    ),
    /* @__PURE__ */ jsx2("path", { className: "rosette-check", d: "m8.3 12.2 2.3 2.3 5.2-5.4" })
  ] }) });
}

// src/render/templates/ArticleShot.tsx
import { Fragment, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function ArticleShot({ article, options }) {
  return /* @__PURE__ */ jsxs3("article", { className: `capture article-shot ${options.style}`, "data-capture": true, children: [
    options.style === "article-x" ? /* @__PURE__ */ jsx3(ArticleXChrome, { article, options }) : /* @__PURE__ */ jsx3(ArticleCleanChrome, { article, options }),
    options.showSourceFooter ? /* @__PURE__ */ jsx3(ArticleSourceFooter, { article }) : null
  ] });
}
function ArticleXChrome({ article, options }) {
  return /* @__PURE__ */ jsxs3(Fragment, { children: [
    /* @__PURE__ */ jsxs3("div", { className: "article-topbar", children: [
      /* @__PURE__ */ jsx3(Icon, { name: "back" }),
      /* @__PURE__ */ jsx3("div", { className: "article-topbar-title", children: "Article" }),
      /* @__PURE__ */ jsx3(Icon, { name: "expand" })
    ] }),
    /* @__PURE__ */ jsx3(ArticleAuthorRow, { article, showActions: options.showActions }),
    /* @__PURE__ */ jsx3(ArticleCover, { article, showCover: options.showCover }),
    /* @__PURE__ */ jsx3("h1", { className: "article-title", children: article.title }),
    options.showActions ? /* @__PURE__ */ jsx3(ArticleActionBar, { article }) : null,
    /* @__PURE__ */ jsx3(ArticleMeta, { article, timezone: options.timezone }),
    /* @__PURE__ */ jsx3(ArticleBody, { article })
  ] });
}
function ArticleCleanChrome({ article, options }) {
  return /* @__PURE__ */ jsxs3(Fragment, { children: [
    /* @__PURE__ */ jsx3("div", { className: "article-clean-kicker", children: "X Article" }),
    /* @__PURE__ */ jsx3(ArticleCover, { article, showCover: options.showCover }),
    /* @__PURE__ */ jsx3("h1", { className: "article-title", children: article.title }),
    /* @__PURE__ */ jsxs3("div", { className: "article-clean-byline", children: [
      /* @__PURE__ */ jsx3(ArticleAuthorIdentity, { article }),
      /* @__PURE__ */ jsx3(ArticleMeta, { article, timezone: options.timezone })
    ] }),
    /* @__PURE__ */ jsx3(ArticleBody, { article })
  ] });
}
function ArticleAuthorRow({ article, showActions }) {
  return /* @__PURE__ */ jsxs3("div", { className: "article-author-row", children: [
    /* @__PURE__ */ jsx3(ArticleAuthorIdentity, { article }),
    showActions ? /* @__PURE__ */ jsxs3("div", { className: "article-header-actions", children: [
      /* @__PURE__ */ jsx3("button", { className: "article-boost-button", type: "button", children: "Boost" }),
      /* @__PURE__ */ jsx3("button", { className: "article-icon-button", type: "button", "aria-label": "Grok", children: /* @__PURE__ */ jsx3(GrokIcon, {}) }),
      /* @__PURE__ */ jsxs3("button", { className: "article-icon-button article-more-button", type: "button", "aria-label": "More", children: [
        /* @__PURE__ */ jsx3("span", {}),
        /* @__PURE__ */ jsx3("span", {}),
        /* @__PURE__ */ jsx3("span", {})
      ] })
    ] }) : null
  ] });
}
function ArticleAuthorIdentity({ article }) {
  return /* @__PURE__ */ jsxs3("div", { className: "article-author-identity", children: [
    /* @__PURE__ */ jsx3(Avatar, { author: article.author }),
    /* @__PURE__ */ jsxs3("div", { className: "article-author-text", children: [
      /* @__PURE__ */ jsxs3("div", { className: "article-author-name-line", children: [
        /* @__PURE__ */ jsx3("span", { className: "article-author-name", children: article.author.name }),
        /* @__PURE__ */ jsx3(VerificationBadge, { author: article.author })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "article-author-handle", children: [
        "@",
        article.author.handle
      ] })
    ] })
  ] });
}
function ArticleCover({ article, showCover }) {
  if (!showCover || !article.cover) return null;
  return /* @__PURE__ */ jsx3(ArticleImage, { media: article.cover, className: "article-cover", altFallback: "cover" });
}
function ArticleBody({ article }) {
  const entityMap = new Map(article.entities.map((entity) => [entity.key, entity]));
  const mediaMap = new Map(article.media.map((media) => [media.mediaId, media]));
  const nodes = [];
  let orderedIndex = 1;
  for (let index = 0; index < article.blocks.length; index += 1) {
    const block = article.blocks[index];
    if (!block) continue;
    const rendered = renderBlock2(block, entityMap, mediaMap, orderedIndex);
    if (rendered === null) continue;
    nodes.push(/* @__PURE__ */ jsx3(BlockWrapper, { children: rendered }, block.key ?? index));
    orderedIndex = block.type === "ordered-list-item" ? orderedIndex + 1 : 1;
  }
  return /* @__PURE__ */ jsx3("div", { className: "article-body", children: nodes });
}
function BlockWrapper({ children }) {
  return /* @__PURE__ */ jsx3(Fragment, { children });
}
function renderBlock2(block, entityMap, mediaMap, orderedIndex) {
  if (block.type === "atomic") return renderAtomicBlock2(block, entityMap, mediaMap);
  const text = renderInlineText2(block, entityMap);
  if (text.length === 0) return null;
  switch (block.type) {
    case "header-one":
      return /* @__PURE__ */ jsx3("h2", { className: "article-heading article-heading-one", children: text });
    case "header-two":
      return /* @__PURE__ */ jsx3("h2", { className: "article-heading", children: text });
    case "header-three":
    case "header-four":
    case "header-five":
    case "header-six":
      return /* @__PURE__ */ jsx3("h3", { className: "article-subheading", children: text });
    case "unordered-list-item":
      return /* @__PURE__ */ jsxs3("div", { className: "article-list-item", children: [
        /* @__PURE__ */ jsx3("span", { className: "article-list-marker", children: "\u2022" }),
        /* @__PURE__ */ jsx3("div", { children: text })
      ] });
    case "ordered-list-item":
      return /* @__PURE__ */ jsxs3("div", { className: "article-list-item", children: [
        /* @__PURE__ */ jsxs3("span", { className: "article-list-marker", children: [
          orderedIndex,
          "."
        ] }),
        /* @__PURE__ */ jsx3("div", { children: text })
      ] });
    case "blockquote":
      return /* @__PURE__ */ jsx3("blockquote", { className: "article-blockquote", children: text });
    case "code-block":
      return /* @__PURE__ */ jsx3("pre", { className: "article-code", children: /* @__PURE__ */ jsx3("code", { children: block.text }) });
    default:
      return /* @__PURE__ */ jsx3("p", { className: "article-paragraph", children: text });
  }
}
function renderAtomicBlock2(block, entityMap, mediaMap) {
  const range = block.entityRanges[0];
  if (!range) return null;
  const entity = entityMap.get(String(range.key));
  if (!entity) return null;
  if (entity.type === "MEDIA") {
    const mediaItems = Array.isArray(entity.data.mediaItems) ? entity.data.mediaItems : [];
    const images = mediaItems.map((item) => {
      const mediaId = asRecord3(item).mediaId;
      return typeof mediaId === "string" ? mediaMap.get(mediaId) : void 0;
    }).filter(isDefined2);
    if (images.length === 0) return null;
    return /* @__PURE__ */ jsx3("figure", { className: `article-media article-media-count-${Math.min(images.length, 4)}`, children: images.map((media) => /* @__PURE__ */ jsx3(ArticleImage, { media, className: "article-inline-image" }, media.mediaId)) });
  }
  if (entity.type === "MARKDOWN") {
    const markdown = entity.data.markdown;
    return typeof markdown === "string" && markdown.trim().length > 0 ? /* @__PURE__ */ jsx3(MarkdownBlock, { markdown }) : null;
  }
  if (entity.type === "TWEET") {
    const tweetId = entity.data.tweetId;
    return typeof tweetId === "string" ? /* @__PURE__ */ jsxs3("div", { className: "article-embed-link", children: [
      "https://x.com/i/status/",
      tweetId
    ] }) : null;
  }
  return null;
}
function MarkdownBlock({ markdown }) {
  const parsed = parseCodeFence(markdown);
  if (parsed) {
    return /* @__PURE__ */ jsxs3("pre", { className: "article-code", children: [
      parsed.language ? /* @__PURE__ */ jsx3("span", { className: "article-code-language", children: parsed.language }) : null,
      /* @__PURE__ */ jsx3("code", { children: parsed.code })
    ] });
  }
  return /* @__PURE__ */ jsx3("pre", { className: "article-markdown", children: markdown.trimEnd() });
}
function ArticleImage({ media, className, altFallback }) {
  const src = media.assetUrl ?? media.url;
  const alt = media.altText ?? altFallback ?? "";
  return /* @__PURE__ */ jsxs3("div", { className, children: [
    /* @__PURE__ */ jsx3("img", { src, alt }),
    media.type !== "image" ? /* @__PURE__ */ jsx3("span", { className: "article-media-badge", children: media.type }) : null
  ] });
}
function renderInlineText2(block, entityMap) {
  const text = block.text;
  if (text.length === 0) return [];
  const boundaries = /* @__PURE__ */ new Set([0, text.length]);
  for (const range of block.inlineStyleRanges) {
    boundaries.add(clamp2(range.offset, 0, text.length));
    boundaries.add(clamp2(range.offset + range.length, 0, text.length));
  }
  for (const range of block.entityRanges) {
    boundaries.add(clamp2(range.offset, 0, text.length));
    boundaries.add(clamp2(range.offset + range.length, 0, text.length));
  }
  const points = [...boundaries].sort((a, b) => a - b);
  const nodes = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index] ?? 0;
    const end = points[index + 1] ?? start;
    if (end <= start) continue;
    const segment = text.slice(start, end);
    const activeStyles = block.inlineStyleRanges.filter((range) => range.offset <= start && range.offset + range.length >= end);
    const activeEntityRange = block.entityRanges.find((range) => range.offset <= start && range.offset + range.length >= end);
    const entity = activeEntityRange ? entityMap.get(String(activeEntityRange.key)) : void 0;
    nodes.push(renderInlineSegment(segment, activeStyles.map((range) => range.style), entity, `${start}-${end}`));
  }
  return nodes;
}
function renderInlineSegment(segment, styles, entity, key) {
  const normalized = new Set(styles.map((style) => style.toUpperCase()));
  let node = segment;
  if (normalized.has("CODE")) node = /* @__PURE__ */ jsx3("code", { children: node });
  if (normalized.has("BOLD")) node = /* @__PURE__ */ jsx3("strong", { children: node });
  if (normalized.has("ITALIC")) node = /* @__PURE__ */ jsx3("em", { children: node });
  if (normalized.has("STRIKETHROUGH")) node = /* @__PURE__ */ jsx3("s", { children: node });
  if (entity?.type === "LINK" && typeof entity.data.url === "string") {
    node = /* @__PURE__ */ jsx3("a", { className: "article-link", href: entity.data.url, children: node });
  }
  return /* @__PURE__ */ jsx3("span", { children: node }, key);
}
function ArticleActionBar({ article }) {
  const metrics = article.sourceMetrics;
  const reposts = (metrics?.reposts ?? 0) + (metrics?.quotes ?? 0);
  return /* @__PURE__ */ jsxs3("div", { className: "article-actions", children: [
    /* @__PURE__ */ jsx3(ArticleAction, { label: "Replies", value: metrics?.replies, icon: "reply" }),
    /* @__PURE__ */ jsx3(ArticleAction, { label: "Reposts", value: reposts || void 0, icon: "repost" }),
    /* @__PURE__ */ jsx3(ArticleAction, { label: "Likes", value: metrics?.likes, icon: "like", highlight: true }),
    /* @__PURE__ */ jsx3(ArticleAction, { label: "Views", value: metrics?.views, icon: "views" }),
    /* @__PURE__ */ jsx3(ArticleAction, { label: "Bookmarks", value: metrics?.bookmarks, icon: "bookmark" }),
    /* @__PURE__ */ jsx3(ArticleAction, { label: "Share", icon: "share" })
  ] });
}
function ArticleAction({
  label,
  value,
  icon,
  highlight = false
}) {
  return /* @__PURE__ */ jsxs3("div", { className: `article-action ${highlight ? "is-highlighted" : ""}`, "aria-label": label, children: [
    /* @__PURE__ */ jsx3(ActionIcon, { name: icon }),
    value !== void 0 ? /* @__PURE__ */ jsx3("span", { children: formatCompactMetric(value) }) : null
  ] });
}
function ArticleMeta({ article, timezone }) {
  const date = article.sourceCreatedAt ?? article.createdAt;
  return /* @__PURE__ */ jsx3("div", { className: "article-meta", children: formatPostDetailDate(date, timezone) });
}
function ArticleSourceFooter({ article }) {
  return /* @__PURE__ */ jsx3(
    SourceFooter,
    {
      post: {
        provider: article.provider,
        id: article.sourcePostId,
        url: article.sourceUrl,
        text: article.title,
        createdAt: article.sourceCreatedAt ?? article.createdAt,
        author: article.author,
        media: [],
        sourceLabel: article.provider === "x" ? "X" : article.provider
      }
    }
  );
}
function Icon({ name }) {
  if (name === "back") {
    return /* @__PURE__ */ jsxs3("svg", { className: "article-topbar-icon", viewBox: "0 0 24 24", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx3("path", { d: "M20 12H5" }),
      /* @__PURE__ */ jsx3("path", { d: "m12 5-7 7 7 7" })
    ] });
  }
  return /* @__PURE__ */ jsxs3("svg", { className: "article-topbar-icon", viewBox: "0 0 24 24", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx3("path", { d: "M8 3H3v5" }),
    /* @__PURE__ */ jsx3("path", { d: "M3 3l7 7" }),
    /* @__PURE__ */ jsx3("path", { d: "M16 21h5v-5" }),
    /* @__PURE__ */ jsx3("path", { d: "m21 21-7-7" })
  ] });
}
function GrokIcon() {
  return /* @__PURE__ */ jsx3("svg", { viewBox: "0 0 33 32", "aria-hidden": "true", children: /* @__PURE__ */ jsx3("path", { d: "M12.745 20.54l10.97-8.19c.539-.4 1.307-.244 1.564.38 1.349 3.288.746 7.241-1.938 9.955-2.683 2.714-6.417 3.31-9.83 1.954l-3.728 1.745c5.347 3.697 11.84 2.782 15.898-1.324 3.219-3.255 4.216-7.692 3.284-11.693l.008.009c-1.351-5.878.332-8.227 3.782-13.031L33 0l-4.54 4.59v-.014L12.743 20.544m-2.263 1.987c-3.837-3.707-3.175-9.446.1-12.755 2.42-2.449 6.388-3.448 9.852-1.979l3.72-1.737c-.67-.49-1.53-1.017-2.515-1.387-4.455-1.854-9.789-.931-13.41 2.728-3.483 3.523-4.579 8.94-2.697 13.561 1.405 3.454-.899 5.898-3.22 8.364C1.49 30.2.666 31.074 0 32l10.478-9.466" }) });
}
function ActionIcon({ name }) {
  if (name === "reply") {
    return /* @__PURE__ */ jsx3("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx3("path", { d: "M20 12a7.5 7.5 0 0 1-7.9 7.5 8.3 8.3 0 0 1-3.2-.8L4 20l1.4-4.4A7.3 7.3 0 0 1 4 12a7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 8 7.5Z" }) });
  }
  if (name === "repost") {
    return /* @__PURE__ */ jsxs3("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx3("path", { d: "M17 3l3 3-3 3" }),
      /* @__PURE__ */ jsx3("path", { d: "M4 11V8a2 2 0 0 1 2-2h14" }),
      /* @__PURE__ */ jsx3("path", { d: "M7 21l-3-3 3-3" }),
      /* @__PURE__ */ jsx3("path", { d: "M20 13v3a2 2 0 0 1-2 2H4" })
    ] });
  }
  if (name === "like") {
    return /* @__PURE__ */ jsx3("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx3("path", { d: "M20.5 8.9c0 5.1-8.5 10.2-8.5 10.2S3.5 14 3.5 8.9A4.4 4.4 0 0 1 8 4.5a5 5 0 0 1 4 2 5 5 0 0 1 4-2 4.4 4.4 0 0 1 4.5 4.4Z" }) });
  }
  if (name === "views") {
    return /* @__PURE__ */ jsxs3("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx3("path", { d: "M4 20V10" }),
      /* @__PURE__ */ jsx3("path", { d: "M10 20V4" }),
      /* @__PURE__ */ jsx3("path", { d: "M16 20v-7" }),
      /* @__PURE__ */ jsx3("path", { d: "M22 20V8" })
    ] });
  }
  if (name === "bookmark") {
    return /* @__PURE__ */ jsx3("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx3("path", { d: "M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" }) });
  }
  return /* @__PURE__ */ jsxs3("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx3("path", { d: "M12 4v11" }),
    /* @__PURE__ */ jsx3("path", { d: "M8 8l4-4 4 4" }),
    /* @__PURE__ */ jsx3("path", { d: "M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" })
  ] });
}
function parseCodeFence(markdown) {
  const match = markdown.trim().match(/^```([A-Za-z0-9_-]+)?\n([\s\S]*?)\n?```$/);
  if (!match) return void 0;
  const language = match[1];
  const code = match[2] ?? "";
  return language ? { language, code } : { code };
}
function asRecord3(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
}
function isDefined2(value) {
  return value !== void 0;
}
function clamp2(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// src/render/templates/components/MediaGrid.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function MediaGrid({ media, mode }) {
  const selected = selectMedia(media, mode);
  if (selected.length === 0) return null;
  return /* @__PURE__ */ jsx4("div", { className: `media-grid count-${Math.min(selected.length, 4)}`, children: selected.slice(0, 4).map((item, index) => {
    const imageSrc = item.thumbnailAssetUrl ?? item.assetUrl ?? item.thumbnailUrl ?? item.url;
    const badge = item.type === "video" ? "Video" : item.type === "gif" ? "GIF" : item.type === "external" ? "Link" : null;
    return /* @__PURE__ */ jsxs4("div", { className: "media-item", children: [
      /* @__PURE__ */ jsx4("img", { src: imageSrc, alt: item.altText ?? "" }),
      badge ? /* @__PURE__ */ jsx4("span", { className: "media-badge", children: badge }) : null
    ] }, `${item.url}-${index}`);
  }) });
}
function selectMedia(media, mode) {
  if (mode === "none") return [];
  const nonMosaic = media.filter((item) => item.type !== "mosaic");
  const mosaic = media.find((item) => item.type === "mosaic");
  if (mode === "mosaic") return mosaic ? [mosaic] : nonMosaic.slice(0, 4);
  if (mode === "first") return nonMosaic.slice(0, 1);
  if (mode === "full") return nonMosaic.length > 0 ? nonMosaic : media;
  return nonMosaic.length > 0 ? nonMosaic.slice(0, 4) : media.slice(0, 1);
}

// src/render/templates/components/PostHeader.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function PostHeader({ post, timezone, showTimestamp, compact = false, showAvatar = true, actions }) {
  return /* @__PURE__ */ jsxs5("div", { className: `header-row${showAvatar ? "" : " no-avatar"}`, children: [
    showAvatar ? /* @__PURE__ */ jsx5(Avatar, { author: post.author }) : null,
    /* @__PURE__ */ jsxs5("div", { className: "author-block", children: [
      /* @__PURE__ */ jsxs5("div", { className: "author-line", children: [
        /* @__PURE__ */ jsx5("span", { className: "author-name", children: post.author.name }),
        /* @__PURE__ */ jsx5(VerificationBadge, { author: post.author })
      ] }),
      /* @__PURE__ */ jsxs5("div", { className: "meta-line", children: [
        "@",
        post.author.handle,
        showTimestamp ? ` \xB7 ${formatPostDate(post.createdAt, timezone, compact ? "short" : "long")}` : null
      ] })
    ] }),
    actions ? /* @__PURE__ */ jsx5("div", { className: "header-actions", children: actions }) : null
  ] });
}

// src/render/templates/components/displayText.ts
function postBodyText(post, translatedText) {
  if (translatedText && post.translation?.text) return post.translation.text;
  return post.text || "[No text]";
}

// src/render/templates/components/PostText.tsx
import { Fragment as Fragment2, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function PostText({ post, className = "post-text", showTranslation, translatedText }) {
  return /* @__PURE__ */ jsxs6(Fragment2, { children: [
    /* @__PURE__ */ jsx6("p", { className, children: postBodyText(post, translatedText) }),
    showTranslation && !translatedText && post.translation?.text ? /* @__PURE__ */ jsxs6("div", { className: "translation-box", children: [
      /* @__PURE__ */ jsx6("div", { className: "translation-label", children: "Translation" }),
      post.translation.text
    ] }) : null,
    post.communityNote?.text ? /* @__PURE__ */ jsxs6("div", { className: "community-note", children: [
      /* @__PURE__ */ jsx6("div", { className: "note-label", children: "Community note" }),
      post.communityNote.text
    ] }) : null
  ] });
}

// src/render/templates/components/QuotedPost.tsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function QuotedPost({ post, timezone, mediaMode, translatedText }) {
  if (!post) return null;
  return /* @__PURE__ */ jsxs7("div", { className: "quote-card", children: [
    /* @__PURE__ */ jsx7(PostHeader, { post, timezone, showTimestamp: false, compact: true }),
    /* @__PURE__ */ jsx7("div", { className: "quote-text", children: postBodyText(post, translatedText) }),
    /* @__PURE__ */ jsx7(MediaGrid, { media: post.media, mode: mediaMode === "none" ? "none" : "first" })
  ] });
}

// src/render/templates/PostClean.tsx
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function PostClean({ post, options }) {
  return /* @__PURE__ */ jsxs8("article", { className: "capture post-clean", "data-capture": true, children: [
    /* @__PURE__ */ jsx8("div", { className: "clean-kicker", children: "Source quotation" }),
    /* @__PURE__ */ jsx8(PostText, { post, className: "clean-text", showTranslation: options.showTranslation, translatedText: options.translatedText }),
    /* @__PURE__ */ jsx8(MediaGrid, { media: post.media, mode: options.mediaMode === "grid" ? "first" : options.mediaMode }),
    /* @__PURE__ */ jsx8(QuotedPost, { post: post.quote, timezone: options.timezone, mediaMode: options.mediaMode, translatedText: options.translatedText }),
    /* @__PURE__ */ jsx8("div", { className: "clean-author", children: /* @__PURE__ */ jsx8(PostHeader, { post, timezone: options.timezone, showTimestamp: options.showTimestamp }) }),
    options.showSourceFooter ? /* @__PURE__ */ jsx8(SourceFooter, { post }) : null
  ] });
}

// src/render/templates/components/Poll.tsx
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
function Poll({ poll }) {
  if (!poll) return null;
  return /* @__PURE__ */ jsxs9("div", { className: "poll", children: [
    poll.choices.map((choice) => /* @__PURE__ */ jsxs9("div", { className: "poll-choice", children: [
      /* @__PURE__ */ jsx9("div", { className: "poll-fill", style: { width: `${Math.max(0, Math.min(100, choice.percentage))}%` } }),
      /* @__PURE__ */ jsxs9("div", { className: "poll-label", children: [
        /* @__PURE__ */ jsx9("span", { children: choice.label }),
        /* @__PURE__ */ jsxs9("span", { children: [
          Math.round(choice.percentage),
          "%"
        ] })
      ] })
    ] }, choice.label)),
    /* @__PURE__ */ jsxs9("div", { className: "poll-total", children: [
      formatCount(poll.totalVotes),
      " votes",
      poll.timeLeft ? ` \xB7 ${poll.timeLeft}` : null
    ] })
  ] });
}

// src/render/templates/PostMobile.tsx
import { Fragment as Fragment3, jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
function PostMobile({ post, options }) {
  return /* @__PURE__ */ jsxs10("article", { className: "capture post-mobile", "data-capture": true, children: [
    /* @__PURE__ */ jsx10(
      PostHeader,
      {
        post,
        timezone: options.timezone,
        showTimestamp: false,
        actions: /* @__PURE__ */ jsx10(MobileHeaderActions, { showSubscribeButton: options.showSubscribeButton })
      }
    ),
    /* @__PURE__ */ jsx10(PostText, { post, showTranslation: options.showTranslation, translatedText: options.translatedText }),
    /* @__PURE__ */ jsx10(MediaGrid, { media: post.media, mode: options.mediaMode }),
    /* @__PURE__ */ jsx10(Poll, { poll: post.poll }),
    /* @__PURE__ */ jsx10(QuotedPost, { post: post.quote, timezone: options.timezone, mediaMode: options.mediaMode, translatedText: options.translatedText }),
    options.showTimestamp ? /* @__PURE__ */ jsx10(MobileDetailMeta, { post, timezone: options.timezone }) : null,
    options.showStats ? /* @__PURE__ */ jsx10(MobileActionBar, { post }) : null,
    options.showSourceFooter ? /* @__PURE__ */ jsx10(SourceFooter, { post }) : null
  ] });
}
function MobileHeaderActions({ showSubscribeButton }) {
  return /* @__PURE__ */ jsxs10("div", { className: "mobile-header-actions", children: [
    showSubscribeButton ? /* @__PURE__ */ jsx10("button", { className: "subscribe-button", type: "button", children: "Subscribe" }) : null,
    /* @__PURE__ */ jsx10("button", { className: "icon-button", type: "button", "aria-label": "Grok", children: /* @__PURE__ */ jsx10(GrokIcon2, {}) }),
    /* @__PURE__ */ jsxs10("button", { className: "icon-button more-button", type: "button", "aria-label": "More", children: [
      /* @__PURE__ */ jsx10("span", {}),
      /* @__PURE__ */ jsx10("span", {}),
      /* @__PURE__ */ jsx10("span", {})
    ] })
  ] });
}
function GrokIcon2() {
  return /* @__PURE__ */ jsx10("svg", { viewBox: "0 0 33 32", "aria-hidden": "true", children: /* @__PURE__ */ jsx10("path", { d: "M12.745 20.54l10.97-8.19c.539-.4 1.307-.244 1.564.38 1.349 3.288.746 7.241-1.938 9.955-2.683 2.714-6.417 3.31-9.83 1.954l-3.728 1.745c5.347 3.697 11.84 2.782 15.898-1.324 3.219-3.255 4.216-7.692 3.284-11.693l.008.009c-1.351-5.878.332-8.227 3.782-13.031L33 0l-4.54 4.59v-.014L12.743 20.544m-2.263 1.987c-3.837-3.707-3.175-9.446.1-12.755 2.42-2.449 6.388-3.448 9.852-1.979l3.72-1.737c-.67-.49-1.53-1.017-2.515-1.387-4.455-1.854-9.789-.931-13.41 2.728-3.483 3.523-4.579 8.94-2.697 13.561 1.405 3.454-.899 5.898-3.22 8.364C1.49 30.2.666 31.074 0 32l10.478-9.466" }) });
}
function MobileDetailMeta({ post, timezone }) {
  const views = formatCompactMetric(post.metrics?.views);
  return /* @__PURE__ */ jsxs10("div", { className: "mobile-detail-meta", children: [
    formatPostDetailDate(post.createdAt, timezone),
    views ? /* @__PURE__ */ jsxs10(Fragment3, { children: [
      " \xB7 ",
      /* @__PURE__ */ jsx10("strong", { children: views }),
      " Views"
    ] }) : null
  ] });
}
function MobileActionBar({ post }) {
  const reposts = (post.metrics?.reposts ?? 0) + (post.metrics?.quotes ?? 0);
  return /* @__PURE__ */ jsxs10("div", { className: "mobile-actions", children: [
    /* @__PURE__ */ jsx10(MobileAction, { label: "Replies", value: post.metrics?.replies, icon: "reply" }),
    /* @__PURE__ */ jsx10(MobileAction, { label: "Reposts", value: reposts || void 0, icon: "repost" }),
    /* @__PURE__ */ jsx10(MobileAction, { label: "Likes", value: post.metrics?.likes, icon: "like" }),
    /* @__PURE__ */ jsx10(MobileAction, { label: "Bookmarks", value: post.metrics?.bookmarks, icon: "bookmark" }),
    /* @__PURE__ */ jsx10(MobileAction, { label: "Share", icon: "share" })
  ] });
}
function MobileAction({
  label,
  value,
  icon
}) {
  return /* @__PURE__ */ jsxs10("div", { className: "mobile-action", "aria-label": label, children: [
    /* @__PURE__ */ jsx10(ActionIcon2, { name: icon }),
    value !== void 0 ? /* @__PURE__ */ jsx10("strong", { children: formatMetric(value) }) : null
  ] });
}
function ActionIcon2({ name }) {
  if (name === "reply") {
    return /* @__PURE__ */ jsx10("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx10("path", { d: "M20 12a7.5 7.5 0 0 1-7.9 7.5 8.3 8.3 0 0 1-3.2-.8L4 20l1.4-4.4A7.3 7.3 0 0 1 4 12a7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 8 7.5Z" }) });
  }
  if (name === "repost") {
    return /* @__PURE__ */ jsxs10("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx10("path", { d: "M17 3l3 3-3 3" }),
      /* @__PURE__ */ jsx10("path", { d: "M4 11V8a2 2 0 0 1 2-2h14" }),
      /* @__PURE__ */ jsx10("path", { d: "M7 21l-3-3 3-3" }),
      /* @__PURE__ */ jsx10("path", { d: "M20 13v3a2 2 0 0 1-2 2H4" })
    ] });
  }
  if (name === "like") {
    return /* @__PURE__ */ jsx10("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx10("path", { d: "M20.5 8.9c0 5.1-8.5 10.2-8.5 10.2S3.5 14 3.5 8.9A4.4 4.4 0 0 1 8 4.5a5 5 0 0 1 4 2 5 5 0 0 1 4-2 4.4 4.4 0 0 1 4.5 4.4Z" }) });
  }
  if (name === "bookmark") {
    return /* @__PURE__ */ jsx10("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx10("path", { d: "M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" }) });
  }
  return /* @__PURE__ */ jsxs10("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx10("path", { d: "M12 4v11" }),
    /* @__PURE__ */ jsx10("path", { d: "M8 8l4-4 4 4" }),
    /* @__PURE__ */ jsx10("path", { d: "M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" })
  ] });
}

// src/render/templates/ProfileCard.tsx
import { jsx as jsx11, jsxs as jsxs11 } from "react/jsx-runtime";
function ProfileCard({ profile, options, timelinePosts = [] }) {
  const author = profileToAuthor(profile);
  const banner = profile.bannerAssetUrl ?? profile.bannerUrl;
  const joined = formatJoined(profile.joined);
  const website = profile.website ? compactUrl(profile.website) : void 0;
  return /* @__PURE__ */ jsxs11("section", { className: "capture profile-card", "data-capture": true, children: [
    /* @__PURE__ */ jsx11(
      "div",
      {
        className: "profile-banner",
        style: banner ? { backgroundImage: `url("${banner}")` } : void 0
      }
    ),
    /* @__PURE__ */ jsxs11("div", { className: "profile-content", children: [
      /* @__PURE__ */ jsx11("div", { className: "profile-avatar-wrap", children: /* @__PURE__ */ jsx11(Avatar, { author }) }),
      /* @__PURE__ */ jsxs11("div", { className: "profile-identity", children: [
        /* @__PURE__ */ jsxs11("div", { className: "profile-name-row", children: [
          /* @__PURE__ */ jsx11("h1", { children: profile.name }),
          /* @__PURE__ */ jsx11(VerificationBadge, { author })
        ] }),
        /* @__PURE__ */ jsxs11("div", { className: "profile-handle", children: [
          "@",
          profile.handle
        ] })
      ] }),
      profile.description ? /* @__PURE__ */ jsx11("p", { className: "profile-description", children: profile.description }) : null,
      /* @__PURE__ */ jsxs11("div", { className: "profile-meta-grid", children: [
        profile.location ? /* @__PURE__ */ jsx11(ProfileMetaItem, { icon: "pin", label: profile.location }) : null,
        joined ? /* @__PURE__ */ jsx11(ProfileMetaItem, { icon: "calendar", label: joined }) : null,
        website ? /* @__PURE__ */ jsx11(ProfileMetaItem, { icon: "link", label: website }) : null
      ] }),
      /* @__PURE__ */ jsxs11("div", { className: "profile-stats", children: [
        /* @__PURE__ */ jsx11(Stat, { label: "Following", value: profile.metrics.following }),
        /* @__PURE__ */ jsx11(Stat, { label: "Followers", value: profile.metrics.followers })
      ] }),
      timelinePosts.length > 0 ? /* @__PURE__ */ jsx11(ProfileTabs, {}) : null,
      timelinePosts.length > 0 ? /* @__PURE__ */ jsx11("div", { className: "profile-timeline", children: timelinePosts.map((post) => /* @__PURE__ */ jsx11(ProfileTimelinePost, { post, options }, post.id)) }) : null,
      options.showSourceFooter ? /* @__PURE__ */ jsxs11("div", { className: "source-footer", children: [
        "Source: X / @",
        profile.handle,
        " \xB7 ",
        compactUrl(profile.url)
      ] }) : null
    ] })
  ] });
}
function Stat({ label, value }) {
  if (value === void 0) return null;
  return /* @__PURE__ */ jsxs11("div", { className: "profile-stat", children: [
    /* @__PURE__ */ jsx11("strong", { children: formatMetric(value) }),
    /* @__PURE__ */ jsx11("span", { children: label })
  ] });
}
function ProfileMetaItem({ icon, label }) {
  return /* @__PURE__ */ jsxs11("span", { className: "profile-meta-item", children: [
    /* @__PURE__ */ jsx11(MetaIcon, { name: icon }),
    label
  ] });
}
function ProfileTabs() {
  const tabs = ["Posts", "Replies", "Highlights", "Articles", "Media", "Likes"];
  return /* @__PURE__ */ jsx11("nav", { className: "profile-tabs", "aria-label": "Profile timeline tabs", children: tabs.map((tab, index) => /* @__PURE__ */ jsx11("span", { className: index === 0 ? "active" : void 0, children: tab }, tab)) });
}
function ProfileTimelinePost({ post, options }) {
  return /* @__PURE__ */ jsxs11("article", { className: "profile-timeline-post", children: [
    post.isPinned ? /* @__PURE__ */ jsxs11("div", { className: "profile-pinned", children: [
      /* @__PURE__ */ jsx11(PinIcon, {}),
      " Pinned"
    ] }) : null,
    /* @__PURE__ */ jsxs11("div", { className: "profile-post-main", children: [
      /* @__PURE__ */ jsx11(Avatar, { author: post.author }),
      /* @__PURE__ */ jsxs11("div", { className: "profile-post-body", children: [
        /* @__PURE__ */ jsxs11("div", { className: "profile-post-header", children: [
          /* @__PURE__ */ jsxs11("div", { className: "profile-post-author", children: [
            /* @__PURE__ */ jsx11("span", { className: "profile-post-name", children: post.author.name }),
            /* @__PURE__ */ jsx11(VerificationBadge, { author: post.author }),
            /* @__PURE__ */ jsxs11("span", { className: "profile-post-meta", children: [
              "@",
              post.author.handle,
              " \xB7 ",
              formatPostDate(post.createdAt, options.timezone, "short")
            ] })
          ] }),
          /* @__PURE__ */ jsxs11("div", { className: "profile-post-actions-top", children: [
            /* @__PURE__ */ jsx11(GrokIcon3, {}),
            /* @__PURE__ */ jsx11(MoreIcon, {})
          ] })
        ] }),
        /* @__PURE__ */ jsx11(PostText, { post, className: "profile-post-text", showTranslation: options.showTranslation, translatedText: options.translatedText }),
        /* @__PURE__ */ jsx11(QuotedPost, { post: post.quote, timezone: options.timezone, mediaMode: options.mediaMode, translatedText: options.translatedText }),
        /* @__PURE__ */ jsx11(MediaGrid, { media: post.media, mode: options.mediaMode }),
        /* @__PURE__ */ jsx11(ProfilePostActionRow, { post })
      ] })
    ] })
  ] });
}
function ProfilePostActionRow({ post }) {
  return /* @__PURE__ */ jsxs11("div", { className: "profile-post-action-row", children: [
    /* @__PURE__ */ jsx11(ActionMetric, { icon: "reply", value: post.metrics?.replies }),
    /* @__PURE__ */ jsx11(ActionMetric, { icon: "repost", value: (post.metrics?.reposts ?? 0) + (post.metrics?.quotes ?? 0) || void 0 }),
    /* @__PURE__ */ jsx11(ActionMetric, { icon: "like", value: post.metrics?.likes }),
    /* @__PURE__ */ jsx11(ActionMetric, { icon: "views", value: post.metrics?.views }),
    /* @__PURE__ */ jsx11(ActionMetric, { icon: "bookmark" }),
    /* @__PURE__ */ jsx11(ActionMetric, { icon: "share" })
  ] });
}
function ActionMetric({ icon, value }) {
  return /* @__PURE__ */ jsxs11("span", { className: "profile-post-action", children: [
    /* @__PURE__ */ jsx11(ActionIcon3, { name: icon }),
    value !== void 0 ? /* @__PURE__ */ jsx11("span", { children: formatMetric(value) }) : null
  ] });
}
function ActionIcon3({ name }) {
  if (name === "reply") return /* @__PURE__ */ jsx11("svg", { viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx11("path", { d: "M20 12a7.5 7.5 0 0 1-7.9 7.5 8.3 8.3 0 0 1-3.2-.8L4 20l1.4-4.4A7.3 7.3 0 0 1 4 12a7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 8 7.5Z" }) });
  if (name === "repost") return /* @__PURE__ */ jsxs11("svg", { viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ jsx11("path", { d: "M17 3l3 3-3 3" }),
    /* @__PURE__ */ jsx11("path", { d: "M4 11V8a2 2 0 0 1 2-2h14" }),
    /* @__PURE__ */ jsx11("path", { d: "M7 21l-3-3 3-3" }),
    /* @__PURE__ */ jsx11("path", { d: "M20 13v3a2 2 0 0 1-2 2H4" })
  ] });
  if (name === "like") return /* @__PURE__ */ jsx11("svg", { viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx11("path", { d: "M20.5 8.9c0 5.1-8.5 10.2-8.5 10.2S3.5 14 3.5 8.9A4.4 4.4 0 0 1 8 4.5a5 5 0 0 1 4 2 5 5 0 0 1 4-2 4.4 4.4 0 0 1 4.5 4.4Z" }) });
  if (name === "views") return /* @__PURE__ */ jsx11("svg", { viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx11("path", { d: "M5 20V10M12 20V4M19 20v-7" }) });
  if (name === "bookmark") return /* @__PURE__ */ jsx11("svg", { viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx11("path", { d: "M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" }) });
  return /* @__PURE__ */ jsxs11("svg", { viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ jsx11("path", { d: "M12 3v12" }),
    /* @__PURE__ */ jsx11("path", { d: "m7 8 5-5 5 5" }),
    /* @__PURE__ */ jsx11("path", { d: "M5 14v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4" })
  ] });
}
function GrokIcon3() {
  return /* @__PURE__ */ jsx11("svg", { viewBox: "0 0 33 32", "aria-hidden": "true", children: /* @__PURE__ */ jsx11("path", { d: "M12.745 20.54l10.97-8.19c.539-.4 1.307-.244 1.564.38 1.349 3.288.746 7.241-1.938 9.955-2.683 2.714-6.417 3.31-9.83 1.954l-3.728 1.745c5.347 3.697 11.84 2.782 15.898-1.324 3.219-3.255 4.216-7.692 3.284-11.693l.008.009c-1.351-5.878.332-8.227 3.782-13.031L33 0l-4.54 4.59v-.014L12.743 20.544m-2.263 1.987c-3.837-3.707-3.175-9.446.1-12.755 2.42-2.449 6.388-3.448 9.852-1.979l3.72-1.737c-.67-.49-1.53-1.017-2.515-1.387-4.455-1.854-9.789-.931-13.41 2.728-3.483 3.523-4.579 8.94-2.697 13.561 1.405 3.454-.899 5.898-3.22 8.364C1.49 30.2.666 31.074 0 32l10.478-9.466" }) });
}
function MoreIcon() {
  return /* @__PURE__ */ jsxs11("span", { className: "profile-more-icon", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx11("span", {}),
    /* @__PURE__ */ jsx11("span", {}),
    /* @__PURE__ */ jsx11("span", {})
  ] });
}
function PinIcon() {
  return /* @__PURE__ */ jsxs11("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx11("path", { d: "M8 3h8l-1.1 6.2 3.1 3.1V15H6v-2.7l3.1-3.1L8 3Z" }),
    /* @__PURE__ */ jsx11("path", { d: "M12 15v6" })
  ] });
}
function MetaIcon({ name }) {
  if (name === "calendar") {
    return /* @__PURE__ */ jsx11("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx11("path", { d: "M7 3v3M17 3v3M4.5 9h15M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z" }) });
  }
  if (name === "link") {
    return /* @__PURE__ */ jsx11("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx11("path", { d: "M9.5 14.5 14.5 9.5M10 7.5l1.2-1.2a4.2 4.2 0 0 1 5.9 5.9L16 13.4M14 16.5l-1.2 1.2a4.2 4.2 0 0 1-5.9-5.9L8 10.6" }) });
  }
  return /* @__PURE__ */ jsxs11("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx11("path", { d: "M19 10c0 5.2-7 10.5-7 10.5S5 15.2 5 10a7 7 0 1 1 14 0Z" }),
    /* @__PURE__ */ jsx11("path", { d: "M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" })
  ] });
}
function profileToAuthor(profile) {
  return {
    name: profile.name,
    handle: profile.handle,
    ...profile.id ? { id: profile.id } : {},
    ...profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {},
    ...profile.avatarAssetUrl ? { avatarAssetUrl: profile.avatarAssetUrl } : {},
    ...profile.verified !== void 0 ? { verified: profile.verified } : {},
    ...profile.verificationType !== void 0 ? { verificationType: profile.verificationType } : {}
  };
}
function formatJoined(value) {
  if (!value) return void 0;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return `Joined ${new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date)}`;
  }
  return value.startsWith("Joined ") ? value : `Joined ${value}`;
}

// src/render/templates/components/Metrics.tsx
import { jsx as jsx12, jsxs as jsxs12 } from "react/jsx-runtime";
function Metrics({ metrics }) {
  if (!metrics) return null;
  const items = [
    ["Replies", metrics.replies],
    ["Reposts", metrics.reposts],
    ["Quotes", metrics.quotes],
    ["Likes", metrics.likes],
    ["Views", metrics.views]
  ];
  const visible = items.filter(([, value]) => value !== void 0);
  if (visible.length === 0) return null;
  return /* @__PURE__ */ jsx12("div", { className: "metrics", children: visible.map(([label, value]) => /* @__PURE__ */ jsxs12("span", { className: "metric", children: [
    /* @__PURE__ */ jsx12("strong", { children: formatMetric(value) }),
    /* @__PURE__ */ jsx12("span", { children: label })
  ] }, label)) });
}

// src/render/templates/QuoteWall.tsx
import { jsx as jsx13, jsxs as jsxs13 } from "react/jsx-runtime";
function QuoteWall({ sourcePost, quotes, options }) {
  const columns = options.columns ?? (options.width <= 560 ? 1 : 2);
  const style = { "--wall-columns": columns };
  const sourceText = postBodyText(sourcePost, options.translatedText);
  return /* @__PURE__ */ jsxs13("section", { className: "capture quote-wall", style, "data-capture": true, children: [
    /* @__PURE__ */ jsx13("h1", { className: "wall-title", children: "Quoted reactions" }),
    /* @__PURE__ */ jsxs13("p", { className: "wall-subtitle", children: [
      "Responses quoting @",
      sourcePost.author.handle,
      ": ",
      sourceText.slice(0, 120),
      sourceText.length > 120 ? "..." : ""
    ] }),
    quotes.length > 0 ? /* @__PURE__ */ jsx13("div", { className: "wall-grid", children: quotes.map((quote) => /* @__PURE__ */ jsxs13("article", { className: "wall-card", children: [
      /* @__PURE__ */ jsx13(PostHeader, { post: quote, timezone: options.timezone, showTimestamp: options.showTimestamp, compact: true }),
      /* @__PURE__ */ jsx13(PostText, { post: quote, showTranslation: options.showTranslation, translatedText: options.translatedText }),
      options.showStats ? /* @__PURE__ */ jsx13(Metrics, { metrics: quote.metrics }) : null
    ] }, quote.id)) }) : /* @__PURE__ */ jsx13("div", { className: "empty-state", children: "No quote posts were returned for this source post." }),
    options.showSourceFooter ? /* @__PURE__ */ jsx13(SourceFooter, { post: sourcePost }) : null
  ] });
}

// src/render/templates/ThreadVertical.tsx
import { jsx as jsx14, jsxs as jsxs14 } from "react/jsx-runtime";
function ThreadVertical({ thread, options }) {
  const posts = thread.posts.slice(0, options.maxPosts ?? thread.posts.length);
  return /* @__PURE__ */ jsx14("section", { className: "capture thread-vertical", "data-capture": true, children: posts.map((post, index) => /* @__PURE__ */ jsxs14("article", { className: "thread-item", children: [
    /* @__PURE__ */ jsxs14("div", { className: "thread-rail", children: [
      /* @__PURE__ */ jsx14(Avatar, { author: post.author }),
      /* @__PURE__ */ jsx14("div", { className: "thread-line" })
    ] }),
    /* @__PURE__ */ jsxs14("div", { className: "thread-body", children: [
      /* @__PURE__ */ jsx14(PostHeader, { post, timezone: options.timezone, showTimestamp: options.showTimestamp, compact: true, showAvatar: false }),
      /* @__PURE__ */ jsx14(PostText, { post, showTranslation: options.showTranslation, translatedText: options.translatedText }),
      /* @__PURE__ */ jsx14(MediaGrid, { media: post.media, mode: options.mediaMode }),
      options.showStats ? /* @__PURE__ */ jsx14(Metrics, { metrics: post.metrics }) : null,
      options.showSourceFooter && index === posts.length - 1 ? /* @__PURE__ */ jsx14(SourceFooter, { post: thread.root }) : null
    ] })
  ] }, post.id)) });
}

// src/render/renderHtml.tsx
import { jsx as jsx15 } from "react/jsx-runtime";
function renderPostHtml(post, options) {
  const element = options.template === "post-clean" ? /* @__PURE__ */ jsx15(PostClean, { post, options }) : /* @__PURE__ */ jsx15(PostMobile, { post, options });
  return renderDocument(element, options);
}
function renderThreadHtml(thread, options) {
  return renderDocument(/* @__PURE__ */ jsx15(ThreadVertical, { thread, options }), options);
}
function renderQuoteWallHtml(sourcePost, quotes, options) {
  return renderDocument(/* @__PURE__ */ jsx15(QuoteWall, { sourcePost, quotes, options }), options);
}
function renderArticleShotHtml(article, options) {
  return renderArticleDocument(/* @__PURE__ */ jsx15(ArticleShot, { article, options }), options);
}
function renderProfileHtml(profile, options, timelinePosts = []) {
  return renderDocument(/* @__PURE__ */ jsx15(ProfileCard, { profile, options, timelinePosts }), options);
}
function defaultWidthForTemplate(template) {
  if (template === "quote-wall") return 920;
  if (template === "profile-card") return 430;
  if (template === "post-mobile") return 430;
  return 390;
}
function renderDocument(element, options) {
  const body = renderToStaticMarkup(element);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=${options.width}, initial-scale=1" />
    <style>${buildStyles(options)}</style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}
function renderArticleDocument(element, options) {
  const body = renderToStaticMarkup(element);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=${options.width}, initial-scale=1" />
    <style>${buildArticleStyles(options)}</style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}

// src/cli/options.ts
function resolveCliOptions(template, id, raw, defaults = {}) {
  const format = parseEnum(raw.format, ["png", "webp"], "png");
  const width = parsePositiveInteger(raw.width, defaultWidthForTemplate(template));
  const scale = parsePositiveInteger(raw.scale, 2);
  const quality = parsePositiveInteger(raw.quality, 92);
  const theme = parseEnum(raw.theme, ["light", "dark"], "light");
  const mediaMode = parseEnum(raw.media, ["none", "first", "grid", "mosaic", "full"], defaults.mediaMode ?? "grid");
  const showStats = raw.hideStats ? false : raw.stats ?? defaults.showStats ?? template !== "post-clean";
  const showSourceFooter = raw.hideSourceFooter ? false : defaults.showSourceFooter ?? true;
  const showSubscribeButton = Boolean(raw.showSubscribe ?? defaults.showSubscribeButton ?? false);
  const showTimestamp = defaults.showTimestamp ?? true;
  const translatedText = Boolean(raw.translatedText ?? defaults.translatedText ?? false);
  const showTranslation = translatedText ? false : Boolean(raw.showTranslation ?? defaults.showTranslation ?? false);
  const timezone = typeof raw.timezone === "string" && raw.timezone ? raw.timezone : "Asia/Shanghai";
  const maxPosts = parseOptionalPositiveInteger(raw.maxPosts) ?? defaults.maxPosts;
  const columns = parseOptionalPositiveInteger(raw.columns) ?? defaults.columns;
  const render = {
    template,
    width,
    theme,
    timezone,
    mediaMode,
    showStats,
    showSourceFooter,
    showSubscribeButton,
    showTimestamp,
    showTranslation,
    translatedText,
    ...maxPosts ? { maxPosts } : {},
    ...columns ? { columns } : {}
  };
  const outPath = resolveOutputPath(template, id, format, raw.out);
  const debugHtmlPath = raw.debugHtml ? outPath.replace(/\.(png|webp)$/i, ".html") : void 0;
  const cacheDir = toAbsolutePath(typeof raw.cacheDir === "string" && raw.cacheDir ? raw.cacheDir : "cache/assets");
  return {
    render,
    format,
    scale,
    quality,
    transparent: Boolean(raw.transparent),
    outPath,
    cacheDir,
    lang: typeof raw.lang === "string" ? raw.lang : void 0,
    fixture: typeof raw.fixture === "string" ? raw.fixture : void 0,
    ...debugHtmlPath ? { debugHtmlPath } : {}
  };
}
async function readJsonFixture(filePath) {
  const absolute = toAbsolutePath(filePath);
  return JSON.parse(await readFile(absolute, "utf8"));
}
function resolveOutputPath(template, id, format, requested) {
  const filename = `${template}-${id}-${timestampForFilename()}.${format}`;
  if (!requested) return toAbsolutePath(path3.join("output", filename));
  const absolute = toAbsolutePath(requested);
  const ext = path3.extname(absolute);
  if (ext) return absolute;
  return path3.join(absolute, filename);
}
function timestampForFilename() {
  return (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
}
function parsePositiveInteger(value, fallback) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.round(number);
}
function parseOptionalPositiveInteger(value) {
  if (value === void 0) return void 0;
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : void 0;
  if (!number || !Number.isFinite(number) || number <= 0) return void 0;
  return Math.round(number);
}
function parseEnum(value, allowed, fallback) {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

// src/cli/commands/article.ts
async function exportArticleCommand(input, rawOptions) {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== "x") throw new Error("First version supports X/Twitter article export only.");
  const raw = rawOptions.fixture ? await readJsonFixture(rawOptions.fixture) : await new FxTwitterClient().getPost(parsed.id, { lang: rawOptions.lang, aboutAccount: true });
  const article = normalizeArticleResponse(raw, "x");
  const outDir = resolveArticleOutputDir(article.sourcePostId, rawOptions.out);
  await ensureDir(outDir);
  const assetMode = parseAssetMode(rawOptions.assets);
  const assetOutput = await prepareArticleAssets(article, {
    outDir,
    assetMode,
    assetsDirName: "assets"
  });
  const markdown = articleToMarkdown(article, {
    assets: assetOutput.markdownAssets,
    includeTitle: rawOptions.title !== false,
    includeCover: rawOptions.cover !== false
  });
  const articlePath = path4.join(outDir, "article.md");
  await writeFile2(articlePath, markdown, "utf8");
  if (rawOptions.metadata !== false) {
    await writeFile2(path4.join(outDir, "metadata.json"), JSON.stringify(buildMetadata(article, assetMode, assetOutput.manifest), null, 2), "utf8");
  }
  if (rawOptions.raw !== false) {
    await writeFile2(path4.join(outDir, "raw.fxembed.json"), JSON.stringify(raw, null, 2), "utf8");
  }
  return articlePath;
}
function resolveArticleOutputDir(id, requested) {
  if (!requested) return toAbsolutePath(path4.join("output", "articles", id));
  return toAbsolutePath(requested);
}
function parseAssetMode(value) {
  if (value === "remote" || value === "none") return value;
  return "local";
}
function buildMetadata(article, assetMode, assets) {
  return {
    provider: article.provider,
    source_url: article.sourceUrl,
    source_post_id: article.sourcePostId,
    article_id: article.articleId,
    title: article.title,
    preview_text: article.previewText,
    created_at: article.createdAt,
    modified_at: article.modifiedAt ?? null,
    source_created_at: article.sourceCreatedAt ?? null,
    source_metrics: article.sourceMetrics ?? null,
    author: {
      name: article.author.name,
      handle: article.author.handle,
      id: article.author.id ?? null,
      verified: article.author.verified ?? false,
      verification_type: article.author.verificationType ?? null
    },
    block_count: article.blocks.length,
    asset_mode: assetMode,
    assets
  };
}

// src/cli/commands/articleShot.ts
import path6 from "path";

// src/cache/index.ts
import { createHash as createHash2 } from "crypto";
import { readFile as readFile2, writeFile as writeFile3 } from "fs/promises";
import path5 from "path";
var AssetCache = class {
  cacheDir;
  userAgent;
  constructor(options) {
    this.cacheDir = options.cacheDir;
    this.userAgent = options.userAgent ?? "fx-brief/0.1";
  }
  async resolveImage(url, fallbackLabel = "media", options = {}) {
    if (url.startsWith("data:")) return url;
    if (url.startsWith("file:")) return fileUrlToDataUrl(url);
    try {
      const cached = await this.getOrFetch(url);
      return `data:${cached.contentType};base64,${cached.bytes.toString("base64")}`;
    } catch (error) {
      if (options.strict) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Could not resolve image asset ${url}: ${message}`);
      }
      return placeholderDataUrl(fallbackLabel);
    }
  }
  async getOrFetch(url) {
    await ensureDir(this.cacheDir);
    const key = createHash2("sha256").update(url).digest("hex");
    const ext = extensionFromUrl2(url);
    const dataPath = path5.join(this.cacheDir, `${key}${ext}`);
    const metaPath = path5.join(this.cacheDir, `${key}.json`);
    try {
      const [bytes2, metaRaw] = await Promise.all([readFile2(dataPath), readFile2(metaPath, "utf8")]);
      const meta = JSON.parse(metaRaw);
      return { bytes: bytes2, contentType: meta.contentType ?? mimeFromExtension(ext) };
    } catch {
    }
    const { bytes, contentType } = await fetchImageWithRetry(url, this.userAgent, ext);
    await Promise.all([
      writeFile3(dataPath, bytes),
      writeFile3(metaPath, JSON.stringify({ url, contentType }, null, 2))
    ]);
    return { bytes, contentType };
  }
};
async function fetchImageWithRetry(url, userAgent, ext) {
  const candidates = imageUrlCandidates(url);
  let lastError;
  for (const candidate of candidates) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(candidate, {
          headers: {
            accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "user-agent": userAgent
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || mimeFromExtension(ext);
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length === 0) {
          throw new Error("empty response body");
        }
        return { bytes, contentType };
      } catch (error) {
        lastError = error;
        await delay(150 * (attempt + 1));
      }
    }
  }
  const message = lastError instanceof Error ? lastError.message : String(lastError ?? "unknown error");
  throw new Error(`Could not fetch asset ${url}: ${message}`);
}
function imageUrlCandidates(url) {
  const candidates = [url];
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "pbs.twimg.com" && parsed.pathname.startsWith("/media/") && !parsed.searchParams.has("name")) {
      for (const name of ["large", "orig"]) {
        const candidate = new URL(url);
        const ext = extensionFromUrl2(url).replace(/^\./, "");
        if (ext && ext !== "bin") candidate.searchParams.set("format", ext === "jpeg" ? "jpg" : ext);
        candidate.searchParams.set("name", name);
        candidates.push(candidate.toString());
      }
    }
  } catch {
  }
  return [...new Set(candidates)];
}
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
async function fileUrlToDataUrl(url) {
  const parsed = new URL(url);
  const filePath = decodeURIComponent(parsed.pathname);
  const bytes = await readFile2(filePath);
  const contentType = mimeFromExtension(path5.extname(filePath));
  return `data:${contentType};base64,${bytes.toString("base64")}`;
}
function extensionFromUrl2(url) {
  try {
    const parsed = new URL(url);
    const ext = path5.extname(parsed.pathname).toLowerCase();
    return ext && ext.length <= 6 ? ext : ".bin";
  } catch {
    return ".bin";
  }
}
function mimeFromExtension(ext) {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}
function placeholderDataUrl(label) {
  const safeLabel = escapeXml(label.slice(0, 24));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#e6ecf0"/>
  <rect x="32" y="32" width="736" height="436" rx="28" fill="#d1dbe3"/>
  <text x="400" y="258" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="34" font-weight="700" fill="#536471">${safeLabel}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function escapeXml(value) {
  return value.replace(/[<>&"']/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return char;
    }
  });
}

// src/render/assets.ts
async function hydratePostAssets(post, cache) {
  const avatarAssetUrl = post.author.avatarUrl ? await cache.resolveImage(post.author.avatarUrl, post.author.handle) : void 0;
  const media = await Promise.all(post.media.map((item) => hydrateMedia(item, cache)));
  const quote = post.quote ? await hydratePostAssets(post.quote, cache) : void 0;
  return {
    ...post,
    author: avatarAssetUrl ? {
      ...post.author,
      avatarAssetUrl
    } : post.author,
    media,
    ...quote ? { quote } : {}
  };
}
async function hydrateThreadAssets(thread, cache) {
  const root = await hydratePostAssets(thread.root, cache);
  const posts = await Promise.all(thread.posts.map((post) => hydratePostAssets(post, cache)));
  return {
    ...thread,
    root,
    posts,
    author: root.author
  };
}
async function hydratePostsAssets(posts, cache) {
  return Promise.all(posts.map((post) => hydratePostAssets(post, cache)));
}
async function hydrateArticleAssets(article, cache) {
  const avatarAssetUrl = article.author.avatarUrl ? await cache.resolveImage(article.author.avatarUrl, article.author.handle) : void 0;
  const cover = article.cover ? await hydrateArticleMedia(article.cover, cache) : void 0;
  const media = await Promise.all(article.media.map((item) => hydrateArticleMedia(item, cache)));
  return {
    ...article,
    author: avatarAssetUrl ? {
      ...article.author,
      avatarAssetUrl
    } : article.author,
    ...cover ? { cover } : {},
    media
  };
}
async function hydrateProfileAssets(profile, cache) {
  const avatarAssetUrl = profile.avatarUrl ? await cache.resolveImage(profile.avatarUrl, profile.handle) : void 0;
  const bannerAssetUrl = profile.bannerUrl ? await cache.resolveImage(profile.bannerUrl, `${profile.handle}-banner`) : void 0;
  return {
    ...profile,
    ...avatarAssetUrl ? { avatarAssetUrl } : {},
    ...bannerAssetUrl ? { bannerAssetUrl } : {}
  };
}
async function hydrateMedia(media, cache) {
  if (media.type === "video" || media.type === "external") {
    const thumbnailSource = media.thumbnailUrl;
    if (thumbnailSource) {
      return {
        ...media,
        thumbnailAssetUrl: await cache.resolveImage(thumbnailSource, media.type)
      };
    }
    return {
      ...media,
      thumbnailAssetUrl: await cache.resolveImage(placeholderImageDataUrl(media.type), media.type)
    };
  }
  return {
    ...media,
    assetUrl: await cache.resolveImage(media.url, media.type)
  };
}
async function hydrateArticleMedia(media, cache) {
  return {
    ...media,
    assetUrl: await cache.resolveImage(media.url, media.type, { strict: true })
  };
}
function placeholderImageDataUrl(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
    <rect width="800" height="500" fill="#e6ecf0"/>
    <text x="400" y="258" text-anchor="middle" font-family="sans-serif" font-size="34" font-weight="700" fill="#536471">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// src/render/screenshot.ts
import { writeFile as writeFile4 } from "fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";
async function captureHtml(html, options) {
  await ensureParentDir(options.outPath);
  if (options.debugHtmlPath) {
    await ensureParentDir(options.debugHtmlPath);
    await writeFile4(options.debugHtmlPath, html, "utf8");
  }
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: {
        width: options.width,
        height: 1200
      },
      deviceScaleFactor: options.scale
    });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((img) => {
          if (img.complete) return null;
          return img.decode().catch(() => null);
        })
      );
    });
    const capture = page.locator("[data-capture]").first();
    await capture.waitFor({ state: "visible", timeout: 1e4 });
    const box = await capture.boundingBox();
    if (box) {
      const desiredHeight = Math.ceil(Math.min(Math.max(box.height + 80, 1200), 16e3));
      await page.setViewportSize({ width: options.width, height: desiredHeight });
    }
    const pngBuffer = await capture.screenshot({
      type: "png",
      animations: "disabled",
      caret: "hide",
      omitBackground: options.transparent,
      scale: "device"
    });
    if (options.format === "webp") {
      await sharp(pngBuffer).webp({ quality: options.quality }).toFile(options.outPath);
    } else {
      await writeFile4(options.outPath, pngBuffer);
    }
  } finally {
    await browser.close();
  }
}
async function captureHtmlLong(html, options) {
  if (options.writeLong) await ensureParentDir(options.outPath);
  if (options.debugHtmlPath) {
    await ensureParentDir(options.debugHtmlPath);
    await writeFile4(options.debugHtmlPath, html, "utf8");
  }
  const browser = await chromium.launch({ headless: true });
  try {
    const initialHeight = Math.min(Math.max(options.sliceHeight ?? 1400, 1200), 8e3);
    const page = await browser.newPage({
      viewport: {
        width: options.width,
        height: initialHeight
      },
      deviceScaleFactor: options.scale
    });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((img) => {
          if (img.complete) return null;
          return img.decode().catch(() => null);
        })
      );
    });
    const capture = page.locator("[data-capture]").first();
    await capture.waitFor({ state: "visible", timeout: 1e4 });
    const box = await capture.boundingBox();
    if (!box) throw new Error("Could not measure capture element.");
    const cssHeight = Math.ceil(box.height);
    const singleCaptureLimit = 16e3;
    const requestedSliceHeight = options.sliceHeight ? Math.max(1, Math.round(options.sliceHeight)) : void 0;
    if (!requestedSliceHeight && cssHeight <= singleCaptureLimit) {
      await page.setViewportSize({ width: options.width, height: Math.min(Math.max(cssHeight + 80, 1200), singleCaptureLimit) });
      const pngBuffer = await capture.screenshot({
        type: "png",
        animations: "disabled",
        caret: "hide",
        omitBackground: options.transparent,
        scale: "device"
      });
      if (options.writeLong) {
        await writeImage(pngBuffer, options.outPath, options.format, options.quality);
      }
      return {
        outPath: options.writeLong ? options.outPath : void 0,
        slicePaths: [],
        cssHeight
      };
    }
    const sliceCssHeight = Math.min(requestedSliceHeight ?? 8e3, 8e3);
    const pngSlices = [];
    const slicePaths = [];
    for (let offset = 0, index = 0; offset < cssHeight; offset += sliceCssHeight, index += 1) {
      const height = Math.min(sliceCssHeight, cssHeight - offset);
      const pngBuffer = await captureSlice(page, {
        offset,
        height,
        width: Math.ceil(box.width),
        transparent: options.transparent
      });
      pngSlices.push(pngBuffer);
      const slicePath = options.slicePathForIndex?.(index);
      if (slicePath) {
        await ensureParentDir(slicePath);
        await writeImage(pngBuffer, slicePath, options.format, options.quality);
        slicePaths.push(slicePath);
      }
    }
    if (options.writeLong) {
      const joined = pngSlices.length === 1 ? pngSlices[0] : await joinPngSlices(pngSlices, options.transparent);
      if (!joined) throw new Error("Could not assemble long screenshot.");
      await writeImage(joined, options.outPath, options.format, options.quality);
    }
    return {
      outPath: options.writeLong ? options.outPath : void 0,
      slicePaths,
      cssHeight
    };
  } finally {
    await browser.close();
  }
}
async function captureSlice(page, options) {
  await page.setViewportSize({ width: options.width, height: options.height });
  await page.evaluate(({ offset, height, width }) => {
    const capture = document.querySelector("[data-capture]");
    if (!capture) throw new Error("Missing capture element.");
    let slice2 = document.querySelector("[data-capture-slice]");
    if (!slice2) {
      slice2 = document.createElement("div");
      slice2.setAttribute("data-capture-slice", "");
      document.body.innerHTML = "";
      document.body.appendChild(slice2);
      slice2.appendChild(capture);
    }
    Object.assign(document.documentElement.style, {
      margin: "0",
      padding: "0"
    });
    Object.assign(document.body.style, {
      margin: "0",
      padding: "0",
      overflow: "hidden",
      background: "transparent",
      width: `${width}px`,
      height: `${height}px`
    });
    Object.assign(slice2.style, {
      position: "relative",
      width: `${width}px`,
      height: `${height}px`,
      overflow: "hidden",
      background: "transparent"
    });
    Object.assign(capture.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: `${width}px`,
      transform: `translateY(-${offset}px)`,
      transformOrigin: "top left"
    });
  }, options);
  const slice = page.locator("[data-capture-slice]").first();
  return slice.screenshot({
    type: "png",
    animations: "disabled",
    caret: "hide",
    omitBackground: options.transparent,
    scale: "device"
  });
}
async function joinPngSlices(slices, transparent) {
  if (slices.length === 0) return void 0;
  const metadata = await Promise.all(slices.map((slice) => sharp(slice).metadata()));
  const width = metadata.reduce((max, item) => Math.max(max, item.width ?? 0), 0);
  const height = metadata.reduce((sum, item) => sum + (item.height ?? 0), 0);
  if (width <= 0 || height <= 0) return void 0;
  let top = 0;
  const composite = slices.map((input, index) => {
    const item = metadata[index];
    const currentTop = top;
    top += item?.height ?? 0;
    return { input, left: 0, top: currentTop };
  });
  return sharp({
    create: {
      width,
      height,
      channels: transparent ? 4 : 3,
      background: transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255 }
    }
  }).composite(composite).png().toBuffer();
}
async function writeImage(buffer, outPath, format, quality) {
  if (format === "webp") {
    await sharp(buffer).webp({ quality }).toFile(outPath);
    return;
  }
  await writeFile4(outPath, buffer);
}

// src/cli/commands/articleShot.ts
async function renderArticleShotCommand(input, rawOptions) {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== "x") throw new Error("First version supports X/Twitter article screenshots only.");
  const raw = rawOptions.fixture ? await readJsonFixture(rawOptions.fixture) : await new FxTwitterClient().getPost(parsed.id, { lang: rawOptions.lang, aboutAccount: true });
  const article = normalizeArticleResponse(raw, "x");
  const resolved = resolveArticleShotOptions(article.sourcePostId, rawOptions);
  const hydrated = await hydrateArticleAssets(article, new AssetCache({ cacheDir: resolved.cacheDir }));
  const html = renderArticleShotHtml(hydrated, resolved.render);
  const result = await captureHtmlLong(html, {
    width: resolved.render.width,
    scale: resolved.scale,
    format: resolved.format,
    quality: resolved.quality,
    transparent: resolved.transparent,
    outPath: resolved.outPath,
    ...resolved.debugHtmlPath ? { debugHtmlPath: resolved.debugHtmlPath } : {},
    ...resolved.sliceHeight !== void 0 ? { sliceHeight: resolved.sliceHeight } : {},
    ...resolved.slicePathForIndex ? { slicePathForIndex: resolved.slicePathForIndex } : {},
    writeLong: true
  });
  return result.outPath ?? resolved.outPath;
}
function resolveArticleShotOptions(id, raw) {
  const format = parseEnum2(raw.format, ["png", "webp"], "png");
  const width = parsePositiveInteger2(raw.width, 540);
  const scale = parsePositiveInteger2(raw.scale, 2);
  const quality = parsePositiveInteger2(raw.quality, 92);
  const theme = parseEnum2(raw.theme, ["light", "dark"], "light");
  const style = parseEnum2(raw.style, ["article-x", "article-clean"], "article-x");
  const timezone = typeof raw.timezone === "string" && raw.timezone ? raw.timezone : "Asia/Shanghai";
  const sliceHeight = parseOptionalPositiveInteger2(raw.sliceHeight);
  const output = resolveArticleShotOutput(id, format, raw.out, sliceHeight !== void 0);
  const debugHtmlPath = raw.debugHtml ? debugHtmlPathForOutput(output.outPath) : void 0;
  const cacheDir = toAbsolutePath(typeof raw.cacheDir === "string" && raw.cacheDir ? raw.cacheDir : "cache/assets");
  const render = {
    style,
    width,
    theme,
    timezone,
    showSourceFooter: !raw.hideSourceFooter,
    showCover: raw.cover !== false,
    showActions: style === "article-x" && !raw.hideActions
  };
  return {
    render,
    format,
    scale,
    quality,
    transparent: Boolean(raw.transparent),
    outPath: output.outPath,
    cacheDir,
    ...sliceHeight !== void 0 ? { sliceHeight } : {},
    ...output.slicePathForIndex ? { slicePathForIndex: output.slicePathForIndex } : {},
    ...typeof raw.lang === "string" ? { lang: raw.lang } : {},
    ...typeof raw.fixture === "string" ? { fixture: raw.fixture } : {},
    ...debugHtmlPath ? { debugHtmlPath } : {}
  };
}
function resolveArticleShotOutput(id, format, requested, sliced) {
  const timestamp = timestampForFilename2();
  const defaultBase = `article-shot-${id}-${timestamp}`;
  if (!requested) {
    const outPath2 = toAbsolutePath(path6.join("output", `${defaultBase}.${format}`));
    return {
      outPath: outPath2,
      ...sliced ? { slicePathForIndex: (index) => path6.join(path6.dirname(outPath2), `${defaultBase}-${padIndex(index)}.${format}`) } : {}
    };
  }
  const absolute = toAbsolutePath(requested);
  const ext = path6.extname(absolute);
  if (ext) {
    const parsed = path6.parse(absolute);
    return {
      outPath: absolute,
      ...sliced ? { slicePathForIndex: (index) => path6.join(parsed.dir, `${parsed.name}-${padIndex(index)}${ext}`) } : {}
    };
  }
  const outPath = path6.join(absolute, `article-long.${format}`);
  return {
    outPath,
    ...sliced ? { slicePathForIndex: (index) => path6.join(absolute, `article-${padIndex(index)}.${format}`) } : {}
  };
}
function debugHtmlPathForOutput(outPath) {
  const parsed = path6.parse(outPath);
  return path6.join(parsed.dir, `${parsed.name}.html`);
}
function timestampForFilename2() {
  return (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
}
function padIndex(index) {
  return String(index + 1).padStart(2, "0");
}
function parsePositiveInteger2(value, fallback) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.round(number);
}
function parseOptionalPositiveInteger2(value) {
  if (value === void 0) return void 0;
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : void 0;
  if (!number || !Number.isFinite(number) || number <= 0) return void 0;
  return Math.round(number);
}
function parseEnum2(value, allowed, fallback) {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

// src/cli/commands/json.ts
import { writeFile as writeFile5 } from "fs/promises";
import path7 from "path";

// src/normalize/socialPost.ts
function normalizePost(raw, provider = "x", depth = 0) {
  const source = asRecord4(raw);
  const author = normalizeAuthor(source.author, provider);
  const createdAt = asString2(source.created_at) ?? timestampToIso(asNumber2(source.created_timestamp)) ?? "";
  const text = asString2(source.text) ?? asString2(asRecord4(source.raw_text).text) ?? "";
  const id = asString2(source.id) ?? "";
  if (!id) {
    throw new Error("FxEmbed status payload is missing an id.");
  }
  const post = {
    provider,
    id,
    url: asString2(source.url) ?? fallbackStatusUrl(provider, author.handle, id),
    text,
    createdAt,
    author,
    media: normalizeMedia(source.media),
    sourceLabel: provider === "x" ? "X" : "Bluesky"
  };
  const createdTimestamp = asNumber2(source.created_timestamp);
  if (createdTimestamp !== void 0) post.createdTimestamp = createdTimestamp;
  const metrics = normalizeMetrics(source);
  if (Object.keys(metrics).length > 0) post.metrics = metrics;
  const quoteRaw = source.quote;
  if (depth < 2 && isObject(quoteRaw) && asString2(asRecord4(quoteRaw).type) !== "tombstone") {
    try {
      post.quote = normalizePost(quoteRaw, provider, depth + 1);
    } catch {
    }
  }
  const poll = normalizePoll(source.poll);
  if (poll) post.poll = poll;
  const translation = normalizeTranslation(source.translation);
  if (translation) post.translation = translation;
  const lang = asString2(source.lang);
  if (lang !== void 0) post.lang = lang;
  const sourceName = asString2(source.source);
  if (sourceName !== void 0) post.source = sourceName;
  const possiblySensitive = asBoolean2(source.possibly_sensitive);
  if (possiblySensitive !== void 0) post.possiblySensitive = possiblySensitive;
  const isPinned = asBoolean2(source.is_pinned) ?? asBoolean2(source.pinned);
  if (isPinned !== void 0) post.isPinned = isPinned;
  const communityNote = normalizeCommunityNote(source.community_note);
  if (communityNote !== void 0) post.communityNote = communityNote;
  return post;
}
function normalizeThreadResponse(raw, provider = "x") {
  const envelope = asRecord4(raw);
  const root = normalizePost(envelope.status, provider);
  const rawThread = Array.isArray(envelope.thread) ? envelope.thread : [];
  const posts = rawThread.map((item) => safeNormalizePost(item, provider)).filter((post) => Boolean(post));
  if (!posts.some((post) => post.id === root.id)) {
    posts.unshift(root);
  }
  return {
    provider,
    root,
    posts,
    author: root.author
  };
}
function normalizePostResponse(raw, provider = "x") {
  const envelope = asRecord4(raw);
  return normalizePost(envelope.status ?? raw, provider);
}
function normalizeQuotesResponse(raw, provider = "x") {
  const envelope = asRecord4(raw);
  const results = Array.isArray(envelope.results) ? envelope.results : [];
  return results.flatMap((item) => extractPosts(item, provider));
}
function extractPosts(raw, provider) {
  const record = asRecord4(raw);
  if (record.type === "status" || record.author) {
    const post = safeNormalizePost(record, provider);
    return post ? [post] : [];
  }
  if (isObject(record.status)) {
    const post = safeNormalizePost(record.status, provider);
    return post ? [post] : [];
  }
  if (Array.isArray(record.thread)) {
    return record.thread.map((item) => safeNormalizePost(item, provider)).filter((post) => Boolean(post));
  }
  return [];
}
function safeNormalizePost(raw, provider) {
  try {
    return normalizePost(raw, provider);
  } catch {
    return void 0;
  }
}
function normalizeAuthor(raw, provider) {
  const record = asRecord4(raw);
  const handle = stripAt2(
    asString2(record.screen_name) ?? asString2(record.handle) ?? asString2(record.username) ?? asString2(record.did) ?? "unknown"
  );
  const author = {
    name: asString2(record.name) ?? asString2(record.display_name) ?? handle,
    handle
  };
  const id = asString2(record.id);
  if (id !== void 0) author.id = id;
  const avatarUrl = asString2(record.avatar_url) ?? asString2(record.avatar) ?? asString2(record.avatarUrl);
  if (avatarUrl !== void 0) author.avatarUrl = avatarUrl;
  const bannerUrl = asString2(record.banner_url) ?? asString2(record.bannerUrl);
  if (bannerUrl !== void 0) author.bannerUrl = bannerUrl;
  const description = asString2(record.description);
  if (description !== void 0) author.description = description;
  const verification = asRecord4(record.verification);
  const verified = asBoolean2(verification.verified);
  if (verified !== void 0) author.verified = verified;
  const verificationType = asString2(verification.type);
  if (verificationType === "organization" || verificationType === "government" || verificationType === "individual") {
    author.verificationType = verificationType;
  } else if (verification.type === null) {
    author.verificationType = null;
  }
  const followers = asNumber2(record.followers);
  if (followers !== void 0) author.followers = followers;
  const following = asNumber2(record.following);
  if (following !== void 0) author.following = following;
  const location = asString2(record.location);
  if (location !== void 0) author.location = location;
  const joined = asString2(record.joined);
  if (joined !== void 0) author.joined = joined;
  if (provider === "bluesky" && author.handle === "unknown") author.handle = author.name;
  return author;
}
function normalizeMedia(raw) {
  const record = asRecord4(raw);
  const candidates = [];
  if (Array.isArray(record.all)) candidates.push(...record.all);
  if (candidates.length === 0 && Array.isArray(record.photos)) candidates.push(...record.photos);
  if (candidates.length === 0 && Array.isArray(record.videos)) candidates.push(...record.videos);
  if (candidates.length === 0 && isObject(record.mosaic)) candidates.push(record.mosaic);
  if (isObject(record.external)) candidates.push(record.external);
  const seen = /* @__PURE__ */ new Set();
  const media = [];
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
function normalizeMediaItem(raw) {
  const record = asRecord4(raw);
  const originalType = asString2(record.type) ?? "photo";
  const url = asString2(record.url) ?? asString2(record.thumbnail_url);
  if (!url) return void 0;
  const mediaType = originalType === "mosaic_photo" ? "mosaic" : originalType === "video" ? "video" : originalType === "gif" ? "gif" : originalType === "external" ? "external" : "photo";
  const media = {
    type: mediaType,
    url
  };
  const id = asString2(record.id);
  if (id !== void 0) media.id = id;
  const thumbnailUrl = asString2(record.thumbnail_url);
  if (thumbnailUrl !== void 0) media.thumbnailUrl = thumbnailUrl;
  const width = asNumber2(record.width);
  if (width !== void 0) media.width = width;
  const height = asNumber2(record.height);
  if (height !== void 0) media.height = height;
  const altText = asString2(record.altText) ?? asString2(record.alt_text);
  if (altText !== void 0) media.altText = altText;
  const duration = asNumber2(record.duration);
  if (duration !== void 0) media.duration = duration;
  return media;
}
function normalizeMetrics(source) {
  const metrics = {};
  const replies = asNumber2(source.replies);
  if (replies !== void 0) metrics.replies = replies;
  const reposts = asNumber2(source.reposts);
  if (reposts !== void 0) metrics.reposts = reposts;
  const quotes = asNumber2(source.quotes);
  if (quotes !== void 0) metrics.quotes = quotes;
  const likes = asNumber2(source.likes);
  if (likes !== void 0) metrics.likes = likes;
  const views = asNumber2(source.views);
  if (views !== void 0) metrics.views = views;
  const bookmarks = asNumber2(source.bookmarks);
  if (bookmarks !== void 0) metrics.bookmarks = bookmarks;
  return metrics;
}
function normalizePoll(raw) {
  const record = asRecord4(raw);
  if (!Array.isArray(record.choices)) return void 0;
  const choices = record.choices.map((choice) => {
    const item = asRecord4(choice);
    const label = asString2(item.label);
    const count = asNumber2(item.count);
    const percentage = asNumber2(item.percentage);
    if (!label || count === void 0 || percentage === void 0) return void 0;
    return { label, count, percentage };
  }).filter((choice) => Boolean(choice));
  if (choices.length === 0) return void 0;
  const poll = {
    choices,
    totalVotes: asNumber2(record.total_votes) ?? 0
  };
  const endsAt = asString2(record.ends_at);
  if (endsAt !== void 0) poll.endsAt = endsAt;
  const timeLeft = asString2(record.time_left_en);
  if (timeLeft !== void 0) poll.timeLeft = timeLeft;
  return poll;
}
function normalizeTranslation(raw) {
  const record = asRecord4(raw);
  const text = asString2(record.text);
  if (!text) return void 0;
  const translation = { text };
  const sourceLang = asString2(record.source_lang);
  if (sourceLang !== void 0) translation.sourceLang = sourceLang;
  const targetLang = asString2(record.target_lang);
  if (targetLang !== void 0) translation.targetLang = targetLang;
  const provider = asString2(record.provider);
  if (provider !== void 0) translation.provider = provider;
  return translation;
}
function normalizeCommunityNote(raw) {
  if (raw === null) return null;
  const record = asRecord4(raw);
  const text = asString2(record.text);
  return text ? { text } : void 0;
}
function asRecord4(value) {
  return isObject(value) ? value : {};
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function asString2(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function asNumber2(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function asBoolean2(value) {
  return typeof value === "boolean" ? value : void 0;
}
function stripAt2(handle) {
  return handle.startsWith("@") ? handle.slice(1) : handle;
}
function timestampToIso(timestamp) {
  if (timestamp === void 0) return void 0;
  const millis = timestamp >= 1e12 ? timestamp : timestamp * 1e3;
  const date = new Date(millis);
  return Number.isNaN(date.getTime()) ? void 0 : date.toISOString();
}
function fallbackStatusUrl(provider, handle, id) {
  if (provider === "x") return `https://x.com/${handle}/status/${id}`;
  return `https://bsky.app/profile/${handle}/post/${id}`;
}

// src/cli/commands/json.ts
async function fetchJsonCommand(input, rawOptions) {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== "x") throw new Error("First version supports X/Twitter JSON fetching only.");
  const kind = parseKind(rawOptions.kind);
  const raw = rawOptions.fixture ? await readJsonFixture(rawOptions.fixture) : await fetchRawJson(parsed.id, kind, rawOptions);
  const data = rawOptions.normalized ? normalizeJson(raw, kind) : raw;
  const json = `${JSON.stringify(data, null, rawOptions.compact ? 0 : 2)}
`;
  if (!rawOptions.out) {
    return {
      type: "stdout",
      value: json
    };
  }
  const outPath = resolveJsonOutputPath(kind, parsed.id, rawOptions.out);
  await ensureParentDir(outPath);
  await writeFile5(outPath, json, "utf8");
  return {
    type: "file",
    value: outPath
  };
}
async function fetchRawJson(id, kind, options) {
  const client = new FxTwitterClient();
  const lang = typeof options.lang === "string" && options.lang ? options.lang : void 0;
  const aboutAccount = options.aboutAccount !== false;
  if (kind === "thread") {
    return client.getThread(id, { lang, aboutAccount });
  }
  if (kind === "quotes") {
    return client.getQuotes(id, {
      lang,
      count: parseCount(options.count, 20),
      cursor: typeof options.cursor === "string" && options.cursor ? options.cursor : void 0
    });
  }
  return client.getPost(id, { lang, aboutAccount });
}
function normalizeJson(raw, kind) {
  if (kind === "thread") return normalizeThreadResponse(raw, "x");
  if (kind === "quotes") return normalizeQuotesResponse(raw, "x");
  return normalizePostResponse(raw, "x");
}
function parseKind(value) {
  if (value === "thread" || value === "quotes") return value;
  return "post";
}
function parseCount(value, fallback) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(Math.round(number), 100);
}
function resolveJsonOutputPath(kind, id, requested) {
  const absolute = toAbsolutePath(requested);
  const ext = path7.extname(absolute);
  if (ext) return absolute;
  return path7.join(absolute, `fxembed-${kind}-${id}.json`);
}

// src/cli/commands/post.ts
async function renderPostCommand(input, template, rawOptions) {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== "x") throw new Error("First version supports X/Twitter post rendering only.");
  const resolved = resolveCliOptions(template, parsed.id, rawOptions, {
    mediaMode: template === "post-clean" ? "first" : "grid",
    showStats: template === "post-mobile"
  });
  const raw = resolved.fixture ? await readJsonFixture(resolved.fixture) : await new FxTwitterClient().getPost(parsed.id, { lang: resolved.lang, aboutAccount: true });
  const post = normalizePostResponse(raw, "x");
  const hydrated = await hydratePostAssets(post, new AssetCache({ cacheDir: resolved.cacheDir }));
  const html = renderPostHtml(hydrated, resolved.render);
  await captureHtml(html, {
    width: resolved.render.width,
    scale: resolved.scale,
    format: resolved.format,
    quality: resolved.quality,
    transparent: resolved.transparent,
    outPath: resolved.outPath,
    debugHtmlPath: resolved.debugHtmlPath
  });
  return resolved.outPath;
}

// src/normalize/socialProfile.ts
function normalizeProfileResponse(raw, provider = "x") {
  const envelope = asRecord5(raw);
  const source = asRecord5(envelope.user ?? envelope.profile ?? raw);
  const handle = stripAt3(asString3(source.screen_name) ?? asString3(source.handle) ?? asString3(source.username) ?? "");
  if (!handle) {
    throw new Error("FxEmbed profile payload is missing a handle.");
  }
  const profile = {
    provider,
    url: asString3(source.url) ?? `https://x.com/${handle}`,
    name: asString3(source.name) ?? handle,
    handle,
    metrics: {
      ...definedNumber("followers", source.followers),
      ...definedNumber("following", source.following),
      ...definedNumber("posts", source.statuses),
      ...definedNumber("media", source.media_count),
      ...definedNumber("likes", source.likes)
    }
  };
  const id = asString3(source.id);
  if (id !== void 0) profile.id = id;
  const avatarUrl = normalizeAvatarUrl(asString3(source.avatar_url) ?? asString3(source.avatar) ?? asString3(source.avatarUrl));
  if (avatarUrl !== void 0) profile.avatarUrl = avatarUrl;
  const bannerUrl = normalizeBannerUrl(asString3(source.banner_url) ?? asString3(source.bannerUrl));
  if (bannerUrl !== void 0) profile.bannerUrl = bannerUrl;
  const description = asString3(source.description) ?? asString3(asRecord5(source.raw_description).text);
  if (description !== void 0) profile.description = description;
  const location = asString3(source.location);
  if (location !== void 0) profile.location = location;
  const joined = asString3(source.joined);
  if (joined !== void 0) profile.joined = joined;
  const website = normalizeWebsite(source.website);
  if (website !== void 0) profile.website = website;
  const verification = asRecord5(source.verification);
  const verified = asBoolean3(verification.verified);
  if (verified !== void 0) profile.verified = verified;
  const verificationType = asString3(verification.type);
  if (verificationType === "organization" || verificationType === "government" || verificationType === "individual") {
    profile.verificationType = verificationType;
  } else if (verification.type === null) {
    profile.verificationType = null;
  }
  const about = asRecord5(source.about_account);
  const basedIn = asString3(about.based_in);
  const sourceStore = asString3(about.source);
  const usernameChanges = asNumber3(asRecord5(about.username_changes).count);
  if (basedIn !== void 0 || sourceStore !== void 0 || usernameChanges !== void 0) {
    profile.aboutAccount = {
      ...basedIn !== void 0 ? { basedIn } : {},
      ...sourceStore !== void 0 ? { source: sourceStore } : {},
      ...usernameChanges !== void 0 ? { usernameChanges } : {}
    };
  }
  return profile;
}
function normalizeAvatarUrl(url) {
  if (!url) return void 0;
  return url.replace(/_normal(\.[a-zA-Z0-9]+)(?:\?.*)?$/, "_400x400$1");
}
function normalizeBannerUrl(url) {
  if (!url) return void 0;
  if (/pbs\.twimg\.com\/profile_banners\/[^/]+\/[^/]+$/i.test(url)) {
    return `${url}/1500x500`;
  }
  return url;
}
function normalizeWebsite(raw) {
  if (typeof raw === "string") return raw;
  const record = asRecord5(raw);
  return asString3(record.expanded_url) ?? asString3(record.display_url) ?? asString3(record.url);
}
function stripAt3(value) {
  return value.replace(/^@/, "");
}
function asRecord5(value) {
  return value && typeof value === "object" ? value : {};
}
function asString3(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function asNumber3(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function asBoolean3(value) {
  return typeof value === "boolean" ? value : void 0;
}
function definedNumber(key, value) {
  const number = asNumber3(value);
  return number === void 0 ? {} : { [key]: number };
}

// src/cli/commands/profile.ts
async function renderProfileCommand(input, rawOptions) {
  const parsed = parseProfileUrl(input);
  if (parsed.provider !== "x") throw new Error("First version supports X/Twitter profile rendering only.");
  const resolved = resolveCliOptions("profile-card", parsed.handle, rawOptions, {
    mediaMode: "first",
    showStats: false,
    showTimestamp: false
  });
  const client = new FxTwitterClient();
  const raw = resolved.fixture ? await readJsonFixture(resolved.fixture) : await client.getProfile(parsed.handle, { aboutAccount: true });
  const postCount = parseProfilePostCount(rawOptions);
  const timelineRaw = postCount > 0 ? await client.getProfileStatuses(parsed.handle, {
    count: postCount,
    lang: resolved.lang,
    withReplies: Boolean(rawOptions.withReplies)
  }) : void 0;
  const profile = normalizeProfileResponse(raw, "x");
  const cache = new AssetCache({ cacheDir: resolved.cacheDir });
  const hydrated = await hydrateProfileAssets(profile, cache);
  const timelinePosts = timelineRaw ? profilePosts(timelineRaw).slice(0, postCount) : [];
  const hydratedTimelinePosts = await hydratePostsAssets(timelinePosts, cache);
  const html = renderProfileHtml(hydrated, resolved.render, hydratedTimelinePosts);
  await captureHtml(html, {
    width: resolved.render.width,
    scale: resolved.scale,
    format: resolved.format,
    quality: resolved.quality,
    transparent: resolved.transparent,
    outPath: resolved.outPath,
    debugHtmlPath: resolved.debugHtmlPath
  });
  return resolved.outPath;
}
function profilePosts(raw) {
  const envelope = raw && typeof raw === "object" ? raw : {};
  const results = Array.isArray(envelope.results) ? envelope.results : [];
  const posts = [];
  for (const item of results) {
    try {
      posts.push(normalizePost(item, "x"));
    } catch {
    }
  }
  return posts;
}
function parseProfilePostCount(rawOptions) {
  const requested = rawOptions.count;
  const fallback = rawOptions.latestPost ? 1 : 0;
  const number = typeof requested === "number" ? requested : typeof requested === "string" ? Number(requested) : fallback;
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(Math.round(number), 6);
}

// src/cli/commands/quotes.ts
async function renderQuoteWallCommand(input, rawOptions) {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== "x") throw new Error("First version supports X/Twitter quote-wall rendering only.");
  const resolved = resolveCliOptions("quote-wall", parsed.id, rawOptions, {
    mediaMode: "none",
    showStats: true,
    columns: 2
  });
  const count = parseCount2(rawOptions.count, 12);
  const client = new FxTwitterClient();
  const [sourceRaw, quotesRaw] = await Promise.all([
    client.getPost(parsed.id, { lang: resolved.lang, aboutAccount: true }),
    client.getQuotes(parsed.id, { count, lang: resolved.lang })
  ]);
  const sourcePost = normalizePostResponse(sourceRaw, "x");
  const quotes = normalizeQuotesResponse(quotesRaw, "x").slice(0, count);
  const cache = new AssetCache({ cacheDir: resolved.cacheDir });
  const hydratedSource = await hydratePostAssets(sourcePost, cache);
  const hydratedQuotes = await hydratePostsAssets(quotes, cache);
  const html = renderQuoteWallHtml(hydratedSource, hydratedQuotes, resolved.render);
  await captureHtml(html, {
    width: resolved.render.width,
    scale: resolved.scale,
    format: resolved.format,
    quality: resolved.quality,
    transparent: resolved.transparent,
    outPath: resolved.outPath,
    debugHtmlPath: resolved.debugHtmlPath
  });
  return resolved.outPath;
}
function parseCount2(value, fallback) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(Math.round(number), 100);
}

// src/cli/commands/thread.ts
async function renderThreadCommand(input, rawOptions) {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== "x") throw new Error("First version supports X/Twitter thread rendering only.");
  const resolved = resolveCliOptions("thread-vertical", parsed.id, rawOptions, {
    mediaMode: "grid",
    showStats: false,
    maxPosts: 6
  });
  const raw = resolved.fixture ? await readJsonFixture(resolved.fixture) : await new FxTwitterClient().getThread(parsed.id, { lang: resolved.lang, aboutAccount: true });
  const thread = normalizeThreadResponse(raw, "x");
  const hydrated = await hydrateThreadAssets(thread, new AssetCache({ cacheDir: resolved.cacheDir }));
  const html = renderThreadHtml(hydrated, resolved.render);
  await captureHtml(html, {
    width: resolved.render.width,
    scale: resolved.scale,
    format: resolved.format,
    quality: resolved.quality,
    transparent: resolved.transparent,
    outPath: resolved.outPath,
    debugHtmlPath: resolved.debugHtmlPath
  });
  return resolved.outPath;
}

// src/cli/index.ts
var program = new Command();
program.name("fxbrief").description("Render clean local news materials from FxEmbed-powered X/Twitter data.").version("0.2.4");
addPostCommand(program);
addShortcutPostCommand(program, "post-mobile", "Render a 430px mobile-style X post card.", "post-mobile");
addShortcutPostCommand(program, "post-clean", "Render an editorial source quotation card.", "post-clean");
addThreadCommand(program);
addQuoteWallCommand(program);
addArticleCommand(program);
addArticleShotCommand(program);
addJsonCommand(program);
addProfileCommand(program);
program.parseAsync(process.argv).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
function addCommonOptions(command) {
  return command.option("-o, --out <path>", "Output file path, or output directory when no extension is provided.").option("--format <png|webp>", "Output image format.", "png").option("--width <px>", "Capture width in CSS pixels.").option("--scale <number>", "Device scale factor for high-DPI output.", "2").option("--quality <number>", "WebP quality, 1-100.", "92").option("--theme <light|dark>", "Visual theme.", "light").option("--timezone <tz>", "Timezone used for rendered timestamps.", "Asia/Shanghai").option("--lang <code>", "Request FxEmbed translation for the target language, e.g. zh-cn or en.").option("--translated-text", "Render translated post body text instead of the original when --lang returns a translation.").option("--media <none|first|grid|mosaic|full>", "Media rendering mode.").option("--stats", "Show engagement metrics.").option("--hide-stats", "Hide engagement metrics.").option("--show-subscribe", "Show the post-mobile Subscribe button when you know the account offers subscriptions.").option("--hide-source-footer", "Hide provenance footer.").option("--show-translation", "Show translation block when FxEmbed returns one.").option("--transparent", "Capture with transparent background.").option("--cache-dir <path>", "Directory for downloaded image cache.", "cache/assets").option("--debug-html", "Write the intermediate HTML next to the image.");
}
function addPostCommand(parent) {
  const command = addCommonOptions(
    new Command("post").description("Render a single post with a selected template.").argument("<url-or-id>", "X/Twitter status URL or numeric status id.").option("--template <post-mobile|post-clean>", "Post template to render.", "post-mobile").option("--fixture <path>", "Read a saved FxEmbed JSON response instead of calling the API.")
  );
  command.action(async (input, options) => {
    const template = options.template === "post-clean" ? "post-clean" : "post-mobile";
    const out = await renderPostCommand(input, template, options);
    console.log(out);
  });
  parent.addCommand(command);
}
function addShortcutPostCommand(parent, name, description, template) {
  const command = addCommonOptions(
    new Command(name).description(description).argument("<url-or-id>", "X/Twitter status URL or numeric status id.").option("--fixture <path>", "Read a saved FxEmbed JSON response instead of calling the API.")
  );
  command.action(async (input, options) => {
    const out = await renderPostCommand(input, template, options);
    console.log(out);
  });
  parent.addCommand(command);
}
function addThreadCommand(parent) {
  const command = addCommonOptions(
    new Command("thread-vertical").description("Render an unrolled X/Twitter thread as a vertical long image.").argument("<url-or-id>", "X/Twitter status URL or numeric status id.").option("--max-posts <number>", "Maximum posts to render from the thread.", "6").option("--fixture <path>", "Read a saved FxEmbed thread JSON response instead of calling the API.")
  );
  command.action(async (input, options) => {
    const out = await renderThreadCommand(input, options);
    console.log(out);
  });
  parent.addCommand(command);
}
function addQuoteWallCommand(parent) {
  const command = addCommonOptions(
    new Command("quote-wall").description("Render quote posts as a reaction wall.").argument("<url-or-id>", "X/Twitter status URL or numeric status id.").option("--count <number>", "Number of quote posts to request.", "12").option("--columns <number>", "Number of wall columns.", "2")
  );
  command.action(async (input, options) => {
    const out = await renderQuoteWallCommand(input, options);
    console.log(out);
  });
  parent.addCommand(command);
}
function addArticleCommand(parent) {
  const command = new Command("article-md").description("Export an X Article to Markdown with cover and inline media assets.").argument("<url-or-id>", "X/Twitter status URL or numeric status id containing an X Article.").option("-o, --out <dir>", "Output directory. Defaults to output/articles/<status-id>.").option("--assets <local|remote|none>", "How image assets should be referenced.", "local").option("--lang <code>", "Request FxEmbed with a target language when available.").option("--fixture <path>", "Read a saved FxEmbed article JSON response instead of calling the API.").option("--no-raw", "Do not write raw.fxembed.json.").option("--no-metadata", "Do not write metadata.json.").option("--no-title", "Do not prepend the article title as a Markdown H1.").option("--no-cover", "Do not include the cover image in article.md.");
  command.action(async (input, options) => {
    const out = await exportArticleCommand(input, options);
    console.log(out);
  });
  parent.addCommand(command);
}
function addArticleShotCommand(parent) {
  const command = new Command("article-shot").description("Render an X Article as a local long screenshot.").argument("<url-or-id>", "X/Twitter status URL or numeric status id containing an X Article.").option("-o, --out <path>", "Output image path, or output directory when no extension is provided.").option("--style <article-x|article-clean>", "Article screenshot style.", "article-x").option("--format <png|webp>", "Output image format.", "png").option("--width <px>", "Capture width in CSS pixels.", "540").option("--scale <number>", "Device scale factor for high-DPI output.", "2").option("--quality <number>", "WebP quality, 1-100.", "92").option("--theme <light|dark>", "Visual theme.", "light").option("--timezone <tz>", "Timezone used for rendered timestamps.", "Asia/Shanghai").option("--lang <code>", "Request FxEmbed with a target language when available.").option("--slice-height <px>", "Also export platform-friendly image slices at this CSS-pixel height.").option("--fixture <path>", "Read a saved FxEmbed article JSON response instead of calling the API.").option("--hide-source-footer", "Hide provenance footer.").option("--hide-actions", "Hide the X-style action row and header actions.").option("--no-cover", "Do not render the article cover image.").option("--transparent", "Capture with transparent background.").option("--cache-dir <path>", "Directory for downloaded image cache.", "cache/assets").option("--debug-html", "Write the intermediate HTML next to the image.");
  command.action(async (input, options) => {
    const out = await renderArticleShotCommand(input, options);
    console.log(out);
  });
  parent.addCommand(command);
}
function addJsonCommand(parent) {
  const command = new Command("json").alias("raw-json").description("Fetch FxEmbed JSON for an X/Twitter post, thread, or quote list.").argument("<url-or-id>", "X/Twitter status URL or numeric status id.").option("-o, --out <path>", "Write JSON to a file path, or to fxembed-<kind>-<id>.json inside a directory.").option("--kind <post|thread|quotes>", "FxEmbed data to fetch.", "post").option("--lang <code>", "Request FxEmbed translation for the target language, e.g. zh-cn or en.").option("--count <number>", "Quote count when --kind quotes is used.", "20").option("--cursor <value>", "Quote pagination cursor when --kind quotes is used.").option("--no-about-account", "Do not request expanded account metadata for post/thread responses.").option("--fixture <path>", "Read a saved FxEmbed JSON response instead of calling the API.").option("--normalized", "Output fxbrief normalized JSON instead of the raw FxEmbed response.").option("--compact", "Print or write compact JSON without indentation.");
  command.action(async (input, options) => {
    const result = await fetchJsonCommand(input, options);
    process.stdout.write(result.value);
    if (result.type === "file") process.stdout.write("\n");
  });
  parent.addCommand(command);
}
function addProfileCommand(parent) {
  const command = addCommonOptions(
    new Command("profile-card").description("Render an X/Twitter profile card for a handle or profile URL.").argument("<profile-url-or-handle>", "X/Twitter profile URL, @handle, or handle.").option("--fixture <path>", "Read a saved FxEmbed profile JSON response instead of calling the API.").option("--count <number>", "Append this many profile posts below the card, 1-6. Defaults to 0.", "0").option("--latest-post", "Shortcut for --count 1.").option("--with-replies", "Include replies when fetching profile posts.")
  );
  command.action(async (input, options) => {
    const out = await renderProfileCommand(input, options);
    console.log(out);
  });
  parent.addCommand(command);
}
//# sourceMappingURL=index.js.map