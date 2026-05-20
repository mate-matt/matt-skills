# X / FxBrief Guide

[English](README.md) | [简体中文](README.zh-CN.md)

`matt-fx-brief` is the Codex skill for turning X/Twitter posts and X Articles into local editorial assets. It delegates deterministic work to the published `fxbrief` CLI.

## What You Can Create

| Workflow | Command | Output |
| --- | --- | --- |
| Mobile post screenshot | `post-mobile` | 430px X-style source card for news quotation. |
| Clean media quote card | `post-clean` | A less official-looking quote card with provenance. |
| Article Markdown archive | `article-md` | `article.md`, local `assets/`, `metadata.json`, and optional raw FxEmbed data. |
| Article long screenshot | `article-shot` | Full X Article screenshot, optionally split into numbered slices. |

## Requirements

Install the CLI:

```bash
npm install -g @mate-matt/fxbrief@latest
fxbrief --version
```

Use `fxbrief` `0.2.1` or newer. That version contains the four workflows used by the skill.

Screenshot rendering uses Playwright. Install Chromium once if needed:

```bash
npx playwright install chromium
```

Install the Codex skill:

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-fx-brief
```

Restart Codex after installing a skill.

## Quick Examples

Render a mobile post card:

```bash
fxbrief post-mobile "https://x.com/user/status/123" --scale 2
```

Render a translated Chinese post body while keeping names, metrics, timestamps, and UI labels unchanged:

```bash
fxbrief post-mobile "https://x.com/Google/status/2054285931260334181" \
  --lang zh-cn \
  --translated-text \
  --out output/google-android-chinese.png
```

Render a cleaner editorial card:

```bash
fxbrief post-clean "https://x.com/user/status/123" --media first --hide-stats
```

Export an X Article to Markdown:

```bash
fxbrief article-md "https://x.com/user/status/123"
```

Render an X Article as a long screenshot and slices:

```bash
fxbrief article-shot "https://x.com/user/status/123" \
  --style article-x \
  --width 540 \
  --scale 2 \
  --slice-height 1800 \
  --out output/my-article
```

## Example Case

| Example |
| --- |
| Use `$matt-fx-brief` to render `https://x.com/Google/status/2054285931260334181` as a screenshot, with the post body in Chinese. |
| <img src="assets/google-android-prompt.jpeg" alt="Prompt asking the FxBrief skill to render a Chinese post body" width="560"> |
| <img src="assets/google-android-output.jpeg" alt="Generated Google Android Chinese post screenshot" width="430"> |

Other common requests:

```text
Use $matt-fx-brief to export this X Article as Markdown with local assets: https://x.com/user/status/123
Use $matt-fx-brief to turn this X Article into one full long screenshot and at least 3 slices: https://x.com/user/status/123
```

## Output Locations

If `--out` is not provided, screenshots are written under `output/` with a timestamped filename.

`article-md` defaults to:

```text
output/articles/<status-id>/
  article.md
  metadata.json
  raw.fxembed.json
  assets/
    cover.jpg
    image-01.jpg
```

When `article-shot --slice-height` is used with an output directory, the directory contains one full long screenshot plus numbered slices:

```text
output/my-article/
  article-long.png
  article-01.png
  article-02.png
  article-03.png
```

## Useful Options

- `--out <path>`: output file path, or output directory when no extension is provided.
- `--format <png|webp>`: screenshot format.
- `--width <px>`: capture width in CSS pixels.
- `--scale <number>`: device scale factor; `2` is the default.
- `--timezone <tz>`: rendered timestamp timezone; defaults to `Asia/Shanghai`.
- `--lang <code>`: request FxEmbed translation.
- `--translated-text`: render translated post body text in place of the original.
- `--show-translation`: show both original and translated text when FxEmbed returns a translation.
- `--media <none|first|grid|mosaic|full>`: media rendering mode.
- `--hide-source-footer`: hide the provenance footer.
- `--debug-html`: save intermediate HTML next to the image.

## Notes

Keep the source footer unless your publishing layout already provides equivalent provenance. This project is not affiliated with X/Twitter or FxEmbed. Third-party post content and media are not licensed by this repository.
