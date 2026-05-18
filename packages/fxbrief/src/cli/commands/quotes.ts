import { AssetCache } from '../../cache/index.js';
import { FxTwitterClient } from '../../providers/fxTwitter.js';
import { parseSocialUrl } from '../../providers/parseUrl.js';
import { normalizePostResponse, normalizeQuotesResponse } from '../../normalize/socialPost.js';
import { hydratePostAssets, hydratePostsAssets } from '../../render/assets.js';
import { renderQuoteWallHtml } from '../../render/renderHtml.js';
import { captureHtml } from '../../render/screenshot.js';
import type { CommonCliOptions } from '../../types.js';
import { resolveCliOptions } from '../options.js';

export async function renderQuoteWallCommand(input: string, rawOptions: CommonCliOptions & Record<string, unknown>): Promise<string> {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== 'x') throw new Error('First version supports X/Twitter quote-wall rendering only.');

  const resolved = resolveCliOptions('quote-wall', parsed.id, rawOptions, {
    mediaMode: 'none',
    showStats: true,
    columns: 2,
  });

  const count = parseCount(rawOptions.count, 12);
  const client = new FxTwitterClient();
  const [sourceRaw, quotesRaw] = await Promise.all([
    client.getPost(parsed.id, { lang: resolved.lang, aboutAccount: true }),
    client.getQuotes(parsed.id, { count, lang: resolved.lang }),
  ]);

  const sourcePost = normalizePostResponse(sourceRaw, 'x');
  const quotes = normalizeQuotesResponse(quotesRaw, 'x').slice(0, count);
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
    debugHtmlPath: resolved.debugHtmlPath,
  });

  return resolved.outPath;
}

function parseCount(value: unknown, fallback: number): number {
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : fallback;
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(Math.round(number), 100);
}
