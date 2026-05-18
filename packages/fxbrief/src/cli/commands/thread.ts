import { AssetCache } from '../../cache/index.js';
import { FxTwitterClient } from '../../providers/fxTwitter.js';
import { parseSocialUrl } from '../../providers/parseUrl.js';
import { normalizeThreadResponse } from '../../normalize/socialPost.js';
import { hydrateThreadAssets } from '../../render/assets.js';
import { renderThreadHtml } from '../../render/renderHtml.js';
import { captureHtml } from '../../render/screenshot.js';
import type { CommonCliOptions } from '../../types.js';
import { readJsonFixture, resolveCliOptions } from '../options.js';

export async function renderThreadCommand(input: string, rawOptions: CommonCliOptions & Record<string, unknown>): Promise<string> {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== 'x') throw new Error('First version supports X/Twitter thread rendering only.');

  const resolved = resolveCliOptions('thread-vertical', parsed.id, rawOptions, {
    mediaMode: 'grid',
    showStats: false,
    maxPosts: 6,
  });

  const raw = resolved.fixture
    ? await readJsonFixture(resolved.fixture)
    : await new FxTwitterClient().getThread(parsed.id, { lang: resolved.lang, aboutAccount: true });

  const thread = normalizeThreadResponse(raw, 'x');
  const hydrated = await hydrateThreadAssets(thread, new AssetCache({ cacheDir: resolved.cacheDir }));
  const html = renderThreadHtml(hydrated, resolved.render);

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
