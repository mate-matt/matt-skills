# Matt Skills

[English](README.en.md) | [简体中文](README.md)

`matt-skills` is a monorepo for creator-facing Codex skills and companion CLIs. The repository keeps the AI-facing skill instructions, deterministic helper scripts, npm packages, examples, and documentation in one place.

## Modules

| Module | Entry | Type | What It Does | Docs |
| --- | --- | --- | --- | --- |
| X / Poster | `matt-x-poster` | Codex skill + Bun scripts | Fetches real FxEmbed data and composes imagegen prompts for cinematic X posters. | [EN](docs/matt-x-poster/README.md) / [中文](docs/matt-x-poster/README.zh-CN.md) |
| X / FxBrief | `matt-fx-brief` | Codex skill | Turns X/Twitter posts, profiles, and X Articles into local editorial assets. | [EN](docs/fx-brief/README.md) / [中文](docs/fx-brief/README.zh-CN.md) |
| X / FxBrief | `fxbrief` | npm CLI | Fetches FxEmbed data and renders post screenshots, profile cards, clean quote cards, article Markdown, long screenshots, and JSON exports. | [EN](docs/fx-brief/README.md) / [中文](docs/fx-brief/README.zh-CN.md) |
| Image Grab | `matt-pic-grab` | Codex skill + Bun script | Finds and caches license-safe images with source, creator, license, and risk metadata. | [EN](docs/pic-grab/README.md) / [中文](docs/pic-grab/README.zh-CN.md) |

## X / Poster

Use `matt-x-poster` when you want to turn a real X/Twitter profile, post, or X Article into a cinematic AI poster. The skill fetches source data through FxEmbed, composes a style-specific imagegen prompt, and runs a final avatar-only pass when a local author avatar exists.

```text
$matt-x-poster --style sunlit-sail-signal https://x.com/user/status/123
```

### Examples

| Style | Example |
| --- | --- |
| `--style lunar-flag-signal` | <img src="docs/matt-x-poster/assets/lunar-flag-signal.png" alt="Lunar flag signal poster example" width="520"> |
| `--style seaside-plein-air-wave` | <img src="docs/matt-x-poster/assets/seaside-plein-air-wave.png" alt="Seaside plein air wave poster example" width="360"> |
| `--style museum-archive-case` | <img src="docs/matt-x-poster/assets/museum-archive-case.png" alt="Museum archive case poster example" width="520"> |
| `--style takeout-receipt-counter` | <img src="docs/matt-x-poster/assets/takeout-receipt-counter.png" alt="Takeout receipt counter poster example" width="420"> |
| `--style profile-portal-3d` | <img src="docs/matt-x-poster/assets/profile-portal-3d.png" alt="Profile portal 3D poster example" width="520"> |

Available styles:

| Style Flag | Visual Direction |
| --- | --- |
| `--style profile-portal-3d` | Floating 3D X profile/post portal and glass-card creator visual. |
| `--style creator-signal-stage` | Keynote, studio, cafe, or display-board launch scene. |
| `--style seaside-plein-air-wave` | Beach easel, painterly coastal realism, and ocean-wave content echo. |
| `--style sunlit-sail-signal` | Sunny ocean, sailboat, and X content printed on sailcloth. |
| `--style editorial-citation-desk` | Editorial desk, open book, source card, and citation/reference visual. |
| `--style street-poster-wheatpaste` | Urban pasted wall poster with paper and glue texture. |
| `--style museum-archive-case` | Museum vitrine, archive case, or preserved digital source artifact. |
| `--style creator-field-notes` | Research desk, notebooks, sticky tabs, and creator dossier. |
| `--style cinematic-contact-sheet` | Film strips, darkroom contact sheet, and selected-frame review. |
| `--style designer-pinboard` | Cork/fabric design board, moodboard, identity system, and palette study. |
| `--style skin-script-body-art` | Tasteful editorial body-art typography and temporary tattoo composition. |
| `--style bathroom-mirror-sticky-note` | Bathroom mirror, sticky note, and morning-reminder humor. |
| `--style fridge-door-magnet` | Kitchen fridge, magnet note, grocery-list, or family-calendar humor. |
| `--style elevator-notice-board` | Elevator/lobby notice board, official-looking flyer, or building bulletin. |
| `--style laundromat-machine-note` | Laundromat washer note, dryer clipping, or folding-table printout. |
| `--style takeout-receipt-counter` | Cafe/takeout counter, receipt, paper-bag label, or pickup slip. |
| `--style grand-opera-chorus` | Opera-house staging, libretto, program card, or high-culture comedy. |
| `--style lunar-flag-signal` | Lunar EVA scene with X content printed on a planted moon flag. |
| `--style dynamic` | Runtime style written per source at `dynamic-style.md`. |
| `--style film-dynamic` | Runtime classic-cinema scene mechanism written per source. |

Detailed setup, output flow, style notes, and open-source hygiene:

- [Matt X Poster guide in English](docs/matt-x-poster/README.md)
- [Matt X Poster 中文教程](docs/matt-x-poster/README.zh-CN.md)

## X / FxBrief

Use `matt-fx-brief` when you need publishable material from X/Twitter without depending on third-party screenshot pages. It uses the published `fxbrief` CLI, FxEmbed data, local React/HTML templates, and Playwright screenshots.

Core workflows:

| Command | Output |
| --- | --- |
| `post-mobile` | 430px mobile X-style screenshot for source-adjacent quotation. |
| `post-clean` | Media quote card that keeps provenance while reducing the official-screenshot feel. |
| `profile-card` | X profile card for creator/business-card style sharing, with optional latest posts. |
| `article-md` | X Article export with `article.md`, `assets/`, `metadata.json`, and optional raw FxEmbed data. |
| `article-shot` | X Article long screenshot, with optional numbered slices for social platforms. |
| `json` | Raw or normalized FxEmbed data for posts, threads, quote lists, and inspection. |

| Example |
| --- |
| Use `$matt-fx-brief` to render `https://x.com/Google/status/2054285931260334181` as a screenshot, with the post body in Chinese. |
| <img src="docs/fx-brief/assets/google-android-prompt.jpeg" alt="FxBrief prompt in Codex" width="520"> |
| <img src="docs/fx-brief/assets/google-android-output.jpeg" alt="FxBrief generated Chinese post screenshot" width="420"> |

| Profile Card Example |
| --- |
| Use `$matt-fx-brief` to turn `https://x.com/mate_mattt` into a profile card with one latest post. |
| <img src="docs/fx-brief/assets/mate-mattt-profile-latest.png" alt="Matt profile card generated by FxBrief" width="420"> |

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
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-x-poster
```

Manual install from a local clone:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s "$PWD/skills/matt-fx-brief" "${CODEX_HOME:-$HOME/.codex}/skills/matt-fx-brief"
ln -s "$PWD/skills/matt-pic-grab" "${CODEX_HOME:-$HOME/.codex}/skills/matt-pic-grab"
ln -s "$PWD/skills/matt-x-poster" "${CODEX_HOME:-$HOME/.codex}/skills/matt-x-poster"
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
