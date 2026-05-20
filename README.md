# Matt Skills

[English](README.md) | [简体中文](README.zh-CN.md)

`matt-skills` is a monorepo for creator-facing Codex skills and companion CLIs. The repository keeps the AI-facing skill instructions, deterministic helper scripts, npm packages, examples, and documentation in one place.

## Modules

| Module | Entry | Type | What It Does | Docs |
| --- | --- | --- | --- | --- |
| X / FxBrief | `matt-fx-brief` | Codex skill | Turns X/Twitter posts and X Articles into local editorial assets. | [EN](docs/fx-brief/README.md) / [中文](docs/fx-brief/README.zh-CN.md) |
| X / FxBrief | `fxbrief` | npm CLI | Fetches FxEmbed data and renders post screenshots, clean quote cards, article Markdown, and long screenshots. | [EN](docs/fx-brief/README.md) / [中文](docs/fx-brief/README.zh-CN.md) |
| Image Grab | `matt-pic-grab` | Codex skill + Bun script | Finds and caches license-safe images with source, creator, license, and risk metadata. | [EN](docs/pic-grab/README.md) / [中文](docs/pic-grab/README.zh-CN.md) |

## X / FxBrief

Use `matt-fx-brief` when you need publishable material from X/Twitter without depending on third-party screenshot pages. It uses the published `fxbrief` CLI, FxEmbed data, local React/HTML templates, and Playwright screenshots.

Core workflows:

| Command | Output |
| --- | --- |
| `post-mobile` | 430px mobile X-style screenshot for source-adjacent quotation. |
| `post-clean` | Media quote card that keeps provenance while reducing the official-screenshot feel. |
| `article-md` | X Article export with `article.md`, `assets/`, `metadata.json`, and optional raw FxEmbed data. |
| `article-shot` | X Article long screenshot, with optional numbered slices for social platforms. |

| Example |
| --- |
| Use `$matt-fx-brief` to render `https://x.com/Google/status/2054285931260334181` as a screenshot, with the post body in Chinese. |
| <img src="docs/fx-brief/assets/google-android-prompt.jpeg" alt="FxBrief prompt in Codex" width="520"> |
| <img src="docs/fx-brief/assets/google-android-output.jpeg" alt="FxBrief generated Chinese post screenshot" width="420"> |

Detailed setup, examples, command options, output structure, and screenshots:

- [FxBrief guide in English](docs/fx-brief/README.md)
- [FxBrief 中文教程](docs/fx-brief/README.zh-CN.md)

## Image Grab

Use `matt-pic-grab` when you need an image for a cover, article illustration, deck, social post, or background and you want the source trail preserved. The default mode prioritizes CC0 / Public Domain sources and avoids mislabeling stock-platform licenses as CC0.

| Example |
| --- |
| Use `$matt-pic-grab` to find a CC0 history painting for an article cover. |
| <img src="docs/assets/example-history-socrates.webp" alt="Public-domain history painting example" width="420"> |

Direct script example:

```bash
bun run skills/matt-pic-grab/scripts/grab-image.ts \
  --query "history painting" \
  --mode strict_cc0 \
  --orientation landscape \
  --count 1
```

Detailed setup, examples, source policy, script options, and output fields:

- [Pic Grab guide in English](docs/pic-grab/README.md)
- [Pic Grab 中文教程](docs/pic-grab/README.zh-CN.md)

## Manual Skill Install

Restart Codex after installation so it can discover the new skills.

Install from GitHub:

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-fx-brief
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-pic-grab
```

Manual install from a local clone:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s "$PWD/skills/matt-fx-brief" "${CODEX_HOME:-$HOME/.codex}/skills/matt-fx-brief"
ln -s "$PWD/skills/matt-pic-grab" "${CODEX_HOME:-$HOME/.codex}/skills/matt-pic-grab"
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
