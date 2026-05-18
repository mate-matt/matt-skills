import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import type { RenderOptions, RenderTemplate, SocialPost, SocialThread } from '../types.js';
import { buildStyles } from './styles/base.js';
import { PostClean } from './templates/PostClean.js';
import { PostMobile } from './templates/PostMobile.js';
import { QuoteWall } from './templates/QuoteWall.js';
import { ThreadVertical } from './templates/ThreadVertical.js';

export function renderPostHtml(post: SocialPost, options: RenderOptions): string {
  const element = options.template === 'post-clean' ? <PostClean post={post} options={options} /> : <PostMobile post={post} options={options} />;
  return renderDocument(element, options);
}

export function renderThreadHtml(thread: SocialThread, options: RenderOptions): string {
  return renderDocument(<ThreadVertical thread={thread} options={options} />, options);
}

export function renderQuoteWallHtml(sourcePost: SocialPost, quotes: SocialPost[], options: RenderOptions): string {
  return renderDocument(<QuoteWall sourcePost={sourcePost} quotes={quotes} options={options} />, options);
}

export function defaultWidthForTemplate(template: RenderTemplate): number {
  if (template === 'quote-wall') return 920;
  if (template === 'post-mobile') return 430;
  return 390;
}

function renderDocument(element: ReactElement, options: RenderOptions): string {
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
