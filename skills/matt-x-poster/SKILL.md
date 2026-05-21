---
name: matt-x-poster
description: Generate imagegen promotional poster cards from real X/Twitter links using FxEmbed data. Use when Codex needs to turn an X profile, post, or X Article URL into a cinematic social-promo image, especially 3D profile/post posters, creator launch cards, exact X-content visual cards, or prompt-structured X content marketing images.
---

# Matt X Poster

Create promotional X content posters from real FxEmbed data. The deterministic scripts fetch and normalize profile/post/article data; the prompt modules turn that data into strong imagegen prompts.

Do not depend on a globally installed `fxbrief` CLI at runtime. This skill's Bun scripts call FxEmbed directly.

## Core Workflow

1. Identify the user's X input and desired style. Default style: `profile-portal-3d`.
2. Fetch real X data:

```bash
bun run scripts/x-card-data.ts prepare "<x-url-or-handle>" --out output/matt-x-poster/<slug>
```

Use `prepare` for most requests. It fetches a profile URL as profile-only data, or a status URL as post/article data plus the author's profile.

3. Compose the imagegen prompt:

```bash
bun run scripts/compose-prompt.ts \
  --context output/matt-x-poster/<slug>/card-context.json \
  --style profile-portal-3d \
  --out output/matt-x-poster/<slug>/final-prompt.md
```

4. Read `final-prompt.md`, then call imagegen with that prompt. Do not stop after producing the prompt unless the user explicitly asks for prompt-only output.

5. For high-fidelity imagegen work, inspect local avatar/media paths from `card-context.json`, true X app screenshot images from `assets/reference-screenshots/`, and HTML structure references from `assets/fxbrief-reference/` or `assets/static-reference/` before imagegen. Add short, task-specific layout notes when needed. When local avatar or post media exists, visually inspect it first and add concise observed visual details to the imagegen prompt, because paths alone may not lock the generated image tightly enough.

6. Verify the generated image visually against `card-context.json`: exact author name, exact handle, exact post text or article title, and no invented metrics or extra UI facts.

## Data Commands

Use these subcommands when the user asks for a specific data mode:

```bash
bun run scripts/x-card-data.ts profile "https://x.com/mate_mattt" --out output/matt-x-poster/profile
bun run scripts/x-card-data.ts post "https://x.com/mate_mattt/status/2057357574031515887" --out output/matt-x-poster/post
bun run scripts/x-card-data.ts article "https://x.com/mate_mattt/status/2056955119015735689" --out output/matt-x-poster/article
```

Outputs:

- `raw-profile.fxembed.json`: raw FxEmbed profile payload when available.
- `raw-post.fxembed.json`: raw FxEmbed status payload when available.
- `card-context.json`: normalized factual source for imagegen.
- `media/`: downloaded profile/avatar/banner/post/article image assets when remote image download succeeds.
- `manifest.json`: generated paths and source type.
- `final-prompt.md`: composed prompt after running `compose-prompt.ts`.

## Factual Rules

- Use only `card-context.json` for factual content.
- Preserve exact profile name, `@handle`, post text, article title, source URL, and media relationships.
- If the source is an X Article, prioritize the article title, preview text, cover image, and author metadata. Do not fetch or render full long-form body unless a future prompt module explicitly requires it.
- If the post contains media, include the media relationship in the prompt and ask imagegen to render that media as the real post/card media.
- Prefer local media paths from `card-context.json` when present; keep original media URLs as provenance.
- For profile count rows, use `profile.display_counts.text` exactly; it intentionally follows X's visible profile row order, uses X-style compact K/M notation for counts above 1,000, and should not include a posts count.
- Do not invent comments, replies, endorsements, analytics panels, new metrics, extra badges, new images, or unrelated links.

## Visual References

Read `references/visual-reference-index.md` when composing or debugging prompt quality.

Reference image paths are intentionally separate from HTML paths:

- Use `assets/reference-screenshots/*.png` as the only bundled image references. These are true X app screenshots.
- Use `assets/fxbrief-reference/*.html` only as FxBrief-rendered HTML structure references.
- Use `assets/static-reference/*.html` only as simplified static shell references.

All bundled references are structural references only. Use them for:

- X mobile profile spacing and hierarchy.
- profile banner/avatar overlap.
- post list card rhythm.
- post-detail text scale and action row spacing.
- X Article title/media vertical rhythm.
- rounded card geometry and mobile UI proportions.

Never use visible screenshot or HTML content as poster facts. Do not quote reference screenshot text. Do not reuse reference screenshot images or metrics. The only factual source is `card-context.json`.

## Prompt Modules

Current module:

- `prompts/profile-portal-3d.md`: flagship 3D composition. A tilted X profile screen lies flat in the background; the selected post/article rises from it as a particle stream and assembles into a sharp floating X content card.

Future modules should follow `references/prompt-module-guide.md` and stay in `prompts/`.

## Imagegen Guidance

When calling imagegen:

- Use the complete `final-prompt.md` text.
- Do not force one fixed aspect ratio unless the user explicitly asks. For long text, let both width and height expand into a broad readable poster; avoid narrow extra-tall strips.
- Preserve multilingual source text exactly, including Chinese, English, punctuation, emoji, and `@handle` spelling.
- If local avatar/media paths exist, include both the paths and a short visual description observed from those files, such as subject type, pose, accessories, visible text, color treatment, and key media layout.
- Require readable typography: crisp strokes, high contrast, no blurry/warped Chinese text, no rain or particles covering source text.
- Ask for a polished cinematic poster, not a plain screenshot.
- If the first image has wrong text, wrong handle, invented numbers, or copied reference content, regenerate with a stricter prompt that repeats the factual content section and the negative constraints.

## Quality Checklist

Before answering the user, confirm:

- `card-context.json` exists and came from the user's X link.
- `final-prompt.md` exists and uses the requested style.
- imagegen was called unless the user requested prompt-only output.
- The generated image is based on the fetched X data, not the reference screenshots.
- Image references came only from `assets/reference-screenshots/`; HTML references came only from `assets/fxbrief-reference/` or `assets/static-reference/`.
