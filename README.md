# Matt Skills

[English](README.md) | [简体中文](README.zh-CN.md)

Codex skills and companion CLIs for creator publishing workflows.

This repository currently has two clearly separated modules:

| Module | Entry | Type | Use Case |
| --- | --- | --- | --- |
| X / FxBrief | `fxbrief` | npm CLI | Render X/Twitter posts and X Articles into local editorial assets with FxEmbed data. |
| X / FxBrief | `matt-fx-brief-material-renderer` | Codex skill | Drive `fxbrief` from Codex for post cards, clean quote cards, X Article Markdown exports, and long screenshots. |
| Image Grab | `matt-pic-grab-image` | Codex skill + Bun script | Find and cache license-safe images with source, license, and risk metadata. |

## X / FxBrief Module

`fxbrief` is the X/Twitter material renderer. It fetches FxEmbed data, renders local HTML with React templates, captures screenshots with Playwright, and exports X Articles with local assets and metadata.

The recommended public workflows are:

| Command | Output |
| --- | --- |
| `post-mobile` | 430px mobile X-style screenshot for source-adjacent news quotation. |
| `post-clean` | Media quote card with provenance, but less official-screenshot feel. |
| `article-md` | X Article export: `article.md`, `assets/`, `metadata.json`, and optional raw FxEmbed payload. |
| `article-shot` | X Article long screenshot, with optional numbered slices for social platforms. |

Install the CLI. The X/FxBrief skill expects `fxbrief` `0.2.1` or newer, because that version includes `post-mobile`, `post-clean`, `article-md`, and `article-shot`:

```bash
npm install -g @mate-matt/fxbrief@latest
fxbrief --version
```

Use without a global install:

```bash
npx -y @mate-matt/fxbrief post-mobile "https://x.com/user/status/123" -o out.png
```

`fxbrief` uses Playwright for local screenshot rendering. If Chromium is missing:

```bash
npx playwright install chromium
```

Common commands:

```bash
fxbrief post-mobile "https://x.com/user/status/123" --scale 2
fxbrief post-clean "https://x.com/user/status/123" --media first --hide-stats
fxbrief article-md "https://x.com/user/status/123"
fxbrief article-shot "https://x.com/user/status/123" --style article-x --width 540 --scale 2
fxbrief article-shot "https://x.com/user/status/123" --style article-x --slice-height 1800 --out output/my-article
```

Translate only the post body:

```bash
fxbrief post-mobile "https://x.com/user/status/123" --lang zh-cn --translated-text
```

Install the Codex skill:

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-fx-brief-material-renderer
```

Example prompt:

```text
Use $matt-fx-brief-material-renderer to turn this X Article into a long screenshot and 3 slices: https://x.com/user/status/123
```

Package source:

```text
packages/fxbrief
```

Generated examples:

```text
examples/fxbrief
```

## Image Grab Module

This module is separate from X/FxBrief. `matt-pic-grab-image` finds commercial-use, editable, no-attribution-required images by keyword or at random, then saves the image locally with its source page, license metadata, and risk notes.

Install the Codex skill:

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-pic-grab-image
```

Example prompt:

```text
Use $matt-pic-grab-image to find a CC0 history painting for an article cover.
```

Direct command:

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts \
  --query "history painting" \
  --mode strict_cc0 \
  --orientation landscape \
  --count 1
```

The default `strict_cc0` mode prioritizes CC0 / Public Domain sources and does not mislabel Pexels, Pixabay, or Unsplash platform licenses as CC0.

## Manual Skill Install

After installation, restart Codex so it can discover the new skills.

Manual install from a local clone:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s "$PWD/skills/matt-fx-brief-material-renderer" "${CODEX_HOME:-$HOME/.codex}/skills/matt-fx-brief-material-renderer"
ln -s "$PWD/skills/matt-pic-grab-image" "${CODEX_HOME:-$HOME/.codex}/skills/matt-pic-grab-image"
```

## Development

```bash
npm --prefix packages/fxbrief install
bun run fxbrief:typecheck
bun run fxbrief:test
bun run fxbrief:build
bun run validate:skills
```

Run fixture rendering:

```bash
bun run fxbrief:render:fixture
```

Preview the npm package contents:

```bash
bun run fxbrief:pack
```

## Publishing Notes

To publish `@mate-matt/fxbrief`, you need an npm account that controls the `@mate-matt` organization scope. Scoped public packages are published with:

```bash
cd packages/fxbrief
npm publish --access public
```

See the official npm docs for scoped public packages: <https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/>

## License

Code in this repository is MIT licensed. Third-party images, X/Twitter content, and FxEmbed responses are not licensed by this repository; preserve source links and review usage rights for your publishing context.
