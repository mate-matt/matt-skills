# fxbrief

`fxbrief` is a local CLI for turning FxEmbed-powered X/Twitter data into clean editorial image assets and Markdown archives. It fetches post data from the public FxTwitter API, normalizes the response into local models, renders static React templates to HTML, captures the result with Playwright, and exports X Articles to Markdown with local media assets.

The first version includes five production paths:

- `post-mobile`: 430px mobile-style X post card for close-to-source quotation.
- `post-clean`: editorial quote card that keeps provenance without imitating an official screenshot too closely.
- `thread-vertical`: long vertical image for an unrolled thread.
- `quote-wall`: reaction wall built from quote posts.
- `article-md`: Markdown export for X Articles, including cover and inline media.

## Install From npm

```bash
npm install -g @mate-matt/fxbrief
```

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

## Commands

Render a mobile-style post card:

```bash
fxbrief post-mobile "https://x.com/user/status/123" --scale 2
```

Render an editorial quote card:

```bash
fxbrief post-clean "https://x.com/user/status/123" --media first --hide-stats
```

Render a thread long image:

```bash
fxbrief thread-vertical "https://x.com/user/status/123" --max-posts 6
```

Render a quote/reaction wall:

```bash
fxbrief quote-wall "https://x.com/user/status/123" --count 12 --width 920 --columns 2
```

Generic post command:

```bash
fxbrief post "https://x.com/user/status/123" --template post-clean
```

Export an X Article to Markdown:

```bash
fxbrief article-md "https://x.com/user/status/123"
```

By default, this creates:

```text
output/articles/<status-id>/
  article.md
  metadata.json
  raw.fxembed.json
  assets/
    cover.jpg
    image-01.jpg
```

## Common Options

- `--out <path>`: output file path, or directory if no extension is provided.
- `--format <png|webp>`: output format. PNG is the default.
- `--width <px>`: capture width in CSS pixels.
- `--scale <number>`: device scale factor. Default is `2`.
- `--quality <number>`: WebP quality. Default is `92`.
- `--theme <light|dark>`: visual theme.
- `--timezone <tz>`: timestamp timezone. Default is `Asia/Shanghai`.
- `--lang <code>`: request FxEmbed translation, for example `zh-cn`.
- `--show-translation`: display translation if FxEmbed returns one.
- `--media <none|first|grid|mosaic|full>`: media rendering mode.
- `--stats` / `--hide-stats`: show or hide engagement metrics.
- `--hide-source-footer`: remove the provenance footer.
- `--transparent`: render with transparent background.
- `--cache-dir <path>`: image cache directory.
- `--debug-html`: save the intermediate HTML next to the image.

## Article Options

`article-md` has its own output-oriented options:

- `--out <dir>`: output directory. Default is `output/articles/<status-id>`.
- `--assets <local|remote|none>`: download images locally, keep remote image URLs, or omit images. Default is `local`.
- `--no-raw`: skip `raw.fxembed.json`.
- `--no-metadata`: skip `metadata.json`.
- `--no-title`: do not prepend the article title as `# H1`.
- `--no-cover`: do not include the cover image in `article.md`.
- `--fixture <path>`: read a saved FxEmbed article payload for testing.

## Output Model

The CLI always prints the final image path to stdout. If `--out` is not provided, images go to `output/` using:

```text
{template}-{status-id}-{timestamp}.{format}
```

Remote avatars and media are cached under `cache/assets/` and embedded into the rendered HTML as data URLs before screenshot capture. This makes the final Playwright render local and stable.

Article exports do not use Playwright. They convert FxEmbed's X Article blocks directly into Markdown so the original text order and content are preserved. Local article assets are written beside `article.md`.

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
