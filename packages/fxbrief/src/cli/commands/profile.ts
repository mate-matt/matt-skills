import { AssetCache } from '../../cache/index.js';
import { normalizeProfileResponse } from '../../normalize/socialProfile.js';
import { normalizePost } from '../../normalize/socialPost.js';
import { FxTwitterClient } from '../../providers/fxTwitter.js';
import { parseProfileUrl } from '../../providers/parseUrl.js';
import { hydratePostsAssets, hydrateProfileAssets } from '../../render/assets.js';
import { renderProfileHtml } from '../../render/renderHtml.js';
import { captureHtml } from '../../render/screenshot.js';
import type { CommonCliOptions } from '../../types.js';
import { readJsonFixture, resolveCliOptions } from '../options.js';

export async function renderProfileCommand(input: string, rawOptions: CommonCliOptions & Record<string, unknown>): Promise<string> {
  const parsed = parseProfileUrl(input);
  if (parsed.provider !== 'x') throw new Error('First version supports X/Twitter profile rendering only.');

  const resolved = resolveCliOptions('profile-card', parsed.handle, rawOptions, {
    mediaMode: 'first',
    showStats: false,
    showTimestamp: false,
  });

  const client = new FxTwitterClient();
  const raw = resolved.fixture ? await readJsonFixture(resolved.fixture) : await client.getProfile(parsed.handle, { aboutAccount: true });
  const postCount = parseProfilePostCount(rawOptions);
  const timelineRaw = postCount > 0
    ? await client.getProfileStatuses(parsed.handle, {
        count: postCount,
        lang: resolved.lang,
        withReplies: Boolean(rawOptions.withReplies),
      })
    : undefined;

  const profile = normalizeProfileResponse(raw, 'x');
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
    debugHtmlPath: resolved.debugHtmlPath,
  });

  return resolved.outPath;
}

function profilePosts(raw: unknown) {
  const envelope = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const results = Array.isArray(envelope.results) ? envelope.results : [];
  const posts = [];
  for (const item of results) {
    try {
      posts.push(normalizePost(item, 'x'));
    } catch {
      // Skip non-status entries or partial timeline items.
    }
  }
  return posts;
}

function parseProfilePostCount(rawOptions: Record<string, unknown>): number {
  const requested = rawOptions.count;
  const fallback = rawOptions.latestPost ? 1 : 0;
  const number = typeof requested === 'number' ? requested : typeof requested === 'string' ? Number(requested) : fallback;
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(Math.round(number), 6);
}
