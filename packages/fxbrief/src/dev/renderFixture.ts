import { readFile } from 'node:fs/promises';
import { AssetCache } from '../cache/index.js';
import { normalizePostResponse, normalizeQuotesResponse, normalizeThreadResponse } from '../normalize/socialPost.js';
import { hydratePostAssets, hydratePostsAssets, hydrateThreadAssets } from '../render/assets.js';
import { renderPostHtml, renderQuoteWallHtml, renderThreadHtml } from '../render/renderHtml.js';
import { captureHtml } from '../render/screenshot.js';
import type { RenderOptions } from '../types.js';

const baseOptions: RenderOptions = {
  template: 'post-mobile',
  width: 430,
  theme: 'light',
  timezone: 'Asia/Shanghai',
  mediaMode: 'grid',
  showStats: true,
  showSourceFooter: true,
  showTimestamp: true,
  showTranslation: false,
  translatedText: false,
};

async function main(): Promise<void> {
  const cache = new AssetCache({ cacheDir: 'cache/assets' });
  const postRaw = JSON.parse(await readFile('fixtures/post.json', 'utf8')) as unknown;
  const threadRaw = JSON.parse(await readFile('fixtures/thread.json', 'utf8')) as unknown;
  const quotesRaw = JSON.parse(await readFile('fixtures/quotes.json', 'utf8')) as unknown;

  const post = await hydratePostAssets(normalizePostResponse(postRaw, 'x'), cache);
  await captureHtml(renderPostHtml(post, baseOptions), {
    width: 430,
    scale: 2,
    format: 'png',
    quality: 92,
    transparent: false,
    outPath: 'output/fixture-post-mobile.png',
    debugHtmlPath: 'output/fixture-post-mobile.html',
  });

  await captureHtml(renderPostHtml(post, { ...baseOptions, template: 'post-clean', width: 390, mediaMode: 'first', showStats: false }), {
    width: 390,
    scale: 2,
    format: 'png',
    quality: 92,
    transparent: false,
    outPath: 'output/fixture-post-clean.png',
    debugHtmlPath: 'output/fixture-post-clean.html',
  });

  const thread = await hydrateThreadAssets(normalizeThreadResponse(threadRaw, 'x'), cache);
  await captureHtml(renderThreadHtml(thread, { ...baseOptions, template: 'thread-vertical', width: 390, showStats: false, maxPosts: 3 }), {
    width: 390,
    scale: 2,
    format: 'png',
    quality: 92,
    transparent: false,
    outPath: 'output/fixture-thread-vertical.png',
    debugHtmlPath: 'output/fixture-thread-vertical.html',
  });

  const quotes = await hydratePostsAssets(normalizeQuotesResponse(quotesRaw, 'x'), cache);
  await captureHtml(renderQuoteWallHtml(post, quotes, { ...baseOptions, template: 'quote-wall', width: 920, mediaMode: 'none', columns: 2 }), {
    width: 920,
    scale: 2,
    format: 'png',
    quality: 92,
    transparent: false,
    outPath: 'output/fixture-quote-wall.png',
    debugHtmlPath: 'output/fixture-quote-wall.html',
  });

  console.log('Rendered fixture images to output/.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
