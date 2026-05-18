# Matt Skills

[English](README.md) | [简体中文](README.zh-CN.md)

Codex skills and companion CLIs for creator publishing workflows.

This repository currently includes:

| Name | Type | Use Case |
| --- | --- | --- |
| `fxbrief` | npm CLI | Render X/Twitter posts, threads, quote walls, and X Articles into local editorial assets using FxEmbed data. |
| `fx-brief-material-renderer` | Codex skill | Use `fxbrief` from Codex to generate source cards, thread images, quote walls, and X Article Markdown archives. |
| `matt-pic-grab-image` | Codex skill + Bun script | Find and cache license-safe images with source, license, and risk metadata. |

## fxbrief CLI

Install after the package is published:

```bash
npm install -g @mate-matt/fxbrief
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
fxbrief thread-vertical "https://x.com/user/status/123" --max-posts 6
fxbrief quote-wall "https://x.com/user/status/123" --count 12 --width 920 --columns 2
fxbrief article-md "https://x.com/user/status/123"
```

Package source:

```text
packages/fxbrief
```

## Codex Skills

Install the X/FxEmbed renderer skill:

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/fx-brief-material-renderer
```

Install the image finder skill:

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-pic-grab-image
```

Restart Codex after installation so it can discover the new skill.

Manual install from a local clone:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s "$PWD/skills/fx-brief-material-renderer" "${CODEX_HOME:-$HOME/.codex}/skills/fx-brief-material-renderer"
ln -s "$PWD/skills/matt-pic-grab-image" "${CODEX_HOME:-$HOME/.codex}/skills/matt-pic-grab-image"
```

## matt-pic-grab-image

Find a commercial-use, editable, no-attribution-required image by keyword or at random, then save the image locally with its source page, license metadata, and risk notes.

Example:

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

To publish `@mate-matt/fxbrief`, you need an npm account that controls the `@mate-matt` user or organization scope. Scoped public packages are published with:

```bash
cd packages/fxbrief
npm publish --access public
```

See the official npm docs for scoped public packages: <https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/>

## License

Code in this repository is MIT licensed. Third-party images, X/Twitter content, and FxEmbed responses are not licensed by this repository; preserve source links and review usage rights for your publishing context.
