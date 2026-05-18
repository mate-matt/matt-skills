import { AssetCache } from '../../cache/index.js';
import { FxTwitterClient } from '../../providers/fxTwitter.js';
import { parseSocialUrl } from '../../providers/parseUrl.js';
import { normalizePostResponse } from '../../normalize/socialPost.js';
import { hydratePostAssets } from '../../render/assets.js';
import { renderPostHtml } from '../../render/renderHtml.js';
import { captureHtml } from '../../render/screenshot.js';
import type { CommonCliOptions, RenderTemplate } from '../../types.js';
import { readJsonFixture, resolveCliOptions } from '../options.js';

export async function renderPostCommand(input: string, template: RenderTemplate, rawOptions: CommonCliOptions & Record<string, unknown>): Promise<string> {
  const parsed = parseSocialUrl(input);
  if (parsed.provider !== 'x') throw new Error('First version supports X/Twitter post rendering only.');

  const resolved = resolveCliOptions(template, parsed.id, rawOptions, {
    mediaMode: template === 'post-clean' ? 'first' : 'grid',
    showStats: template === 'post-mobile',
  });

  const raw = resolved.fixture
    ? await readJsonFixture(resolved.fixture)
    : await new FxTwitterClient().getPost(parsed.id, { lang: resolved.lang, aboutAccount: true });

  const post = normalizePostResponse(raw, 'x');
  const hydrated = await hydratePostAssets(post, new AssetCache({ cacheDir: resolved.cacheDir }));
  const html = renderPostHtml(hydrated, resolved.render);

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
