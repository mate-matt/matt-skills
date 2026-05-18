import type { RenderOptions } from '../../types.js';

export function buildStyles(options: RenderOptions): string {
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
        quote: '#1f2329',
      }
    : {
        canvas: '#f6f8fa',
        surface: '#ffffff',
        surfaceSoft: '#f7f9fb',
        text: '#0f1419',
        muted: '#536471',
        border: '#dce3ea',
        accent: '#1d9bf0',
        quote: '#f7f9fb',
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
  --quote: ${colors.quote};
  --shadow-soft: 0 14px 40px rgba(15, 20, 25, ${dark ? '0.35' : '0.12'});
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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

.post-mobile {
  background: var(--surface);
  border: 0;
  border-radius: 0;
  padding: 16px 18px 12px;
}

.post-clean {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 22px;
  box-shadow: var(--shadow-soft);
}

.thread-vertical {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 0;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}

.quote-wall {
  background: var(--canvas);
  border-radius: 20px;
  padding: 22px;
}

.header-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.header-row.no-avatar {
  gap: 0;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  flex: 0 0 auto;
  background: linear-gradient(135deg, #e6ecf0, #cfd9de);
  color: #42515c;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 14px;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.author-block {
  min-width: 0;
  flex: 1;
}

.author-line {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.author-name {
  color: var(--text);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.18;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verified {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 11px;
  font-weight: 800;
  flex: 0 0 auto;
}

.verified-rosette {
  display: inline-flex;
  width: 18px;
  height: 18px;
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

.header-actions {
  flex: 0 0 auto;
}

.mobile-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: -2px;
}

.subscribe-button,
.icon-button {
  border: 0;
  font: inherit;
  color: var(--text);
  background: transparent;
  padding: 0;
}

.subscribe-button {
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--text);
  color: var(--surface);
  font-size: 14px;
  line-height: 30px;
  font-weight: 800;
}

.icon-button {
  display: inline-grid;
  place-items: center;
  width: 23px;
  height: 30px;
  color: var(--text);
}

.icon-button svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.icon-button svg path {
  stroke: none;
}

.more-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--muted);
}

.more-button span {
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: currentColor;
}

.meta-line {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-text {
  color: var(--text);
  font-size: 19px;
  line-height: 1.38;
  margin: 14px 0 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.post-mobile .post-text {
  font-size: 18px;
  line-height: 1.35;
  margin-top: 22px;
}

.translation-box,
.community-note {
  margin-top: 12px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  border-radius: 12px;
  padding: 10px 12px;
  color: var(--text);
  font-size: 14px;
  line-height: 1.45;
  white-space: pre-wrap;
}

.translation-label,
.note-label {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.media-grid {
  margin-top: 14px;
  display: grid;
  gap: 2px;
  border: 1px solid var(--border);
  border-radius: 15px;
  overflow: hidden;
  background: var(--border);
}

.media-grid.count-1 {
  grid-template-columns: 1fr;
}

.media-grid.count-2,
.media-grid.count-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.media-grid.count-3 {
  grid-template-columns: 1.15fr 0.85fr;
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.media-grid.count-3 .media-item:first-child {
  grid-row: span 2;
}

.media-item {
  position: relative;
  min-height: 128px;
  background: var(--surface-soft);
}

.media-grid.count-1 .media-item {
  min-height: 190px;
}

.media-item img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.media-badge {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  color: white;
  background: rgba(15, 20, 25, 0.72);
  font-size: 12px;
  font-weight: 700;
}

.quote-card {
  margin-top: 14px;
  border: 1px solid var(--border);
  border-radius: 15px;
  padding: 11px;
  background: var(--quote);
}

.quote-card .avatar {
  width: 28px;
  height: 28px;
  font-size: 11px;
}

.quote-card .author-name {
  font-size: 13px;
}

.quote-card .meta-line {
  font-size: 12px;
}

.quote-text {
  margin: 9px 0 0;
  font-size: 14px;
  line-height: 1.35;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.poll {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.poll-choice {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 999px;
  height: 34px;
  overflow: hidden;
  background: var(--surface-soft);
}

.poll-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: rgba(29, 155, 240, 0.16);
}

.poll-label {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 650;
}

.poll-total {
  color: var(--muted);
  font-size: 12px;
  margin-top: 1px;
}

.metrics {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  column-gap: 14px;
  row-gap: 6px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 13px;
}

.mobile-detail-meta {
  margin-top: 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.35;
}

.mobile-detail-meta strong {
  color: var(--text);
  font-weight: 800;
}

.mobile-actions {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 13px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  color: var(--muted);
}

.mobile-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  height: 26px;
  font-size: 13px;
  line-height: 1;
}

.mobile-action svg {
  width: 19px;
  height: 19px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex: 0 0 auto;
}

.mobile-action strong {
  font-size: 13px;
  font-weight: 650;
}

.metric {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.source-footer {
  margin-top: 12px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.clean-kicker {
  color: var(--accent);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.clean-text {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 23px;
  line-height: 1.35;
  margin: 16px 0 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.clean-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.thread-item {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 0;
  padding: 16px 16px 0;
  position: relative;
}

.thread-item:last-child {
  padding-bottom: 16px;
}

.thread-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.thread-rail .avatar {
  width: 40px;
  height: 40px;
  z-index: 1;
}

.thread-line {
  flex: 1;
  width: 2px;
  background: var(--border);
  margin-top: 8px;
}

.thread-item:last-child .thread-line {
  display: none;
}

.thread-body {
  min-width: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.thread-item:last-child .thread-body {
  border-bottom: 0;
  padding-bottom: 0;
}

.thread-body .post-text {
  margin-top: 8px;
  font-size: 16px;
  line-height: 1.4;
}

.wall-title {
  color: var(--text);
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
  margin: 0 0 6px;
}

.wall-subtitle {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.35;
  margin: 0 0 18px;
}

.wall-grid {
  display: grid;
  grid-template-columns: repeat(var(--wall-columns, 2), minmax(0, 1fr));
  gap: 12px;
}

.wall-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 13px;
  box-shadow: 0 8px 22px rgba(15, 20, 25, ${dark ? '0.18' : '0.07'});
}

.wall-card .avatar {
  width: 32px;
  height: 32px;
  font-size: 11px;
}

.wall-card .post-text {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.42;
}

.empty-state {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  color: var(--muted);
  font-size: 14px;
}

@media (max-width: 560px) {
  .quote-wall {
    padding: 16px;
  }

  .wall-grid {
    grid-template-columns: 1fr;
  }
}
`;
}
