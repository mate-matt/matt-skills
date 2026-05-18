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

// src/cli/options.ts
import { readFile } from "fs/promises";
import path3 from "path";

// src/render/renderHtml.tsx
import { renderToStaticMarkup } from "react-dom/server";

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

// src/render/templates/components/MediaGrid.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function MediaGrid({ media, mode }) {
  const selected = selectMedia(media, mode);
  if (selected.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: `media-grid count-${Math.min(selected.length, 4)}`, children: selected.slice(0, 4).map((item, index) => {
    const imageSrc = item.thumbnailAssetUrl ?? item.assetUrl ?? item.thumbnailUrl ?? item.url;
    const badge = item.type === "video" ? "Video" : item.type === "gif" ? "GIF" : item.type === "external" ? "Link" : null;
    return /* @__PURE__ */ jsxs("div", { className: "media-item", children: [
      /* @__PURE__ */ jsx("img", { src: imageSrc, alt: item.altText ?? "" }),
      badge ? /* @__PURE__ */ jsx("span", { className: "media-badge", children: badge }) : null
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
import { jsx as jsx2 } from "react/jsx-runtime";
function Avatar({ author }) {
  const src = author.avatarAssetUrl ?? author.avatarUrl;
  const initials = getInitials(author.name || author.handle);
  return /* @__PURE__ */ jsx2("div", { className: "avatar", "aria-label": `${author.name} avatar`, children: src ? /* @__PURE__ */ jsx2("img", { src, alt: "" }) : /* @__PURE__ */ jsx2("span", { children: initials }) });
}
function getInitials(value) {
  const cleaned = value.trim().replace(/^@/, "");
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}

// src/render/templates/components/VerificationBadge.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function VerificationBadge({ author }) {
  if (!author.verified) return null;
  const isBlueVerified = author.verificationType === void 0 || author.verificationType === null || author.verificationType === "individual";
  if (!isBlueVerified) {
    return /* @__PURE__ */ jsx3("span", { className: "verified verified-standard", children: "\u2713" });
  }
  return /* @__PURE__ */ jsx3("span", { className: "verified-rosette", "aria-label": "Verified account", children: /* @__PURE__ */ jsxs2("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx3(
      "path",
      {
        className: "rosette-shape",
        d: "M12 1.9 14.1 4l2.9-.7 1 2.8 2.8 1-.7 2.9 2.1 2.1-2.1 2.1.7 2.9-2.8 1-1 2.8-2.9-.7L12 22.1 9.9 20l-2.9.7-1-2.8-2.8-1 .7-2.9-2.1-2.1L3.9 10l-.7-2.9 2.8-1 1-2.8 2.9.7L12 1.9Z"
      }
    ),
    /* @__PURE__ */ jsx3("path", { className: "rosette-check", d: "m8.3 12.2 2.3 2.3 5.2-5.4" })
  ] }) });
}

// src/render/templates/components/PostHeader.tsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function PostHeader({ post, timezone, showTimestamp, compact = false, showAvatar = true, actions }) {
  return /* @__PURE__ */ jsxs3("div", { className: `header-row${showAvatar ? "" : " no-avatar"}`, children: [
    showAvatar ? /* @__PURE__ */ jsx4(Avatar, { author: post.author }) : null,
    /* @__PURE__ */ jsxs3("div", { className: "author-block", children: [
      /* @__PURE__ */ jsxs3("div", { className: "author-line", children: [
        /* @__PURE__ */ jsx4("span", { className: "author-name", children: post.author.name }),
        /* @__PURE__ */ jsx4(VerificationBadge, { author: post.author })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "meta-line", children: [
        "@",
        post.author.handle,
        showTimestamp ? ` \xB7 ${formatPostDate(post.createdAt, timezone, compact ? "short" : "long")}` : null
      ] })
    ] }),
    actions ? /* @__PURE__ */ jsx4("div", { className: "header-actions", children: actions }) : null
  ] });
}

// src/render/templates/components/displayText.ts
function postBodyText(post, translatedText) {
  if (translatedText && post.translation?.text) return post.translation.text;
  return post.text || "[No text]";
}

// src/render/templates/components/PostText.tsx
import { Fragment, jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function PostText({ post, className = "post-text", showTranslation, translatedText }) {
  return /* @__PURE__ */ jsxs4(Fragment, { children: [
    /* @__PURE__ */ jsx5("p", { className, children: postBodyText(post, translatedText) }),
    showTranslation && !translatedText && post.translation?.text ? /* @__PURE__ */ jsxs4("div", { className: "translation-box", children: [
      /* @__PURE__ */ jsx5("div", { className: "translation-label", children: "Translation" }),
      post.translation.text
    ] }) : null,
    post.communityNote?.text ? /* @__PURE__ */ jsxs4("div", { className: "community-note", children: [
      /* @__PURE__ */ jsx5("div", { className: "note-label", children: "Community note" }),
      post.communityNote.text
    ] }) : null
  ] });
}

// src/render/templates/components/QuotedPost.tsx
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function QuotedPost({ post, timezone, mediaMode, translatedText }) {
  if (!post) return null;
  return /* @__PURE__ */ jsxs5("div", { className: "quote-card", children: [
    /* @__PURE__ */ jsx6(PostHeader, { post, timezone, showTimestamp: false, compact: true }),
    /* @__PURE__ */ jsx6("div", { className: "quote-text", children: postBodyText(post, translatedText) }),
    /* @__PURE__ */ jsx6(MediaGrid, { media: post.media, mode: mediaMode === "none" ? "none" : "first" })
  ] });
}

// src/render/templates/components/SourceFooter.tsx
import { jsxs as jsxs6 } from "react/jsx-runtime";
function SourceFooter({ post }) {
  const label = post.sourceLabel ?? post.provider;
  const url = truncateMiddle(compactUrl(post.url), 88);
  return /* @__PURE__ */ jsxs6("div", { className: "source-footer", children: [
    "Source: ",
    label,
    " / @",
    post.author.handle,
    " \xB7 ",
    url
  ] });
}

// src/render/templates/PostClean.tsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function PostClean({ post, options }) {
  return /* @__PURE__ */ jsxs7("article", { className: "capture post-clean", "data-capture": true, children: [
    /* @__PURE__ */ jsx7("div", { className: "clean-kicker", children: "Source quotation" }),
    /* @__PURE__ */ jsx7(PostText, { post, className: "clean-text", showTranslation: options.showTranslation, translatedText: options.translatedText }),
    /* @__PURE__ */ jsx7(MediaGrid, { media: post.media, mode: options.mediaMode === "grid" ? "first" : options.mediaMode }),
    /* @__PURE__ */ jsx7(QuotedPost, { post: post.quote, timezone: options.timezone, mediaMode: options.mediaMode, translatedText: options.translatedText }),
    /* @__PURE__ */ jsx7("div", { className: "clean-author", children: /* @__PURE__ */ jsx7(PostHeader, { post, timezone: options.timezone, showTimestamp: options.showTimestamp }) }),
    options.showSourceFooter ? /* @__PURE__ */ jsx7(SourceFooter, { post }) : null
  ] });
}

// src/render/templates/components/Poll.tsx
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function Poll({ poll }) {
  if (!poll) return null;
  return /* @__PURE__ */ jsxs8("div", { className: "poll", children: [
    poll.choices.map((choice) => /* @__PURE__ */ jsxs8("div", { className: "poll-choice", children: [
      /* @__PURE__ */ jsx8("div", { className: "poll-fill", style: { width: `${Math.max(0, Math.min(100, choice.percentage))}%` } }),
      /* @__PURE__ */ jsxs8("div", { className: "poll-label", children: [
        /* @__PURE__ */ jsx8("span", { children: choice.label }),
        /* @__PURE__ */ jsxs8("span", { children: [
          Math.round(choice.percentage),
          "%"
        ] })
      ] })
    ] }, choice.label)),
    /* @__PURE__ */ jsxs8("div", { className: "poll-total", children: [
      formatCount(poll.totalVotes),
      " votes",
      poll.timeLeft ? ` \xB7 ${poll.timeLeft}` : null
    ] })
  ] });
}

// src/render/templates/PostMobile.tsx
import { Fragment as Fragment2, jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
function PostMobile({ post, options }) {
  return /* @__PURE__ */ jsxs9("article", { className: "capture post-mobile", "data-capture": true, children: [
    /* @__PURE__ */ jsx9(PostHeader, { post, timezone: options.timezone, showTimestamp: false, actions: /* @__PURE__ */ jsx9(MobileHeaderActions, {}) }),
    /* @__PURE__ */ jsx9(PostText, { post, showTranslation: options.showTranslation, translatedText: options.translatedText }),
    /* @__PURE__ */ jsx9(MediaGrid, { media: post.media, mode: options.mediaMode }),
    /* @__PURE__ */ jsx9(Poll, { poll: post.poll }),
    /* @__PURE__ */ jsx9(QuotedPost, { post: post.quote, timezone: options.timezone, mediaMode: options.mediaMode, translatedText: options.translatedText }),
    options.showTimestamp ? /* @__PURE__ */ jsx9(MobileDetailMeta, { post, timezone: options.timezone }) : null,
    options.showStats ? /* @__PURE__ */ jsx9(MobileActionBar, { post }) : null,
    options.showSourceFooter ? /* @__PURE__ */ jsx9(SourceFooter, { post }) : null
  ] });
}
function MobileHeaderActions() {
  return /* @__PURE__ */ jsxs9("div", { className: "mobile-header-actions", children: [
    /* @__PURE__ */ jsx9("button", { className: "subscribe-button", type: "button", children: "Subscribe" }),
    /* @__PURE__ */ jsx9("button", { className: "icon-button", type: "button", "aria-label": "Grok", children: /* @__PURE__ */ jsx9(GrokIcon, {}) }),
    /* @__PURE__ */ jsxs9("button", { className: "icon-button more-button", type: "button", "aria-label": "More", children: [
      /* @__PURE__ */ jsx9("span", {}),
      /* @__PURE__ */ jsx9("span", {}),
      /* @__PURE__ */ jsx9("span", {})
    ] })
  ] });
}
function GrokIcon() {
  return /* @__PURE__ */ jsx9("svg", { viewBox: "0 0 33 32", "aria-hidden": "true", children: /* @__PURE__ */ jsx9("path", { d: "M12.745 20.54l10.97-8.19c.539-.4 1.307-.244 1.564.38 1.349 3.288.746 7.241-1.938 9.955-2.683 2.714-6.417 3.31-9.83 1.954l-3.728 1.745c5.347 3.697 11.84 2.782 15.898-1.324 3.219-3.255 4.216-7.692 3.284-11.693l.008.009c-1.351-5.878.332-8.227 3.782-13.031L33 0l-4.54 4.59v-.014L12.743 20.544m-2.263 1.987c-3.837-3.707-3.175-9.446.1-12.755 2.42-2.449 6.388-3.448 9.852-1.979l3.72-1.737c-.67-.49-1.53-1.017-2.515-1.387-4.455-1.854-9.789-.931-13.41 2.728-3.483 3.523-4.579 8.94-2.697 13.561 1.405 3.454-.899 5.898-3.22 8.364C1.49 30.2.666 31.074 0 32l10.478-9.466" }) });
}
function MobileDetailMeta({ post, timezone }) {
  const views = formatCompactMetric(post.metrics?.views);
  return /* @__PURE__ */ jsxs9("div", { className: "mobile-detail-meta", children: [
    formatPostDetailDate(post.createdAt, timezone),
    views ? /* @__PURE__ */ jsxs9(Fragment2, { children: [
      " \xB7 ",
      /* @__PURE__ */ jsx9("strong", { children: views }),
      " Views"
    ] }) : null
  ] });
}
function MobileActionBar({ post }) {
  const reposts = (post.metrics?.reposts ?? 0) + (post.metrics?.quotes ?? 0);
  return /* @__PURE__ */ jsxs9("div", { className: "mobile-actions", children: [
    /* @__PURE__ */ jsx9(MobileAction, { label: "Replies", value: post.metrics?.replies, icon: "reply" }),
    /* @__PURE__ */ jsx9(MobileAction, { label: "Reposts", value: reposts || void 0, icon: "repost" }),
    /* @__PURE__ */ jsx9(MobileAction, { label: "Likes", value: post.metrics?.likes, icon: "like" }),
    /* @__PURE__ */ jsx9(MobileAction, { label: "Bookmarks", value: post.metrics?.bookmarks, icon: "bookmark" }),
    /* @__PURE__ */ jsx9(MobileAction, { label: "Share", icon: "share" })
  ] });
}
function MobileAction({
  label,
  value,
  icon
}) {
  return /* @__PURE__ */ jsxs9("div", { className: "mobile-action", "aria-label": label, children: [
    /* @__PURE__ */ jsx9(ActionIcon, { name: icon }),
    value !== void 0 ? /* @__PURE__ */ jsx9("strong", { children: formatMetric(value) }) : null
  ] });
}
function ActionIcon({ name }) {
  if (name === "reply") {
    return /* @__PURE__ */ jsx9("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx9("path", { d: "M20 12a7.5 7.5 0 0 1-7.9 7.5 8.3 8.3 0 0 1-3.2-.8L4 20l1.4-4.4A7.3 7.3 0 0 1 4 12a7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 8 7.5Z" }) });
  }
  if (name === "repost") {
    return /* @__PURE__ */ jsxs9("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx9("path", { d: "M17 3l3 3-3 3" }),
      /* @__PURE__ */ jsx9("path", { d: "M4 11V8a2 2 0 0 1 2-2h14" }),
      /* @__PURE__ */ jsx9("path", { d: "M7 21l-3-3 3-3" }),
      /* @__PURE__ */ jsx9("path", { d: "M20 13v3a2 2 0 0 1-2 2H4" })
    ] });
  }
  if (name === "like") {
    return /* @__PURE__ */ jsx9("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx9("path", { d: "M20.5 8.9c0 5.1-8.5 10.2-8.5 10.2S3.5 14 3.5 8.9A4.4 4.4 0 0 1 8 4.5a5 5 0 0 1 4 2 5 5 0 0 1 4-2 4.4 4.4 0 0 1 4.5 4.4Z" }) });
  }
  if (name === "bookmark") {
    return /* @__PURE__ */ jsx9("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx9("path", { d: "M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" }) });
  }
  return /* @__PURE__ */ jsxs9("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx9("path", { d: "M12 4v11" }),
    /* @__PURE__ */ jsx9("path", { d: "M8 8l4-4 4 4" }),
    /* @__PURE__ */ jsx9("path", { d: "M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" })
  ] });
}

// src/render/templates/components/Metrics.tsx
import { jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx10("div", { className: "metrics", children: visible.map(([label, value]) => /* @__PURE__ */ jsxs10("span", { className: "metric", children: [
    /* @__PURE__ */ jsx10("strong", { children: formatMetric(value) }),
    /* @__PURE__ */ jsx10("span", { children: label })
  ] }, label)) });
}

// src/render/templates/QuoteWall.tsx
import { jsx as jsx11, jsxs as jsxs11 } from "react/jsx-runtime";
function QuoteWall({ sourcePost, quotes, options }) {
  const columns = options.columns ?? (options.width <= 560 ? 1 : 2);
  const style = { "--wall-columns": columns };
  const sourceText = postBodyText(sourcePost, options.translatedText);
  return /* @__PURE__ */ jsxs11("section", { className: "capture quote-wall", style, "data-capture": true, children: [
    /* @__PURE__ */ jsx11("h1", { className: "wall-title", children: "Quoted reactions" }),
    /* @__PURE__ */ jsxs11("p", { className: "wall-subtitle", children: [
      "Responses quoting @",
      sourcePost.author.handle,
      ": ",
      sourceText.slice(0, 120),
      sourceText.length > 120 ? "..." : ""
    ] }),
    quotes.length > 0 ? /* @__PURE__ */ jsx11("div", { className: "wall-grid", children: quotes.map((quote) => /* @__PURE__ */ jsxs11("article", { className: "wall-card", children: [
      /* @__PURE__ */ jsx11(PostHeader, { post: quote, timezone: options.timezone, showTimestamp: options.showTimestamp, compact: true }),
      /* @__PURE__ */ jsx11(PostText, { post: quote, showTranslation: options.showTranslation, translatedText: options.translatedText }),
      options.showStats ? /* @__PURE__ */ jsx11(Metrics, { metrics: quote.metrics }) : null
    ] }, quote.id)) }) : /* @__PURE__ */ jsx11("div", { className: "empty-state", children: "No quote posts were returned for this source post." }),
    options.showSourceFooter ? /* @__PURE__ */ jsx11(SourceFooter, { post: sourcePost }) : null
  ] });
}

// src/render/templates/ThreadVertical.tsx
import { jsx as jsx12, jsxs as jsxs12 } from "react/jsx-runtime";
function ThreadVertical({ thread, options }) {
  const posts = thread.posts.slice(0, options.maxPosts ?? thread.posts.length);
  return /* @__PURE__ */ jsx12("section", { className: "capture thread-vertical", "data-capture": true, children: posts.map((post, index) => /* @__PURE__ */ jsxs12("article", { className: "thread-item", children: [
    /* @__PURE__ */ jsxs12("div", { className: "thread-rail", children: [
      /* @__PURE__ */ jsx12(Avatar, { author: post.author }),
      /* @__PURE__ */ jsx12("div", { className: "thread-line" })
    ] }),
    /* @__PURE__ */ jsxs12("div", { className: "thread-body", children: [
      /* @__PURE__ */ jsx12(PostHeader, { post, timezone: options.timezone, showTimestamp: options.showTimestamp, compact: true, showAvatar: false }),
      /* @__PURE__ */ jsx12(PostText, { post, showTranslation: options.showTranslation, translatedText: options.translatedText }),
      /* @__PURE__ */ jsx12(MediaGrid, { media: post.media, mode: options.mediaMode }),
      options.showStats ? /* @__PURE__ */ jsx12(Metrics, { metrics: post.metrics }) : null,
      options.showSourceFooter && index === posts.length - 1 ? /* @__PURE__ */ jsx12(SourceFooter, { post: thread.root }) : null
    ] })
  ] }, post.id)) });
}

// src/render/renderHtml.tsx
import { jsx as jsx13 } from "react/jsx-runtime";
function renderPostHtml(post, options) {
  const element = options.template === "post-clean" ? /* @__PURE__ */ jsx13(PostClean, { post, options }) : /* @__PURE__ */ jsx13(PostMobile, { post, options });
  return renderDocument(element, options);
}
function renderThreadHtml(thread, options) {
  return renderDocument(/* @__PURE__ */ jsx13(ThreadVertical, { thread, options }), options);
}
function renderQuoteWallHtml(sourcePost, quotes, options) {
  return renderDocument(/* @__PURE__ */ jsx13(QuoteWall, { sourcePost, quotes, options }), options);
}
function defaultWidthForTemplate(template) {
  if (template === "quote-wall") return 920;
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
  async resolveImage(url, fallbackLabel = "media") {
    if (url.startsWith("data:")) return url;
    if (url.startsWith("file:")) return fileUrlToDataUrl(url);
    try {
      const cached = await this.getOrFetch(url);
      return `data:${cached.contentType};base64,${cached.bytes.toString("base64")}`;
    } catch {
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
    const response = await fetch(url, {
      headers: {
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "user-agent": this.userAgent
      }
    });
    if (!response.ok) {
      throw new Error(`Could not fetch asset ${url}: ${response.status}`);
    }
    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || mimeFromExtension(ext);
    const bytes = Buffer.from(await response.arrayBuffer());
    await Promise.all([
      writeFile3(dataPath, bytes),
      writeFile3(metaPath, JSON.stringify({ url, contentType }, null, 2))
    ]);
    return { bytes, contentType };
  }
};
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

// src/normalize/socialPost.ts
function normalizePost(raw, provider = "x", depth = 0) {
  const source = asRecord3(raw);
  const author = normalizeAuthor(source.author, provider);
  const createdAt = asString2(source.created_at) ?? timestampToIso(asNumber2(source.created_timestamp)) ?? "";
  const text = asString2(source.text) ?? asString2(asRecord3(source.raw_text).text) ?? "";
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
  if (depth < 2 && isObject(quoteRaw) && asString2(asRecord3(quoteRaw).type) !== "tombstone") {
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
  const communityNote = normalizeCommunityNote(source.community_note);
  if (communityNote !== void 0) post.communityNote = communityNote;
  return post;
}
function normalizeThreadResponse(raw, provider = "x") {
  const envelope = asRecord3(raw);
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
  const envelope = asRecord3(raw);
  return normalizePost(envelope.status ?? raw, provider);
}
function normalizeQuotesResponse(raw, provider = "x") {
  const envelope = asRecord3(raw);
  const results = Array.isArray(envelope.results) ? envelope.results : [];
  return results.flatMap((item) => extractPosts(item, provider));
}
function extractPosts(raw, provider) {
  const record = asRecord3(raw);
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
  const record = asRecord3(raw);
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
  const verification = asRecord3(record.verification);
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
  const record = asRecord3(raw);
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
  const record = asRecord3(raw);
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
  const record = asRecord3(raw);
  if (!Array.isArray(record.choices)) return void 0;
  const choices = record.choices.map((choice) => {
    const item = asRecord3(choice);
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
  const record = asRecord3(raw);
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
  const record = asRecord3(raw);
  const text = asString2(record.text);
  return text ? { text } : void 0;
}
function asRecord3(value) {
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

// src/cli/commands/quotes.ts
async function renderQuoteWallCommand(input, rawOptions) {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== "x") throw new Error("First version supports X/Twitter quote-wall rendering only.");
  const resolved = resolveCliOptions("quote-wall", parsed.id, rawOptions, {
    mediaMode: "none",
    showStats: true,
    columns: 2
  });
  const count = parseCount(rawOptions.count, 12);
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
function parseCount(value, fallback) {
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
program.name("fxbrief").description("Render clean local news materials from FxEmbed-powered X/Twitter data.").version("0.1.1");
addPostCommand(program);
addShortcutPostCommand(program, "post-mobile", "Render a 430px mobile-style X post card.", "post-mobile");
addShortcutPostCommand(program, "post-clean", "Render an editorial source quotation card.", "post-clean");
addThreadCommand(program);
addQuoteWallCommand(program);
addArticleCommand(program);
program.parseAsync(process.argv).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
function addCommonOptions(command) {
  return command.option("-o, --out <path>", "Output file path, or output directory when no extension is provided.").option("--format <png|webp>", "Output image format.", "png").option("--width <px>", "Capture width in CSS pixels.").option("--scale <number>", "Device scale factor for high-DPI output.", "2").option("--quality <number>", "WebP quality, 1-100.", "92").option("--theme <light|dark>", "Visual theme.", "light").option("--timezone <tz>", "Timezone used for rendered timestamps.", "Asia/Shanghai").option("--lang <code>", "Request FxEmbed translation for the target language, e.g. zh-cn or en.").option("--translated-text", "Render translated post body text instead of the original when --lang returns a translation.").option("--media <none|first|grid|mosaic|full>", "Media rendering mode.").option("--stats", "Show engagement metrics.").option("--hide-stats", "Hide engagement metrics.").option("--hide-source-footer", "Hide provenance footer.").option("--show-translation", "Show translation block when FxEmbed returns one.").option("--transparent", "Capture with transparent background.").option("--cache-dir <path>", "Directory for downloaded image cache.", "cache/assets").option("--debug-html", "Write the intermediate HTML next to the image.");
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
//# sourceMappingURL=index.js.map