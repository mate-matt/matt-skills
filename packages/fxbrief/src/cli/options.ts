import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { CommonCliOptions, MediaMode, OutputFormat, RenderOptions, RenderTemplate, ThemeName } from '../types.js';
import { defaultWidthForTemplate } from '../render/renderHtml.js';
import { toAbsolutePath } from '../utils/fs.js';

export interface ResolvedCliOptions {
  render: RenderOptions;
  format: OutputFormat;
  scale: number;
  quality: number;
  transparent: boolean;
  outPath: string;
  cacheDir: string;
  lang?: string | undefined;
  fixture?: string | undefined;
  debugHtmlPath?: string | undefined;
}

export function resolveCliOptions(
  template: RenderTemplate,
  id: string,
  raw: CommonCliOptions & Record<string, unknown>,
  defaults: Partial<RenderOptions> = {},
): ResolvedCliOptions {
  const format = parseEnum(raw.format, ['png', 'webp'], 'png');
  const width = parsePositiveInteger(raw.width, defaultWidthForTemplate(template));
  const scale = parsePositiveInteger(raw.scale, 2);
  const quality = parsePositiveInteger(raw.quality, 92);
  const theme = parseEnum<ThemeName>(raw.theme, ['light', 'dark'], 'light');
  const mediaMode = parseEnum<MediaMode>(raw.media, ['none', 'first', 'grid', 'mosaic', 'full'], defaults.mediaMode ?? 'grid');
  const showStats = raw.hideStats ? false : raw.stats ?? defaults.showStats ?? template !== 'post-clean';
  const showSourceFooter = raw.hideSourceFooter ? false : defaults.showSourceFooter ?? true;
  const showSubscribeButton = Boolean(raw.showSubscribe ?? defaults.showSubscribeButton ?? false);
  const showTimestamp = defaults.showTimestamp ?? true;
  const translatedText = Boolean(raw.translatedText ?? defaults.translatedText ?? false);
  const showTranslation = translatedText ? false : Boolean(raw.showTranslation ?? defaults.showTranslation ?? false);
  const timezone = typeof raw.timezone === 'string' && raw.timezone ? raw.timezone : 'Asia/Shanghai';
  const maxPosts = parseOptionalPositiveInteger(raw.maxPosts) ?? defaults.maxPosts;
  const columns = parseOptionalPositiveInteger(raw.columns) ?? defaults.columns;

  const render: RenderOptions = {
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
    ...(maxPosts ? { maxPosts } : {}),
    ...(columns ? { columns } : {}),
  };

  const outPath = resolveOutputPath(template, id, format, raw.out);
  const debugHtmlPath = raw.debugHtml ? outPath.replace(/\.(png|webp)$/i, '.html') : undefined;
  const cacheDir = toAbsolutePath(typeof raw.cacheDir === 'string' && raw.cacheDir ? raw.cacheDir : 'cache/assets');

  return {
    render,
    format,
    scale,
    quality,
    transparent: Boolean(raw.transparent),
    outPath,
    cacheDir,
    lang: typeof raw.lang === 'string' ? raw.lang : undefined,
    fixture: typeof raw.fixture === 'string' ? raw.fixture : undefined,
    ...(debugHtmlPath ? { debugHtmlPath } : {}),
  };
}

export async function readJsonFixture(filePath: string): Promise<unknown> {
  const absolute = toAbsolutePath(filePath);
  return JSON.parse(await readFile(absolute, 'utf8')) as unknown;
}

function resolveOutputPath(template: RenderTemplate, id: string, format: OutputFormat, requested?: string): string {
  const filename = `${template}-${id}-${timestampForFilename()}.${format}`;
  if (!requested) return toAbsolutePath(path.join('output', filename));

  const absolute = toAbsolutePath(requested);
  const ext = path.extname(absolute);
  if (ext) return absolute;
  return path.join(absolute, filename);
}

function timestampForFilename(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
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
