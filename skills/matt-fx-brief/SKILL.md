---
name: matt-fx-brief
description: Use this skill when asked to render X/Twitter posts, X profiles, or X Articles into local editorial assets with the fxbrief CLI and FxEmbed data. Covers post-mobile, post-clean, profile-card, article-md, article-shot, json/raw-json, translated post body screenshots, Markdown article exports with assets and metadata, X Article long screenshots with optional slices, profile/business-card images, and raw or normalized FxEmbed JSON export.
---

# Matt Fx Brief

Use the globally installed `fxbrief` CLI to create deterministic local assets from FxEmbed data. Prefer this skill for X/Twitter post screenshots, profile cards, clean editorial quote cards, X Article Markdown archives, and X Article long screenshots.

Do not hand-build screenshots or reconstruct article Markdown manually when `fxbrief` can export the asset.

## CLI Requirement

Use `fxbrief` `0.2.4` or newer. Check the command from `PATH`:

```bash
fxbrief --version
```

If it is missing or older than `0.2.4`:

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

## Route The Request

Treat this skill as one X/FxEmbed router. First identify the input shape, then choose the output workflow from the user's intent.

### Input Shape

- Profile URL or handle: `https://x.com/user`, `https://twitter.com/user`, `@user`, or `user`.
- Status URL or id: `https://x.com/user/status/123`, `https://twitter.com/user/status/123`, or `123`.

Do not rely on URL shape alone to decide whether a status URL is a normal post or an X Article, because both use `/status/<id>`. Let the requested output decide. If the user is unclear and the difference matters, inspect the payload with `fxbrief json "<url>" --normalized` before rendering.

### Intent Routing

- `post-mobile`: 430px mobile X-style post screenshot for source-adjacent quotation.
- `post-clean`: media/reporting quote card that preserves provenance while reducing the "official X screenshot" feel.
- `profile-card`: X profile card for creator/business-card style sharing.
- `article-md`: X Article export to `article.md`, local `assets/`, `metadata.json`, and `raw.fxembed.json`.
- `article-shot`: X Article long screenshot; add slices for Xiaohongshu, WeChat, Instagram carousels, or other social posting flows.
- `json`: raw FxEmbed JSON export for posts, threads, or quote lists. Add `--normalized` when the user wants fxbrief's local normalized model.

## Workflow

1. Confirm `fxbrief --version` is `0.2.4` or newer when using profile cards or JSON export.
2. Parse the input as either a profile target or a status target.
3. Choose the command from the intent:
   - Profile card, creator card, business card, homepage screenshot, or X profile: use `profile-card`.
   - Single post screenshot or source quote: use `post-mobile` by default.
   - Clean article/news illustration from a post: use `post-clean`.
   - X Article Markdown, archive, assets, metadata, or local repost source: use `article-md`.
   - X Article long screenshot, carousel, slices, or platform repost images: use `article-shot`.
   - Raw data, metadata inspection, debugging, or integration data: use `json`.
4. Run `fxbrief` directly, using an explicit `--out` path when the user needs a stable location.
5. Verify generated files exist. For `article-md`, inspect `article.md` and `metadata.json`. For screenshots, confirm the PNG/WebP path and any slice files.
6. Report absolute output paths.

## Language Handling

For `post-mobile` and `post-clean`, if the user asks for a specific language, pass `--lang <code> --translated-text` so only the post body is translated. If the user asks for translation without naming a language, infer it from the conversation language: use `--lang zh-cn --translated-text` in Chinese conversations and `--lang en --translated-text` in English conversations.

Do not translate names, handles, timestamps, metrics, buttons, source footer, or other UI labels. Add `--show-translation` only when the user explicitly wants both original and translated text visible.

For `article-md` and `article-shot`, preserve the original article text unless the user explicitly asks for a translated article. These article commands are usually used to archive or repost the author's own long-form source, so do not infer translation only from the conversation language.

If the user explicitly asks to keep the original language, do not pass `--lang` or `--translated-text`.

## Commands

Post screenshots:

```bash
fxbrief post-mobile "https://x.com/user/status/123" --scale 2
fxbrief post-mobile "https://x.com/user/status/123" --scale 2 --show-subscribe
fxbrief post-clean "https://x.com/user/status/123" --media first --hide-stats
fxbrief post-mobile "https://x.com/user/status/123" --lang zh-cn --translated-text
```

Profile cards:

```bash
fxbrief profile-card "https://x.com/user" --width 430 --scale 2
fxbrief profile-card "https://x.com/user" --latest-post --width 430 --scale 2
fxbrief profile-card "https://x.com/user" --count 3 --width 600 --scale 2
```

X Articles:

```bash
fxbrief article-md "https://x.com/user/status/123"
fxbrief article-shot "https://x.com/user/status/123" --style article-x --width 540 --scale 2
fxbrief article-shot "https://x.com/user/status/123" --style article-x --width 540 --scale 2 --slice-height 1800 --out output/my-article
```

Data inspection:

```bash
fxbrief json "https://x.com/user/status/123"
fxbrief json "https://x.com/user/status/123" --kind thread --normalized --out output/json
```

## Defaults

- Use `--timezone Asia/Shanghai` unless the user asks otherwise.
- Use PNG and `--scale 2` for screenshot assets.
- Keep the source footer by default for editorial provenance.
- `post-mobile` already defaults to 430px width.
- `profile-card` defaults to 430px width and uses FxEmbed profile data plus local rendering; it does not capture the live X web page.
- `profile-card` does not append posts by default. Add `--count <1-6>` when the user asks for a profile timeline/list under the card. `--latest-post` is a shortcut for `--count 1`. Add `--with-replies` only when replies should be eligible.
- FxEmbed currently returns profile statuses but not a reliable pinned-post marker. If a future status payload contains `is_pinned` or `pinned`, the renderer shows a Pinned label automatically.
- The `post-mobile` Subscribe button is hidden by default because FxEmbed does not currently expose a reliable subscription-availability field. Use `--show-subscribe` only when the user explicitly wants it or has verified the account offers subscriptions.
- For `article-md`, keep local assets, `metadata.json`, and `raw.fxembed.json` unless the user asks otherwise.
- For `article-shot`, default to `--style article-x --width 540 --scale 2`.
- Add `--slice-height 1800` when the user wants platform-ready split images. Report both the full long screenshot and all numbered slices.
- `json` does not use Playwright, render HTML, or download media. Without `--out`, it prints JSON to stdout.

## Validation

For normal usage, verify the installed CLI and generated output:

```bash
fxbrief --version
fxbrief --help
```

For visual tasks, render the user's URL to an explicit `--out` path and confirm the file exists.
