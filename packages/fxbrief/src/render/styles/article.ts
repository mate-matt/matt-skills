import type { ArticleShotRenderOptions } from '../../types.js';

export function buildArticleStyles(options: ArticleShotRenderOptions): string {
  const dark = options.theme === 'dark';
  const colors = dark
    ? {
        canvas: '#0f1419',
        surface: '#16181c',
        surfaceSoft: '#1f2329',
        text: '#f7f9f9',
        muted: '#8b98a5',
        border: '#2f3336',
        accent: '#1d9bf0',
        code: '#111418',
      }
    : {
        canvas: '#f6f8fa',
        surface: '#ffffff',
        surfaceSoft: '#f7f9fb',
        text: '#0f1419',
        muted: '#536471',
        border: '#eff3f4',
        accent: '#1d9bf0',
        code: '#f6f8fa',
      };

  return `
:root {
  --capture-width: ${options.width}px;
  --canvas: ${colors.canvas};
  --surface: ${colors.surface};
  --surface-soft: ${colors.surfaceSoft};
  --text: ${colors.text};
  --muted: ${colors.muted};
  --border: ${colors.border};
  --accent: ${colors.accent};
  --code: ${colors.code};
  --shadow-soft: 0 18px 52px rgba(15, 20, 25, ${dark ? '0.38' : '0.13'});
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: transparent;
  color: var(--text);
  font-family: var(--font);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

body {
  min-width: var(--capture-width);
}

a {
  color: inherit;
  text-decoration: none;
}

.capture {
  width: var(--capture-width);
  overflow: hidden;
}

.article-shot {
  background: var(--surface);
}

.article-x {
  padding: 0 20px 20px;
}

.article-clean {
  padding: 34px 38px 28px;
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
}

.article-topbar {
  height: 58px;
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  align-items: center;
  gap: 12px;
}

.article-topbar-title {
  font-size: 24px;
  line-height: 1;
  font-weight: 800;
}

.article-topbar-icon {
  width: 28px;
  height: 28px;
  stroke: var(--text);
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.article-author-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 10px;
  min-width: 0;
}

.article-author-identity,
.article-clean-byline {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.article-clean-byline {
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.article-author-identity .avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex: 0 0 auto;
  overflow: hidden;
  background: linear-gradient(135deg, #e6ecf0, #cfd9de);
  color: #42515c;
  display: grid;
  place-items: center;
  font-size: 15px;
  font-weight: 700;
}

.article-author-identity .avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.article-author-text {
  min-width: 0;
}

.article-author-name-line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.article-author-name {
  font-size: 19px;
  line-height: 1.18;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-author-handle,
.article-meta {
  color: var(--muted);
  font-size: 17px;
  line-height: 1.3;
}

.verified {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 12px;
  font-weight: 800;
  flex: 0 0 auto;
}

.verified-rosette {
  display: inline-flex;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.verified-rosette svg {
  width: 100%;
  height: 100%;
  display: block;
}

.rosette-shape {
  fill: var(--accent);
}

.rosette-check {
  fill: none;
  stroke: white;
  stroke-width: 2.15;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.article-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  flex: 0 0 auto;
}

.article-boost-button,
.article-icon-button {
  border: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  padding: 0;
}

.article-boost-button {
  height: 42px;
  padding: 0 22px;
  border-radius: 999px;
  background: var(--text);
  color: var(--surface);
  font-size: 18px;
  line-height: 42px;
  font-weight: 800;
}

.article-icon-button {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 36px;
  color: var(--text);
}

.article-icon-button svg {
  width: 28px;
  height: 28px;
  fill: currentColor;
}

.article-more-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--muted);
}

.article-more-button span {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: currentColor;
}

.article-clean-kicker {
  color: var(--accent);
  font-size: 13px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.article-cover {
  position: relative;
  margin-top: 28px;
  aspect-ratio: 2 / 0.8;
  overflow: hidden;
  background: var(--surface-soft);
}

.article-clean .article-cover {
  margin-top: 0;
  border-radius: 14px;
  border: 1px solid var(--border);
}

.article-cover img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.article-inline-image img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

.article-title {
  margin: 52px 0 28px;
  color: var(--text);
  font-size: 38px;
  line-height: 1.16;
  font-weight: 900;
}

.article-clean .article-title {
  margin: 28px 0 18px;
  font-size: 36px;
  line-height: 1.18;
}

.article-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.15fr 1fr 1fr;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px;
  padding: 0 0 18px;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
}

.article-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 0;
  height: 30px;
  color: var(--muted);
  font-size: 17px;
  line-height: 1;
  font-weight: 500;
}

.article-action.is-highlighted {
  color: #f91880;
}

.article-action svg {
  width: 22px;
  height: 22px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex: 0 0 auto;
}

.article-meta {
  margin: 0 0 28px;
}

.article-clean-byline .article-meta {
  margin: 0;
}

.article-body {
  padding-top: 0;
}

.article-paragraph,
.article-list-item,
.article-blockquote,
.article-embed-link,
.article-markdown {
  color: var(--text);
  font-size: 22px;
  line-height: 1.76;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.article-paragraph {
  margin: 0 0 28px;
}

.article-heading,
.article-heading-one,
.article-subheading {
  color: var(--text);
  font-weight: 900;
  line-height: 1.26;
}

.article-heading,
.article-heading-one {
  margin: 46px 0 18px;
  font-size: 29px;
}

.article-subheading {
  margin: 34px 0 14px;
  font-size: 24px;
}

.article-list-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  margin: 0 0 18px;
}

.article-list-marker {
  text-align: center;
  color: var(--text);
  font-weight: 800;
}

.article-blockquote {
  margin: 28px 0;
  padding: 8px 0 8px 20px;
  border-left: 4px solid var(--border);
  color: var(--text);
}

.article-link {
  color: var(--accent);
}

.article-paragraph code,
.article-list-item code,
.article-blockquote code {
  font-family: var(--mono);
  font-size: 0.86em;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.06em 0.28em;
}

.article-media {
  position: relative;
  display: grid;
  gap: 8px;
  margin: 30px 0 34px;
}

.article-media-count-2,
.article-media-count-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.article-media-count-3 {
  grid-template-columns: 1.15fr 0.85fr;
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.article-media-count-3 .article-inline-image:first-child {
  grid-row: span 2;
}

.article-inline-image {
  position: relative;
  border-radius: 14px;
  border: 1px solid var(--border);
  overflow: hidden;
  background: var(--surface-soft);
}

.article-media-badge {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  color: white;
  background: rgba(15, 20, 25, 0.72);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.article-code,
.article-markdown {
  position: relative;
  margin: 28px 0 34px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--code);
  color: var(--text);
  font-family: var(--mono);
  font-size: 15px;
  line-height: 1.62;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.article-code code {
  font-family: inherit;
}

.article-code-language {
  display: block;
  margin-bottom: 12px;
  color: var(--muted);
  font-family: var(--font);
  font-size: 12px;
  line-height: 1;
  font-weight: 800;
  text-transform: uppercase;
}

.article-embed-link {
  margin: 24px 0 30px;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface-soft);
  color: var(--accent);
  font-size: 18px;
  line-height: 1.4;
}

.source-footer {
  margin-top: 34px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

@media (max-width: 560px) {
  .article-x {
    padding: 0 18px 18px;
  }

  .article-clean {
    padding: 28px 24px 24px;
    border-radius: 14px;
  }

  .article-title {
    font-size: 34px;
  }

  .article-paragraph,
  .article-list-item,
  .article-blockquote,
  .article-markdown {
    font-size: 21px;
  }
}
`;
}
