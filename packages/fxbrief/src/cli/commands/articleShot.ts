import path from 'node:path';
import { AssetCache } from '../../cache/index.js';
import { normalizeArticleResponse } from '../../normalize/socialArticle.js';
import { FxTwitterClient } from '../../providers/fxTwitter.js';
import { parseSocialUrl } from '../../providers/parseUrl.js';
import { hydrateArticleAssets } from '../../render/assets.js';
import { renderArticleShotHtml } from '../../render/renderHtml.js';
import { captureHtmlLong } from '../../render/screenshot.js';
import type { ArticleShotRenderOptions, ArticleShotStyle, CommonCliOptions, OutputFormat, ThemeName } from '../../types.js';
import { toAbsolutePath } from '../../utils/fs.js';
import { readJsonFixture } from '../options.js';

export interface ArticleShotCliOptions extends CommonCliOptions {
  style?: ArticleShotStyle;
  sliceHeight?: string | number;
  cover?: boolean;
  hideActions?: boolean;
}

interface ResolvedArticleShotCliOptions {
  render: ArticleShotRenderOptions;
  format: OutputFormat;
  scale: number;
  quality: number;
  transparent: boolean;
  outPath: string;
  cacheDir: string;
  sliceHeight?: number | undefined;
  slicePathForIndex?: ((index: number) => string) | undefined;
  lang?: string | undefined;
  fixture?: string | undefined;
  debugHtmlPath?: string | undefined;
}

export async function renderArticleShotCommand(input: string, rawOptions: ArticleShotCliOptions & Record<string, unknown>): Promise<string> {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== 'x') throw new Error('First version supports X/Twitter article screenshots only.');

  const raw = rawOptions.fixture
    ? await readJsonFixture(rawOptions.fixture)
    : await new FxTwitterClient().getPost(parsed.id, { lang: rawOptions.lang, aboutAccount: true });

  const article = normalizeArticleResponse(raw, 'x');
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
    ...(resolved.debugHtmlPath ? { debugHtmlPath: resolved.debugHtmlPath } : {}),
    ...(resolved.sliceHeight !== undefined ? { sliceHeight: resolved.sliceHeight } : {}),
    ...(resolved.slicePathForIndex ? { slicePathForIndex: resolved.slicePathForIndex } : {}),
    writeLong: true,
  });

  return result.outPath ?? resolved.outPath;
}

function resolveArticleShotOptions(id: string, raw: ArticleShotCliOptions & Record<string, unknown>): ResolvedArticleShotCliOptions {
  const format = parseEnum<OutputFormat>(raw.format, ['png', 'webp'], 'png');
  const width = parsePositiveInteger(raw.width, 540);
  const scale = parsePositiveInteger(raw.scale, 2);
  const quality = parsePositiveInteger(raw.quality, 92);
  const theme = parseEnum<ThemeName>(raw.theme, ['light', 'dark'], 'light');
  const style = parseEnum<ArticleShotStyle>(raw.style, ['article-x', 'article-clean'], 'article-x');
  const timezone = typeof raw.timezone === 'string' && raw.timezone ? raw.timezone : 'Asia/Shanghai';
  const sliceHeight = parseOptionalPositiveInteger(raw.sliceHeight);
  const output = resolveArticleShotOutput(id, format, raw.out, sliceHeight !== undefined);
  const debugHtmlPath = raw.debugHtml ? debugHtmlPathForOutput(output.outPath) : undefined;
  const cacheDir = toAbsolutePath(typeof raw.cacheDir === 'string' && raw.cacheDir ? raw.cacheDir : 'cache/assets');

  const render: ArticleShotRenderOptions = {
    style,
    width,
    theme,
    timezone,
    showSourceFooter: !raw.hideSourceFooter,
    showCover: raw.cover !== false,
    showActions: style === 'article-x' && !raw.hideActions,
  };

  return {
    render,
    format,
    scale,
    quality,
    transparent: Boolean(raw.transparent),
    outPath: output.outPath,
    cacheDir,
    ...(sliceHeight !== undefined ? { sliceHeight } : {}),
    ...(output.slicePathForIndex ? { slicePathForIndex: output.slicePathForIndex } : {}),
    ...(typeof raw.lang === 'string' ? { lang: raw.lang } : {}),
    ...(typeof raw.fixture === 'string' ? { fixture: raw.fixture } : {}),
    ...(debugHtmlPath ? { debugHtmlPath } : {}),
  };
}

function resolveArticleShotOutput(
  id: string,
  format: OutputFormat,
  requested: string | undefined,
  sliced: boolean,
): { outPath: string; slicePathForIndex?: (index: number) => string } {
  const timestamp = timestampForFilename();
  const defaultBase = `article-shot-${id}-${timestamp}`;

  if (!requested) {
    const outPath = toAbsolutePath(path.join('output', `${defaultBase}.${format}`));
    return {
      outPath,
      ...(sliced ? { slicePathForIndex: (index: number) => path.join(path.dirname(outPath), `${defaultBase}-${padIndex(index)}.${format}`) } : {}),
    };
  }

  const absolute = toAbsolutePath(requested);
  const ext = path.extname(absolute);
  if (ext) {
    const parsed = path.parse(absolute);
    return {
      outPath: absolute,
      ...(sliced ? { slicePathForIndex: (index: number) => path.join(parsed.dir, `${parsed.name}-${padIndex(index)}${ext}`) } : {}),
    };
  }

  const outPath = path.join(absolute, `article-long.${format}`);
  return {
    outPath,
    ...(sliced ? { slicePathForIndex: (index: number) => path.join(absolute, `article-${padIndex(index)}.${format}`) } : {}),
  };
}

function debugHtmlPathForOutput(outPath: string): string {
  const parsed = path.parse(outPath);
  return path.join(parsed.dir, `${parsed.name}.html`);
}

function timestampForFilename(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function padIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function parsePositiveInteger(value: unknown, fallback: number): number {
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : fallback;
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.round(number);
}

function parseOptionalPositiveInteger(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : undefined;
  if (!number || !Number.isFinite(number) || number <= 0) return undefined;
  return Math.round(number);
}

function parseEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback;
}
