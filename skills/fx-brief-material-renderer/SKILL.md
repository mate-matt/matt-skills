---
name: fx-brief-material-renderer
description: Use this skill when asked to render X/Twitter posts, threads, quote reactions, or X Articles into local editorial assets with the fx-brief CLI and FxEmbed data. Applies to post-mobile, post-clean, thread-vertical, quote-wall, article-md, social quote cards, tweet cards, news source cards, and Markdown exports of X long-form articles with images.
---

# fx-brief Material Renderer

Use the `fxbrief` CLI to generate deterministic social-source image assets and X Article Markdown archives. Do not hand-build screenshots or manually reconstruct article Markdown when the CLI can export them.

## CLI Resolution

Use the first available option:

1. If `fxbrief` is on `PATH`, run `fxbrief ...`.
2. If working inside this repository, run `npm --prefix packages/fxbrief run dev -- ...` for source execution.
3. Otherwise run `npx -y @mate-matt/fxbrief@latest ...`.

The screenshot commands use Playwright. If Chromium is missing, tell the user to run:

```bash
npx playwright install chromium
```

## Workflow

1. Confirm the input is an X/Twitter status URL or numeric status id.
2. Choose the command:
   - `post-mobile` for a high-fidelity 430px mobile-style source card.
   - `post-clean` for an editorial quote card that avoids looking like an official screenshot.
   - `thread-vertical` for an unrolled thread long image.
   - `quote-wall` for quote-post reactions.
   - `article-md` for an X Article Markdown export with cover and inline media.
3. Run the CLI using the resolution order above.
4. Verify the output exists. For visual changes, use `--debug-html` or render fixtures; for `article-md`, inspect `article.md` and `metadata.json`.
5. Report the absolute output path to the user.

## Commands

```bash
fxbrief post-mobile "https://x.com/user/status/123" --scale 2
fxbrief post-clean "https://x.com/user/status/123" --media first --hide-stats
fxbrief thread-vertical "https://x.com/user/status/123" --max-posts 6
fxbrief quote-wall "https://x.com/user/status/123" --count 12 --width 920 --columns 2
fxbrief article-md "https://x.com/user/status/123"
```

Repository source mode:

```bash
npm --prefix packages/fxbrief run dev -- post-mobile "https://x.com/user/status/123" --scale 2
```

No local CLI install:

```bash
npx -y @mate-matt/fxbrief@latest post-mobile "https://x.com/user/status/123" --scale 2
```

## Defaults

- Use `--timezone Asia/Shanghai` unless the user asks otherwise.
- Keep the source footer on by default for editorial provenance.
- Use PNG unless the user asks for WebP.
- Use `--scale 2` for image assets.
- Use `--lang zh-cn --show-translation` only when the user wants translated text included.
- For `article-md`, keep the defaults unless asked otherwise: local assets, `metadata.json`, and `raw.fxembed.json`.
- For X Article exports, do not summarize, translate, reorder, or rewrite source text. Report the `article.md` path and mention the `assets/` directory.

## Validation

For code or template changes, run:

```bash
npm --prefix packages/fxbrief run typecheck
npm --prefix packages/fxbrief test
npm --prefix packages/fxbrief run build
npm --prefix packages/fxbrief run render:fixture
```

Fixture outputs are written to `output/fixture-*.png`.
