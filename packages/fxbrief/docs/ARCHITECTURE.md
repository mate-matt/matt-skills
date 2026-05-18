# Architecture

`fx-brief` has three related pipelines.

Image rendering:

```text
URL or id
  -> provider client
  -> normalizer
  -> asset hydration
  -> React static HTML
  -> Playwright element screenshot
  -> PNG/WebP output
```

Article export:

```text
URL or id
  -> provider client
  -> article normalizer
  -> asset writer
  -> Markdown converter
  -> article.md + metadata.json + raw.fxembed.json
```

Article screenshot:

```text
URL or id
  -> provider client
  -> article normalizer
  -> asset hydration
  -> React article template
  -> Playwright long screenshot
  -> PNG/WebP output + optional slices
```

## Layers

### CLI

Files:

- `src/cli/index.ts`
- `src/cli/options.ts`
- `src/cli/commands/*.ts`

The CLI layer only parses options, resolves defaults, and calls the application pipeline. It should not contain rendering decisions or FxEmbed field handling.

### Provider

Files:

- `src/providers/parseUrl.ts`
- `src/providers/fxTwitter.ts`

The first version supports X/Twitter URLs and numeric status ids. The provider client wraps FxTwitter API v2 endpoints:

- `/2/status/{id}`
- `/2/thread/{id}`
- `/2/status/{id}/quotes`

X Articles are fetched through `/2/status/{id}` because FxEmbed returns article data inside `status.article`.

The code is shaped so a future `fxBluesky.ts` can implement the same fetch/normalize flow without changing templates.

### Normalize

Files:

- `src/normalize/socialPost.ts`
- `src/normalize/socialArticle.ts`

FxEmbed responses are rich and can change over time. Templates never consume raw API data directly. The normalizer converts raw payloads into:

- `SocialPost`
- `SocialThread`
- `SocialMedia`
- `SocialAuthor`
- `SocialPoll`
- `SocialArticle`
- `ArticleBlock`
- `ArticleEntity`
- `ArticleMedia`

This layer also handles partial quote bodies, tombstones, missing avatars, optional metrics, source-post metrics for X Articles, and media shape differences.

### Asset Hydration

Files:

- `src/cache/index.ts`
- `src/render/assets.ts`

Before rendering, remote images are fetched into `cache/assets/` and converted to data URLs. The final HTML is therefore self-contained for screenshot capture. If an asset fails to download, the cache returns a neutral placeholder rather than breaking the render.

### Article Export

Files:

- `src/article/markdown.ts`
- `src/article/assets.ts`
- `src/cli/commands/article.ts`

The article pipeline converts FxEmbed's Draft.js-like X Article payload into Markdown without summarizing, rewriting, translating, or reordering source text.

Supported block/entity mappings:

| FxEmbed Article item | Markdown output |
| --- | --- |
| `unstyled` | paragraph |
| `header-one` to `header-six` | `#` to `######` headings |
| `unordered-list-item` | `- item` |
| `ordered-list-item` | `1. item` |
| `blockquote` | `> quote` |
| `code-block` | fenced code block |
| `LINK` entity | `[text](url)` |
| `MARKDOWN` atomic entity | inserted as provided |
| `MEDIA` atomic entity | `![alt](assets/image-xx.ext)` |

By default, `article-md` writes:

```text
output/articles/<status-id>/
  article.md
  metadata.json
  raw.fxembed.json
  assets/
```

### Render

Files:

- `src/render/renderHtml.tsx`
- `src/render/templates/*`
- `src/render/templates/components/*`
- `src/render/styles/base.ts`
- `src/render/styles/article.ts`

Templates are React components rendered with `react-dom/server`. Styling is injected as a static stylesheet into the HTML document.

The post/thread/quote templates are:

- `PostMobile`
- `PostClean`
- `ThreadVertical`
- `QuoteWall`

Shared components cover avatar, post header, post text, media grid, quoted post, poll, metrics, and source footer.

The article screenshot template is `ArticleShot`. It supports:

- `article-x`: an X Article-like page for close-to-source sharing.
- `article-clean`: a cleaner editorial article layout for platforms where an official-UI look is not desired.

Article rendering uses the same Draft.js-like block/entity model as `article-md`, but emits HTML nodes instead of Markdown. `MEDIA` entities render hydrated local image data URLs, `MARKDOWN` entities render code/markdown blocks, and inline style ranges are preserved visually.

### Screenshot

File:

- `src/render/screenshot.ts`

Playwright loads the static HTML with `page.setContent()`, waits for fonts and images, then captures only the `[data-capture]` element:

```ts
await page.locator('[data-capture]').screenshot(...)
```

This is cleaner than full-page screenshots or manual clip calculation because the DOM itself defines the final asset boundary.

WebP is produced by taking a PNG screenshot buffer and converting it with `sharp`.

Long article screenshots use `captureHtmlLong()`. It first measures `[data-capture]`. If the element is below the practical single-shot height threshold, it captures the element directly. For taller content or when `--slice-height` is requested, it captures vertical slices in a local overflow viewport. Long output is assembled with `sharp`, and numbered slices can be written beside the long image for social platforms that compress oversized images.

## Template Defaults

| Template | Width | Media | Stats | Source footer |
| --- | ---: | --- | --- | --- |
| `post-mobile` | 430 | `grid` | on | on |
| `post-clean` | 390 | `first` | off | on |
| `thread-vertical` | 390 | `grid` | off | on |
| `quote-wall` | 920 | `none` | on | on |

## Article Defaults

| Command | Output | Assets | Raw JSON | Metadata |
| --- | --- | --- | --- | --- |
| `article-md` | `output/articles/<status-id>` | `local` | on | on |
| `article-shot` | `output/article-shot-<status-id>-<timestamp>.png` | hydrated data URLs | off | off |

`article-shot` defaults to `article-x`, width `540`, PNG, scale `2`, source footer on, cover on, and actions on. `--slice-height` writes `article-01.png`, `article-02.png`, and so on when the output is a directory.

## Extension Points

Add a new provider:

1. Create a provider client in `src/providers/`.
2. Add URL parsing in `parseUrl.ts`.
3. Extend the normalizer if the raw shape differs.
4. Reuse existing templates where possible.

Add a new template:

1. Add a component in `src/render/templates/`.
2. Add CSS to `src/render/styles/base.ts`, or split styles once the file becomes too large.
3. Add a branch in `renderHtml.tsx`.
4. Add a CLI shortcut if it is a first-class workflow.
5. Add a fixture render path and a test assertion.

Add a new article block/entity mapping:

1. Extend `renderBlock` or `renderAtomicBlock` in `src/article/markdown.ts`.
2. Add a focused fixture case in `fixtures/article.json`.
3. Assert the Markdown output in `tests/article.test.ts`.

If the mapping must also appear in article screenshots, mirror it in `src/render/templates/ArticleShot.tsx` and add a render assertion in `tests/render.test.ts`.

## Failure Modes

- FxEmbed API error: CLI exits with a clear request failure.
- Unsupported URL: URL parser rejects before network calls.
- Missing media asset: renderer uses a neutral placeholder.
- Browser screenshot failure: CLI exits non-zero and leaves debug HTML if `--debug-html` was enabled.
- Very long thread: default `--max-posts 6` keeps images within practical browser screenshot limits.
- Non-article status for `article-md`: normalizer rejects with a clear "does not contain an X Article" error.
- Non-article status for `article-shot`: the same article normalizer rejects before Playwright starts.
- Article asset download failure: CLI exits non-zero so missing images are not silently omitted.
- Article screenshot asset download failure: renderer uses a neutral placeholder so one remote image failure does not prevent the whole long screenshot.
