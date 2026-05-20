#!/usr/bin/env bun

type Mode = "strict_cc0" | "stock_beauty";
type Orientation = "any" | "landscape" | "portrait" | "square";
type ProviderName = "openverse" | "met" | "smithsonian" | "pexels" | "pixabay";

type Args = {
  query?: string;
  fallbackQueries: string[];
  random: boolean;
  mode: Mode;
  providers: ProviderName[];
  orientation: Orientation;
  count: number;
  cacheDir: string;
  download: boolean;
  minWidth: number;
  minHeight: number;
  safeSearch: boolean;
  seed?: string;
  verbose: boolean;
};

type ImageCandidate = {
  provider: ProviderName;
  provider_id: string;
  title?: string;
  creator?: string;
  image_url: string;
  source_url: string;
  license: string;
  license_url?: string;
  width?: number;
  height?: number;
  filetype?: string;
  attribution?: string;
  risk_flags: string[];
  raw?: unknown;
};

type ImageResult = ImageCandidate & {
  local_path?: string;
  metadata_path?: string;
  cached: boolean;
};

const STRICT_PROVIDERS: ProviderName[] = ["openverse", "met", "smithsonian"];
const STOCK_PROVIDERS: ProviderName[] = ["pexels", "pixabay"];
const DEFAULT_RANDOM_QUERIES = [
  "landscape",
  "ocean",
  "forest",
  "mountain",
  "sky",
  "flowers",
  "architecture",
  "texture",
  "space",
  "public domain art",
  "botanical illustration",
  "abstract nature",
];

const ZH_FALLBACKS: Record<string, string[]> = {
  山: ["mountain", "landscape"],
  山水: ["mountain landscape", "nature"],
  自然: ["nature", "landscape"],
  森林: ["forest", "trees"],
  树: ["trees", "forest"],
  海: ["ocean", "sea"],
  湖: ["lake", "water"],
  天空: ["sky", "clouds"],
  云: ["clouds", "sky"],
  花: ["flowers", "botanical"],
  植物: ["plants", "botanical"],
  城市: ["city", "architecture"],
  建筑: ["architecture", "building"],
  科技: ["technology", "science"],
  宇宙: ["space", "stars"],
  星: ["stars", "space"],
  艺术: ["public domain art", "painting"],
  古典: ["classical art", "public domain art"],
  历史: ["history", "museum object"],
  纹理: ["texture", "pattern"],
  背景: ["background", "texture"],
  食物: ["food", "still life"],
  动物: ["animals", "wildlife"],
  鸟: ["bird", "wildlife"],
  猫: ["cat"],
  狗: ["dog"],
};

const RISK_WORDS = [
  "brand",
  "logo",
  "trademark",
  "celebrity",
  "person",
  "people",
  "portrait",
  "face",
  "model",
  "nike",
  "apple",
  "coca-cola",
  "disney",
  "marvel",
];

function parseArgs(argv: string[]): Args {
  const home = process.env.HOME || process.cwd();
  const args: Args = {
    fallbackQueries: [],
    random: false,
    mode: "strict_cc0",
    providers: [],
    orientation: "landscape",
    count: 1,
    cacheDir: process.env.MATT_PIC_GRAB_CACHE_DIR || process.env.PIC_GRAB_CACHE_DIR || `${home}/.cache/matt-pic-grab`,
    download: true,
    minWidth: 900,
    minHeight: 600,
    safeSearch: true,
    verbose: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value) fail(`Missing value for ${token}`);
      return value;
    };

    if (token === "--query" || token === "-q") args.query = next();
    else if (token === "--fallback-query") args.fallbackQueries.push(next());
    else if (token === "--random") args.random = true;
    else if (token === "--mode") args.mode = parseMode(next());
    else if (token === "--provider" || token === "--providers") args.providers = parseProviders(next());
    else if (token === "--orientation") args.orientation = parseOrientation(next());
    else if (token === "--count") args.count = clampInt(next(), 1, 10, "--count");
    else if (token === "--cache-dir") args.cacheDir = next();
    else if (token === "--no-download") args.download = false;
    else if (token === "--min-width") args.minWidth = clampInt(next(), 0, 50000, "--min-width");
    else if (token === "--min-height") args.minHeight = clampInt(next(), 0, 50000, "--min-height");
    else if (token === "--unsafe") args.safeSearch = false;
    else if (token === "--seed") args.seed = next();
    else if (token === "--verbose") args.verbose = true;
    else if (token === "--help" || token === "-h") printHelpAndExit();
    else fail(`Unknown argument: ${token}`);
  }

  if (!args.query && !args.random) {
    args.random = true;
  }
  if (args.providers.length === 0) {
    args.providers = args.mode === "strict_cc0" ? STRICT_PROVIDERS : STOCK_PROVIDERS;
  }
  args.count = Math.max(1, Math.min(args.count, 10));
  return args;
}

function parseMode(value: string): Mode {
  if (value === "strict_cc0" || value === "stock_beauty") return value;
  fail(`Invalid --mode ${value}. Use strict_cc0 or stock_beauty.`);
}

function parseProviders(value: string): ProviderName[] {
  const providers = value.split(",").map((item) => item.trim()).filter(Boolean);
  const allowed = new Set<ProviderName>(["openverse", "met", "smithsonian", "pexels", "pixabay"]);
  for (const provider of providers) {
    if (!allowed.has(provider as ProviderName)) {
      fail(`Invalid provider ${provider}.`);
    }
  }
  return providers as ProviderName[];
}

function parseOrientation(value: string): Orientation {
  if (value === "any" || value === "landscape" || value === "portrait" || value === "square") return value;
  fail(`Invalid --orientation ${value}.`);
}

function clampInt(raw: string, min: number, max: number, label: string): number {
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < min || value > max) fail(`Invalid ${label}: ${raw}`);
  return value;
}

function printHelpAndExit(): never {
  console.log(`Usage:
  bun run scripts/grab-image.ts [--query "mountain"] [--random]

Options:
  --mode strict_cc0|stock_beauty     Default: strict_cc0
  --provider openverse,met           Override provider order
  --orientation landscape|portrait|square|any
  --count 1..10
  --fallback-query "english terms"   Repeatable fallback for Chinese queries
  --cache-dir PATH
  --no-download
  --min-width 900 --min-height 600
  --seed VALUE

Environment for optional providers:
  MATT_PIC_GRAB_CACHE_DIR / PIC_GRAB_CACHE_DIR
  OPENVERSE_CLIENT_ID / OPENVERSE_CLIENT_SECRET
  SMITHSONIAN_API_KEY
  PEXELS_API_KEY
  PIXABAY_API_KEY`);
  process.exit(0);
}

function fail(message: string): never {
  throw new Error(message);
}

function buildQueries(args: Args): string[] {
  const queries: string[] = [];
  if (args.query) queries.push(args.query.trim());
  for (const fallback of args.fallbackQueries) queries.push(fallback.trim());
  if (args.query && hasCjk(args.query)) {
    for (const [zh, en] of Object.entries(ZH_FALLBACKS)) {
      if (args.query.includes(zh)) queries.push(...en);
    }
  }
  if (args.random || queries.length === 0) {
    queries.push(pick(DEFAULT_RANDOM_QUERIES, args.seed || String(Date.now())));
  }
  return unique(queries.filter(Boolean));
}

function hasCjk(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(values: T[], seed: string): T {
  return values[hashString(seed) % values.length];
}

function shuffled<T>(values: T[], seed: string): T[] {
  const copy = [...values];
  let state = hashString(seed) || 1;
  for (let i = copy.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const queries = buildQueries(args);
    const results: ImageResult[] = [];
    const seen = new Set<string>();

    for (const provider of args.providers) {
      if (results.length >= args.count) break;
      for (const query of queries) {
        if (results.length >= args.count) break;
        const candidates = await searchProvider(provider, query, args);
        for (const candidate of candidates) {
          if (results.length >= args.count) break;
          const key = candidateKey(candidate);
          if (seen.has(key)) continue;
          seen.add(key);
          if (!isUsableCandidate(candidate, args)) continue;
          const result = await finalizeCandidate(candidate, args);
          if (result) results.push(result);
        }
      }
    }

    const output = {
      ok: results.length > 0,
      mode: args.mode,
      query: args.query || null,
      effective_queries: queries,
      cache_dir: args.cacheDir,
      count: results.length,
      results,
      notes: buildNotes(args),
      warnings: buildWarnings(args),
    };

    console.log(JSON.stringify(output, null, 2));
    process.exit(results.length > 0 ? 0 : 2);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(JSON.stringify({ ok: false, error: message }, null, 2));
    process.exit(1);
  }
}

async function searchProvider(provider: ProviderName, query: string, args: Args): Promise<ImageCandidate[]> {
  try {
    if (args.verbose) console.error(`Searching ${provider}: ${query}`);
    if (provider === "openverse") return await searchOpenverse(query, args);
    if (provider === "met") return await searchMet(query, args);
    if (provider === "smithsonian") return await searchSmithsonian(query, args);
    if (provider === "pexels") return await searchPexels(query, args);
    if (provider === "pixabay") return await searchPixabay(query, args);
  } catch (error) {
    if (args.verbose) console.error(`Provider ${provider} failed:`, error);
  }
  return [];
}

async function searchOpenverse(query: string, args: Args): Promise<ImageCandidate[]> {
  const token = await getOpenverseToken();
  const page = args.random ? 1 + (hashString(`${args.seed || Date.now()}:${query}:openverse`) % 10) : 1;
  const params = new URLSearchParams({
    format: "json",
    q: query,
    license: "cc0",
    page_size: "20",
    page: String(page),
  });
  if (args.orientation !== "any") params.set("aspect_ratio", args.orientation === "landscape" ? "wide" : args.orientation === "portrait" ? "tall" : "square");
  const headers: Record<string, string> = { "User-Agent": "matt-pic-grab/1.0" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const json = await fetchJson(`https://api.openverse.org/v1/images/?${params}`, headers);
  const rows = Array.isArray(json.results) ? json.results : [];
  return shuffled(rows, `${args.seed || ""}:${query}:openverse`).map((item: any) => ({
    provider: "openverse",
    provider_id: String(item.id || item.url),
    title: item.title,
    creator: item.creator,
    image_url: item.url,
    source_url: item.foreign_landing_url || item.url,
    license: String(item.license || "").toUpperCase() === "CC0" ? "CC0" : String(item.license || "CC0"),
    license_url: item.license_url || "https://creativecommons.org/publicdomain/zero/1.0/",
    width: toNumber(item.width),
    height: toNumber(item.height),
    filetype: item.filetype || extFromUrl(item.url),
    attribution: item.attribution,
    risk_flags: [
      "openverse_aggregates_third_party_metadata_verify_source_for_high_stakes_use",
      ...riskFlagsFromText([item.title, item.creator, JSON.stringify(item.tags || [])]),
    ],
    raw: item,
  }));
}

let openverseTokenCache: string | null | undefined;

async function getOpenverseToken(): Promise<string | null> {
  if (openverseTokenCache !== undefined) return openverseTokenCache;
  const clientId = process.env.OPENVERSE_CLIENT_ID;
  const clientSecret = process.env.OPENVERSE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    openverseTokenCache = null;
    return null;
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  const response = await fetch("https://api.openverse.org/v1/auth_tokens/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    openverseTokenCache = null;
    return null;
  }
  const json: any = await response.json();
  openverseTokenCache = json.access_token || null;
  return openverseTokenCache;
}

async function searchMet(query: string, args: Args): Promise<ImageCandidate[]> {
  const params = new URLSearchParams({ hasImages: "true", q: query });
  const search = await fetchJson(`https://collectionapi.metmuseum.org/public/collection/v1/search?${params}`);
  const ids: number[] = Array.isArray(search.objectIDs) ? search.objectIDs : [];
  const selectedIds = shuffled(ids, `${args.seed || ""}:${query}:met`).slice(0, 24);
  const candidates: ImageCandidate[] = [];
  for (const id of selectedIds) {
    if (candidates.length >= 12) break;
    const item = await fetchJson(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`).catch(() => null);
    if (!item || !item.isPublicDomain || !item.primaryImage) continue;
    candidates.push({
      provider: "met",
      provider_id: String(item.objectID),
      title: item.title,
      creator: item.artistDisplayName || item.culture || "The Metropolitan Museum of Art",
      image_url: item.primaryImage,
      source_url: item.objectURL || `https://www.metmuseum.org/art/collection/search/${item.objectID}`,
      license: "CC0 / Public Domain",
      license_url: "https://creativecommons.org/publicdomain/zero/1.0/",
      width: undefined,
      height: undefined,
      filetype: extFromUrl(item.primaryImage),
      attribution: `${item.title || "Untitled"} - The Metropolitan Museum of Art, Open Access`,
      risk_flags: riskFlagsFromText([item.title, item.artistDisplayName, item.objectName]),
      raw: item,
    });
  }
  return candidates;
}

async function searchSmithsonian(query: string, args: Args): Promise<ImageCandidate[]> {
  const apiKey = process.env.SMITHSONIAN_API_KEY;
  if (!apiKey) return [];
  const params = new URLSearchParams({
    api_key: apiKey,
    q: query,
    rows: "20",
    start: "0",
    sort: "relevancy",
  });
  params.append("fq", "online_media_type:Images");
  const json = await fetchJson(`https://api.si.edu/openaccess/api/v1.0/search?${params}`);
  const rows = json?.response?.rows || [];
  return rows.flatMap((item: any) => {
    const media = extractSmithsonianImage(item);
    const usage = JSON.stringify(item.content?.indexedStructured || {});
    if (!media || !usage.toLowerCase().includes("cc0")) return [];
    return [{
      provider: "smithsonian" as const,
      provider_id: String(item.id || item.content?.descriptiveNonRepeating?.record_ID || media),
      title: item.title || item.content?.descriptiveNonRepeating?.title?.content,
      creator: "Smithsonian Institution",
      image_url: media,
      source_url: item.url || item.content?.descriptiveNonRepeating?.record_link || media,
      license: "CC0",
      license_url: "https://creativecommons.org/publicdomain/zero/1.0/",
      filetype: extFromUrl(media),
      attribution: `${item.title || "Smithsonian Open Access item"} - Smithsonian Open Access`,
      risk_flags: riskFlagsFromText([item.title, usage]),
      raw: item,
    }];
  });
}

function extractSmithsonianImage(item: any): string | null {
  const media = item?.content?.descriptiveNonRepeating?.online_media?.media;
  if (!Array.isArray(media)) return null;
  for (const entry of media) {
    const url = entry?.content || entry?.thumbnail || entry?.idsId;
    if (typeof url === "string" && /^https?:\/\//.test(url)) return url;
  }
  return null;
}

async function searchPexels(query: string, args: Args): Promise<ImageCandidate[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];
  const endpoint = args.random && !args.query ? "https://api.pexels.com/v1/curated" : "https://api.pexels.com/v1/search";
  const params = new URLSearchParams({ per_page: "30", page: String(args.random ? 1 + (hashString(`${args.seed || Date.now()}:pexels`) % 20) : 1) });
  if (!endpoint.endsWith("/curated")) params.set("query", query);
  if (args.orientation !== "any") params.set("orientation", args.orientation);
  if (hasCjk(query)) params.set("locale", "zh-CN");
  const json = await fetchJson(`${endpoint}?${params}`, { Authorization: key });
  const rows = Array.isArray(json.photos) ? json.photos : [];
  return shuffled(rows, `${args.seed || ""}:${query}:pexels`).map((item: any) => {
    const imageUrl = item.src?.original || item.src?.large2x || item.src?.large || item.src?.landscape;
    return {
      provider: "pexels",
      provider_id: String(item.id || imageUrl),
      title: item.alt,
      creator: item.photographer,
      image_url: imageUrl,
      source_url: item.url,
      license: "Pexels License",
      license_url: "https://www.pexels.com/license/",
      width: toNumber(item.width),
      height: toNumber(item.height),
      filetype: extFromUrl(imageUrl),
      attribution: `Photo by ${item.photographer || "unknown"} on Pexels`,
      risk_flags: [
        "not_cc0_platform_stock_license",
        "do_not_sell_or_redistribute_as_standalone_stock_or_wallpaper",
        ...riskFlagsFromText([item.alt, item.photographer]),
      ],
      raw: item,
    };
  });
}

async function searchPixabay(query: string, args: Args): Promise<ImageCandidate[]> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return [];
  const params = new URLSearchParams({
    key,
    q: query,
    image_type: "photo",
    safesearch: args.safeSearch ? "true" : "false",
    editors_choice: "true",
    per_page: "30",
    page: String(args.random ? 1 + (hashString(`${args.seed || Date.now()}:pixabay`) % 10) : 1),
    min_width: String(args.minWidth),
    min_height: String(args.minHeight),
  });
  if (args.orientation === "landscape") params.set("orientation", "horizontal");
  else if (args.orientation === "portrait") params.set("orientation", "vertical");
  if (hasCjk(query)) params.set("lang", "zh");
  const json = await fetchJson(`https://pixabay.com/api/?${params}`);
  const rows = Array.isArray(json.hits) ? json.hits : [];
  return shuffled(rows, `${args.seed || ""}:${query}:pixabay`).map((item: any) => {
    const imageUrl = item.fullHDURL || item.largeImageURL || item.webformatURL;
    return {
      provider: "pixabay",
      provider_id: String(item.id || imageUrl),
      title: item.tags,
      creator: item.user,
      image_url: imageUrl,
      source_url: item.pageURL,
      license: "Pixabay Content License",
      license_url: "https://pixabay.com/service/license-summary/",
      width: toNumber(item.imageWidth || item.webformatWidth),
      height: toNumber(item.imageHeight || item.webformatHeight),
      filetype: extFromUrl(imageUrl),
      attribution: `Image by ${item.user || "unknown"} on Pixabay`,
      risk_flags: [
        "not_cc0_platform_stock_license",
        "do_not_sell_or_redistribute_as_standalone_stock_or_wallpaper",
        ...riskFlagsFromText([item.tags, item.user]),
      ],
      raw: item,
    };
  });
}

async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<any> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "matt-pic-grab/1.0",
      ...headers,
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

function isUsableCandidate(candidate: ImageCandidate, args: Args): boolean {
  if (!candidate.image_url || !/^https?:\/\//.test(candidate.image_url)) return false;
  const ext = (candidate.filetype || extFromUrl(candidate.image_url)).toLowerCase();
  if (["svg", "gif", "pdf", "html"].includes(ext)) return false;
  if (candidate.width && candidate.width < args.minWidth) return false;
  if (candidate.height && candidate.height < args.minHeight) return false;
  if (!matchesOrientation(candidate, args.orientation)) return false;
  if (args.mode === "strict_cc0" && !isStrictLicense(candidate.license)) return false;
  return true;
}

function matchesOrientation(candidate: ImageCandidate, orientation: Orientation): boolean {
  if (orientation === "any" || !candidate.width || !candidate.height) return true;
  const ratio = candidate.width / candidate.height;
  if (orientation === "landscape") return ratio >= 1.1;
  if (orientation === "portrait") return ratio <= 0.9;
  return ratio > 0.9 && ratio < 1.1;
}

function isStrictLicense(license: string): boolean {
  const normalized = license.toLowerCase();
  return normalized.includes("cc0") || normalized.includes("public domain");
}

async function finalizeCandidate(candidate: ImageCandidate, args: Args): Promise<ImageResult | null> {
  const metadataPath = `${args.cacheDir}/meta/${sanitizeFileName(candidateKey(candidate))}.json`;
  let localPath: string | undefined;
  let cached = false;

  if (args.download) {
    const downloaded = await downloadCandidate(candidate, args).catch(() => null);
    if (!downloaded) return null;
    localPath = downloaded.path;
    cached = downloaded.cached;
  }

  const result: ImageResult = {
    ...candidate,
    local_path: localPath,
    metadata_path: metadataPath,
    cached,
  };
  await writeTextFile(metadataPath, JSON.stringify(result, null, 2));
  return result;
}

async function downloadCandidate(candidate: ImageCandidate, args: Args): Promise<{ path: string; cached: boolean }> {
  const providerDir = `${args.cacheDir}/images/${candidate.provider}`;
  const ext = normalizedExt(candidate.filetype || extFromUrl(candidate.image_url));
  const filename = `${sanitizeFileName(candidate.provider_id)}-${sanitizeFileName(candidate.title || "image").slice(0, 60)}.${ext}`;
  const path = `${providerDir}/${filename}`;
  if (await exists(path)) return { path, cached: true };

  const response = await fetch(candidate.image_url, {
    headers: { "User-Agent": "matt-pic-grab/1.0" },
  });
  if (!response.ok) throw new Error(`Image download failed: ${response.status} ${response.statusText}`);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
    throw new Error(`Unexpected image content type: ${contentType}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 1024) throw new Error("Downloaded image is unexpectedly small");
  await writeBinaryFile(path, bytes);
  return { path, cached: false };
}

async function exists(path: string): Promise<boolean> {
  try {
    await Bun.file(path).arrayBuffer();
    return true;
  } catch {
    return false;
  }
}

async function writeTextFile(path: string, content: string) {
  await ensureDir(dirname(path));
  await Bun.write(path, content);
}

async function writeBinaryFile(path: string, content: Uint8Array) {
  await ensureDir(dirname(path));
  await Bun.write(path, content);
}

async function ensureDir(path: string) {
  await Bun.spawn(["mkdir", "-p", path]).exited;
}

function dirname(path: string): string {
  const index = path.lastIndexOf("/");
  return index === -1 ? "." : path.slice(0, index);
}

function candidateKey(candidate: ImageCandidate): string {
  return `${candidate.provider}-${candidate.provider_id}`;
}

function extFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : "jpg";
  } catch {
    return "jpg";
  }
}

function normalizedExt(ext: string): string {
  const clean = ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  if (clean === "jpeg") return "jpg";
  if (["jpg", "png", "webp", "tif", "tiff", "avif"].includes(clean)) return clean;
  return "jpg";
}

function sanitizeFileName(value: string): string {
  return value
    .replace(/https?:\/\//g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140) || "image";
}

function toNumber(value: unknown): number | undefined {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function riskFlagsFromText(values: unknown[]): string[] {
  const text = values.filter(Boolean).join(" ").toLowerCase();
  const flags = new Set<string>();
  for (const word of RISK_WORDS) {
    if (text.includes(word)) flags.add(`depicted_rights_possible_${word.replace(/[^a-z0-9]+/g, "_")}`);
  }
  return [...flags];
}

function buildNotes(args: Args): string[] {
  if (args.mode === "strict_cc0") {
    return [
      "strict_cc0 only returns candidates whose provider metadata says CC0 or public domain.",
      "For high-stakes commercial use, verify the source_url and avoid recognizable people, brands, logos, private property, and modern artworks unless separately cleared.",
      "Openverse anonymous access is rate-limited; set OPENVERSE_CLIENT_ID and OPENVERSE_CLIENT_SECRET for heavier usage.",
    ];
  }
  return [
    "stock_beauty prioritizes modern stock aesthetics but uses platform-specific licenses, not CC0.",
    "Do not sell or redistribute unmodified platform stock images as standalone files, wallpaper packs, prints, or stock-photo substitutes.",
  ];
}

function buildWarnings(args: Args): string[] {
  const warnings: string[] = [];
  if (args.providers.includes("smithsonian") && !process.env.SMITHSONIAN_API_KEY) {
    warnings.push("Smithsonian provider skipped because SMITHSONIAN_API_KEY is not set.");
  }
  if (args.providers.includes("pexels") && !process.env.PEXELS_API_KEY) {
    warnings.push("Pexels provider skipped because PEXELS_API_KEY is not set.");
  }
  if (args.providers.includes("pixabay") && !process.env.PIXABAY_API_KEY) {
    warnings.push("Pixabay provider skipped because PIXABAY_API_KEY is not set.");
  }
  return warnings;
}

main();
