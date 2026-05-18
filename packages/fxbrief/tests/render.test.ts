import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { normalizePostResponse, normalizeQuotesResponse, normalizeThreadResponse } from '../src/normalize/socialPost.js';
import { renderPostHtml, renderQuoteWallHtml, renderThreadHtml } from '../src/render/renderHtml.js';
import type { RenderOptions } from '../src/types.js';

const baseOptions: RenderOptions = {
  template: 'post-mobile',
  width: 390,
  theme: 'light',
  timezone: 'Asia/Shanghai',
  mediaMode: 'grid',
  showStats: true,
  showSourceFooter: true,
  showTimestamp: true,
  showTranslation: false,
};

describe('rendering', () => {
  it('normalizes and renders post-mobile HTML', async () => {
    const raw = JSON.parse(await readFile('fixtures/post.json', 'utf8')) as unknown;
    const post = normalizePostResponse(raw, 'x');
    const html = renderPostHtml(post, baseOptions);
    expect(html).toContain('data-capture');
    expect(html).toContain('Example News Lab');
    expect(html).toContain('Source: X');
  });

  it('normalizes and renders thread HTML', async () => {
    const raw = JSON.parse(await readFile('fixtures/thread.json', 'utf8')) as unknown;
    const thread = normalizeThreadResponse(raw, 'x');
    const html = renderThreadHtml(thread, { ...baseOptions, template: 'thread-vertical', maxPosts: 3 });
    expect(thread.posts).toHaveLength(3);
    expect(html).toContain('thread-vertical');
    expect(html).toContain('Second: local rendering');
  });

  it('normalizes and renders quote wall HTML', async () => {
    const postRaw = JSON.parse(await readFile('fixtures/post.json', 'utf8')) as unknown;
    const quotesRaw = JSON.parse(await readFile('fixtures/quotes.json', 'utf8')) as unknown;
    const sourcePost = normalizePostResponse(postRaw, 'x');
    const quotes = normalizeQuotesResponse(quotesRaw, 'x');
    const html = renderQuoteWallHtml(sourcePost, quotes, { ...baseOptions, template: 'quote-wall', width: 920, mediaMode: 'none', columns: 2 });
    expect(quotes).toHaveLength(2);
    expect(html).toContain('Quoted reactions');
    expect(html).toContain('Reporter One');
  });
});
