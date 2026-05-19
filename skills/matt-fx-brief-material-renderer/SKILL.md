---
name: matt-fx-brief-material-renderer
description: Use this skill when asked to render X/Twitter posts or X Articles into local editorial assets with the fxbrief CLI and FxEmbed data. Covers post-mobile, post-clean, article-md, article-shot, translated post body screenshots, Markdown article exports with assets and metadata, and X Article long screenshots with optional slices.
---

# Matt Fx Brief Material Renderer

Use the globally installed `fxbrief` CLI to create deterministic local assets from FxEmbed data. Prefer this skill for X/Twitter post screenshots, clean editorial quote cards, X Article Markdown archives, and X Article long screenshots.

Do not hand-build screenshots or reconstruct article Markdown manually when `fxbrief` can export the asset.

## CLI Requirement

Use `fxbrief` `0.2.1` or newer. Check the command from `PATH`:

```bash
fxbrief --version
```

If it is missing or older than `0.2.1`:

```bash
npm install -g @mate-matt/fxbrief@latest
```

Then confirm the expected commands exist:

```bash
fxbrief --help
```

Screenshot commands use Playwright. If Chromium is missing:

```bash
npx playwright install chromium
```

## Choose The Command

- `post-mobile`: 430px mobile X-style post screenshot for source-adjacent quotation.
- `post-clean`: media/reporting quote card that preserves provenance while reducing the "official X screenshot" feel.
- `article-md`: X Article export to `article.md`, local `assets/`, `metadata.json`, and `raw.fxembed.json`.
- `article-shot`: X Article long screenshot; add slices for Xiaohongshu, WeChat, Instagram carousels, or other social posting flows.

## Workflow

1. Confirm the input is an X/Twitter status URL or numeric status id.
2. Select one of the four commands above based on the user's requested output.
3. Run `fxbrief` directly, using an explicit `--out` path when the user needs a stable location.
4. Verify generated files exist. For `article-md`, inspect `article.md` and `metadata.json`. For screenshots, confirm the PNG/WebP path and any slice files.
5. Report absolute output paths.

## Language Handling

For `post-mobile` and `post-clean`, if the user asks for a specific language, pass `--lang <code> --translated-text` so only the post body is translated. If the user asks for translation without naming a language, infer it from the conversation language: use `--lang zh-cn --translated-text` in Chinese conversations and `--lang en --translated-text` in English conversations.

Do not translate names, handles, timestamps, metrics, buttons, source footer, or other UI labels. Add `--show-translation` only when the user explicitly wants both original and translated text visible.

For `article-md` and `article-shot`, preserve the original article text unless the user explicitly asks for a translated article. These article commands are usually used to archive or repost the author's own long-form source, so do not infer translation only from the conversation language.

If the user explicitly asks to keep the original language, do not pass `--lang` or `--translated-text`.

## Commands

```bash
fxbrief post-mobile "https://x.com/user/status/123" --scale 2
fxbrief post-clean "https://x.com/user/status/123" --media first --hide-stats
fxbrief article-md "https://x.com/user/status/123"
fxbrief article-shot "https://x.com/user/status/123" --style article-x --width 540 --scale 2
fxbrief article-shot "https://x.com/user/status/123" --style article-x --width 540 --scale 2 --slice-height 1800 --out output/my-article
fxbrief post-mobile "https://x.com/user/status/123" --lang zh-cn --translated-text
```

## Defaults

- Use `--timezone Asia/Shanghai` unless the user asks otherwise.
- Use PNG and `--scale 2` for screenshot assets.
- Keep the source footer by default for editorial provenance.
- `post-mobile` already defaults to 430px width.
- For `article-md`, keep local assets, `metadata.json`, and `raw.fxembed.json` unless the user asks otherwise.
- For `article-shot`, default to `--style article-x --width 540 --scale 2`.
- Add `--slice-height 1800` when the user wants platform-ready split images. Report both the full long screenshot and all numbered slices.

## Validation

For normal usage, verify the installed CLI and generated output:

```bash
fxbrief --version
fxbrief --help
```

For visual tasks, render the user's URL to an explicit `--out` path and confirm the file exists.
