# fxbrief

`fxbrief` is a local CLI for turning FxEmbed-powered X/Twitter data into clean editorial assets. It fetches post data from the public FxTwitter/FxEmbed API, normalizes the response into local models, renders static React templates to HTML, captures screenshots with Playwright, and exports X Articles to Markdown with local media assets.

For the Codex skill workflow and publishing examples, see the repository guides: [English](../../docs/fx-brief/README.md) / [简体中文](../../docs/fx-brief/README.zh-CN.md).

The recommended production paths are:

- `post-mobile`: 430px mobile-style X post screenshot for close-to-source quotation.
- `post-clean`: editorial quote card that keeps provenance without imitating an official X screenshot too closely.
- `profile-card`: local X profile card for creator/business-card style sharing.
- `article-md`: Markdown export for X Articles, including cover, inline media, metadata, and optional raw FxEmbed payload.
- `article-shot`: local long screenshot for X Articles, with optional platform-friendly slices.
- `json`: raw or normalized FxEmbed JSON export for posts, threads, and quote lists.

`thread-vertical` and `quote-wall` are still available as auxiliary commands, but they are not the primary public workflows.

## Install From npm

```bash
npm install -g @mate-matt/fxbrief@latest
fxbrief --version
```

Use `0.2.4` or newer for the Matt skill integration, profile cards, the `article-md` / `article-shot` workflows, safer post-mobile Subscribe-button behavior, and raw FxEmbed JSON export.

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

Render an X profile as a creator card:

```bash
fxbrief profile-card "https://x.com/user" --width 430 --scale 2
```

Append one latest profile post when you want a richer but still compact card:

```bash
fxbrief profile-card "https://x.com/mate_mattt" --latest-post --width 600 --scale 2
```

Append a longer profile timeline when you want a richer long card:

```bash
fxbrief profile-card "https://x.com/user" --count 3 --width 600 --scale 2
```

Fetch the raw FxEmbed JSON for a post without rendering or downloading media:

```bash
fxbrief json "https://x.com/user/status/123"
```

Write normalized fxbrief JSON for a thread:

```bash
fxbrief json "https://x.com/user/status/123" --kind thread --normalized --out output/json
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

## Profile Options

`profile-card` renders a profile card from FxEmbed profile data:

- `--count <number>`: append this many profile posts below the card. Default is `0`; maximum is `6`.
- `--latest-post`: shortcut for `--count 1`.
- `--with-replies`: include replies when fetching appended profile posts.
- `--media <none|first|grid|mosaic|full>`: media mode for appended posts. Default is `first`.
- `--fixture <path>`: read a saved FxEmbed profile payload for testing.

`article-shot` renders an X Article to PNG/WebP:

- `--style <article-x|article-clean>`: choose an X-like article page or a cleaner editorial layout. Default is `article-x`.
- `--width <px>`: screenshot width in CSS pixels. Default is `540`, which creates a 1080px-wide image with `--scale 2`.
- `--slice-height <px>`: also export numbered slices at this CSS-pixel height.
- `--hide-actions`: remove X-like header and engagement actions.
- `--hide-source-footer`: remove the provenance footer.
- `--no-cover`: omit the cover image.
- `--fixture <path>`: read a saved FxEmbed article payload for testing.

## JSON Options

`json` fetches data only. It does not render HTML, start Playwright, download media, or touch the image cache.

- `--kind <post|thread|quotes>`: choose the FxEmbed endpoint. Default is `post`.
- `--out <path>`: write JSON to a file, or to `fxembed-<kind>-<status-id>.json` inside a directory. Without `--out`, JSON is printed to stdout.
- `--lang <code>`: request FxEmbed translation where supported.
- `--count <number>`: quote count when `--kind quotes` is used. Default is `20`, capped at `100`.
- `--cursor <value>`: quote pagination cursor when `--kind quotes` is used.
- `--no-about-account`: skip expanded account metadata on post and thread responses.
- `--normalized`: output fxbrief's normalized local model instead of the raw FxEmbed response.
- `--compact`: output minified JSON.
- `--fixture <path>`: read a saved FxEmbed JSON payload for testing.

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

Profile cards use FxEmbed profile data and local rendering; they do not capture the live X web page. When `--count` is greater than `0`, `fxbrief` fetches `/2/profile/{handle}/statuses` and renders up to six returned posts below the profile. FxEmbed does not currently expose a reliable pinned-post marker on this endpoint; if a future payload includes `is_pinned` or `pinned`, the renderer will show a Pinned label.

JSON exports also do not use Playwright. They either print JSON directly to stdout or write a `.json` file when `--out` is provided.

## Skill Routing

The companion `matt-fx-brief` Codex skill treats this CLI as one X/FxEmbed toolchain. Profile URLs and handles route to `profile-card`. Status URLs route by intent: post screenshots use `post-mobile` or `post-clean`, X Article archives use `article-md`, long screenshots and slices use `article-shot`, and metadata/debugging requests use `json`. If a status URL may be either a normal post or an X Article, inspect `fxbrief json "<url>" --normalized` before choosing the final render command.

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
npm run dev -- profile-card example --fixture fixtures/profile.json --out output/profile-card.png --debug-html
npm run dev -- json 1234567890123456789 --fixture fixtures/post.json --normalized
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
