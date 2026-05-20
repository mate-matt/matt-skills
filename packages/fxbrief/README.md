# fxbrief

`fxbrief` is a local CLI for turning FxEmbed-powered X/Twitter data into clean editorial assets. It fetches post data from the public FxTwitter/FxEmbed API, normalizes the response into local models, renders static React templates to HTML, captures screenshots with Playwright, and exports X Articles to Markdown with local media assets.

For the Codex skill workflow and publishing examples, see the repository guides: [English](../../docs/fx-brief/README.md) / [简体中文](../../docs/fx-brief/README.zh-CN.md).

The recommended production paths are:

- `post-mobile`: 430px mobile-style X post screenshot for close-to-source quotation.
- `post-clean`: editorial quote card that keeps provenance without imitating an official X screenshot too closely.
- `article-md`: Markdown export for X Articles, including cover, inline media, metadata, and optional raw FxEmbed payload.
- `article-shot`: local long screenshot for X Articles, with optional platform-friendly slices.

`thread-vertical` and `quote-wall` are still available as auxiliary commands, but they are not the primary public workflows.

## Install From npm

```bash
npm install -g @mate-matt/fxbrief@latest
fxbrief --version
```

Use `0.2.2` or newer for the Matt skill integration, the `article-md` / `article-shot` workflows, and the safer post-mobile Subscribe-button behavior.

Then run:

```bash
fxbrief post-mobile "https://x.com/user/status/123" -o out.png
```

You can also use it without a global install:

```bash
npx -y @mate-matt/fxbrief post-clean "https://x.com/user/status/123" -o out.png
```

`fxbrief` uses Playwright for screenshot rendering. If Chromium is missing in your environment, install it once:

```bash
npx playwright install chromium
```

## Local Development

```bash
npm install
npm run build
npm run dev -- post-mobile "https://x.com/user/status/123"
```

## Core Commands

Render a mobile-style post card:

```bash
fxbrief post-mobile "https://x.com/user/status/123" --scale 2
```

Render an editorial quote card:

```bash
fxbrief post-clean "https://x.com/user/status/123" --media first --hide-stats
```

Export an X Article to Markdown:

```bash
fxbrief article-md "https://x.com/user/status/123"
```

Render an X Article as a long screenshot:

```bash
fxbrief article-shot "https://x.com/user/status/123" --style article-x --width 540 --scale 2
```

Render a cleaner article image and export slices for social platforms:

```bash
fxbrief article-shot "https://x.com/user/status/123" \
  --style article-clean \
  --slice-height 1800 \
  --out output/my-article
```

Render the post body translated into Chinese while keeping the surrounding UI unchanged:

```bash
fxbrief post-mobile "https://x.com/user/status/123" --lang zh-cn --translated-text
```

## Article Markdown Output

By default, `article-md` creates:

```text
output/articles/<status-id>/
  article.md
  metadata.json
  raw.fxembed.json
  assets/
    cover.jpg
    image-01.jpg
```

Article Markdown exports do not use Playwright. They convert FxEmbed's X Article blocks directly into Markdown so the original text order and content are preserved. Local article assets are written beside `article.md`.

## Common Options

- `--out <path>`: output file path, or directory if no extension is provided.
- `--format <png|webp>`: output format. PNG is the default.
- `--width <px>`: capture width in CSS pixels.
- `--scale <number>`: device scale factor. Default is `2`.
- `--quality <number>`: WebP quality. Default is `92`.
- `--theme <light|dark>`: visual theme.
- `--timezone <tz>`: timestamp timezone. Default is `Asia/Shanghai`.
- `--lang <code>`: request FxEmbed translation, for example `zh-cn`.
- `--translated-text`: render the translated post body in place of the original text when FxEmbed returns a translation.
- `--show-translation`: display translation if FxEmbed returns one.
- `--media <none|first|grid|mosaic|full>`: media rendering mode.
- `--stats` / `--hide-stats`: show or hide engagement metrics.
- `--show-subscribe`: show the `post-mobile` Subscribe button when you know the account offers subscriptions. FxEmbed does not currently expose a reliable subscription-availability field, so this button is hidden by default.
- `--hide-source-footer`: remove the provenance footer.
- `--transparent`: render with transparent background.
- `--cache-dir <path>`: image cache directory.
- `--debug-html`: save the intermediate HTML next to the image.

## Article Options

`article-md` exports a Markdown archive:

- `--out <dir>`: output directory. Default is `output/articles/<status-id>`.
- `--assets <local|remote|none>`: download images locally, keep remote image URLs, or omit images. Default is `local`.
- `--no-raw`: skip `raw.fxembed.json`.
- `--no-metadata`: skip `metadata.json`.
- `--no-title`: do not prepend the article title as `# H1`.
- `--no-cover`: do not include the cover image in `article.md`.
- `--fixture <path>`: read a saved FxEmbed article payload for testing.

`article-shot` renders an X Article to PNG/WebP:

- `--style <article-x|article-clean>`: choose an X-like article page or a cleaner editorial layout. Default is `article-x`.
- `--width <px>`: screenshot width in CSS pixels. Default is `540`, which creates a 1080px-wide image with `--scale 2`.
- `--slice-height <px>`: also export numbered slices at this CSS-pixel height.
- `--hide-actions`: remove X-like header and engagement actions.
- `--hide-source-footer`: remove the provenance footer.
- `--no-cover`: omit the cover image.
- `--fixture <path>`: read a saved FxEmbed article payload for testing.

## Auxiliary Commands

These commands remain available for experiments and backward compatibility:

```bash
fxbrief thread-vertical "https://x.com/user/status/123" --max-posts 6
fxbrief quote-wall "https://x.com/user/status/123" --count 12 --width 920 --columns 2
fxbrief post "https://x.com/user/status/123" --template post-clean
```

## Output Model

The CLI always prints the final image path to stdout. If `--out` is not provided, images go to `output/` using:

```text
{template}-{status-id}-{timestamp}.{format}
```

Remote avatars and media are cached under `cache/assets/` and embedded into the rendered HTML as data URLs before screenshot capture. This makes the final Playwright render local and stable.

Article screenshots use the same local-rendering model as post images: FxEmbed data is normalized, remote article images and avatars are hydrated into data URLs, React renders a static HTML document, and Playwright captures the local article. When the article is too tall for a single practical browser capture, `fxbrief` captures chunks and stitches them with `sharp`. If `--slice-height` is provided, it also writes numbered slice images next to the long screenshot.

## Local Fixtures

Render all fixture templates without calling FxEmbed:

```bash
npm run render:fixture
```

This creates:

- `output/fixture-post-mobile.png`
- `output/fixture-post-clean.png`
- `output/fixture-thread-vertical.png`
- `output/fixture-quote-wall.png`

You can also render a single fixture through the CLI:

```bash
npm run dev -- post-mobile 1234567890123456789 --fixture fixtures/post.json --out output/test.png
npm run dev -- article-md 3333333333333333333 --fixture fixtures/article.json --out output/test-article
npm run dev -- article-shot 3333333333333333333 --fixture fixtures/article.json --out output/article-shot.png --debug-html
```

## Editorial Safety

`post-mobile` is intentionally high-fidelity but not meant to impersonate an official X screenshot. By default, every template includes a source footer with platform, handle, and original URL. For news publishing, keep that footer unless the article layout already provides equivalent provenance.

This project is not affiliated with X/Twitter, Bluesky, or FxEmbed.

## Development Checks

```bash
npm run typecheck
npm test
npm run build
npm run render:fixture
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the implementation map.
