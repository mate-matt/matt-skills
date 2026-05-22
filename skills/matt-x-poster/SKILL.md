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

4. If the user requested translation, run the agent translation workflow below before imagegen. Do not modify `card-context.json`; append a `Translation Aid` section to the prompt you send to imagegen.

5. Read `final-prompt.md`, add any required media observations and optional translation aid, then call imagegen with that complete prompt. Do not stop after producing the prompt unless the user explicitly asks for prompt-only output.

6. For high-fidelity imagegen work, inspect local avatar/media paths from `card-context.json`, true X app screenshot images from `assets/reference-screenshots/`, and HTML structure references from `assets/fxbrief-reference/` or `assets/static-reference/` before imagegen. Add short, task-specific layout notes when needed. For avatars, inspect the local file only to confirm Reference Image A exists; do not append verbal face, hair, clothing, pose, lighting, or mood descriptions that could make imagegen reconstruct a similar-looking person. For post/article media, visual observations are allowed because media content often needs layout-specific anchoring.

7. Verify the generated image visually against `card-context.json`: exact author name, exact handle, exact post text or article title, faithful avatar identity when an avatar is rendered, and no invented metrics or extra UI facts. If the only failure is avatar fidelity, use the Avatar Correction Pass below instead of regenerating the whole poster.

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

## Avatar Reference Lock

When `card-context.json` contains `profile.avatar_local_path` or `assets.profile_avatar_path`, the composed prompt defines that file as Reference Image A.

- Treat Reference Image A as an image asset to reproduce, not as a textual portrait idea.
- Do not describe the avatar's face, hair, clothing, pose, lighting, or mood in task-specific prompt notes. Such descriptions encourage imagegen to create a similar-looking avatar instead of preserving the source identity.
- The selected prompt module controls avatar placement, scale, crop, and physical surface. The avatar lock controls identity fidelity only.
- If fidelity is hard, prefer a smaller, flatter, more bitmap-like avatar over an enlarged or stylized avatar.
- Do not add case-specific avatar fixes for one user, one handle, one gender, one pose, or one source image. The rule is asset-based and applies to every local avatar.

## Avatar Correction Pass

Use this only after an initial image has been generated and the rest of the poster is acceptable, but the rendered avatar does not look like Reference Image A.

Do not regenerate the whole poster for an avatar-only failure. Use an image-editing pass with the generated poster as the base image and the local avatar file as Reference Image A.

Correction prompt pattern:

```md
Only edit the circular avatar area that represents the X author/profile avatar.

Replace that avatar with a faithful direct visual reproduction of Reference Image A:
<local avatar path>

Keep every other part of the image unchanged: all text, cards, media thumbnails, layout, board/material texture, lighting, shadows, crop, colors, and composition.

Do not create a similar-looking person. Do not redraw, beautify, relight, stylize, change expression, change face angle, change crop, replace the subject, or alter the avatar background. The avatar should look like the same source bitmap placed into the existing avatar circle.
```

Use the correction pass only for avatar fidelity. If source text, handle, media, metrics, or layout facts are wrong, regenerate with stricter factual constraints instead.

## Agent Translation Workflow

Use this workflow only when the user asks for translation while invoking this skill, such as "翻译", "翻译成中文", "中文释义", "中英双语", "English translation", "translated-only", or "只显示译文".

Do not call a translation API from the bundled scripts. Translation is an agent step performed after X data is fetched and before imagegen.

Translation scope:

- If `source_type` is `post`, translate only `post.text`.
- If `source_type` is `article`, translate only `article.title` and `article.preview_text` when present.
- If `source_type` is `profile`, do not translate `profile.description`, profile bio, location, website, counts, joined date, or any profile metadata.
- Do not translate quote posts by default. Translate quote text only if the user explicitly asks for quote translation.
- Never overwrite original fields in `card-context.json`; it remains the factual source.

Default display policy:

- Default mode is bilingual aid: keep the original source text as the factual anchor and allow the translation to appear as smaller secondary copy, subtitle, caption, footnote, receipt side note, museum label, or annotation when the selected style has room.
- If the user asks for translated-only rendering, the translation may be the main visible text, but the original text must remain in the prompt as the factual source and provenance.
- If the user asks for translation only for understanding, use semantic-only mode: include translation in the prompt as meaning guidance, but instruct imagegen not to render it visibly.

When translation is requested, append a section like this to the imagegen prompt after `final-prompt.md` and before any task-specific composition notes:

```md
## Translation Aid

The user requested translation. This section is generated by the agent after reading `card-context.json`; it is not part of the fetched X data.

Source type: post | article
Target language: <language requested by the user, default zh-CN for Chinese requests>
Translation display mode: bilingual | translated-only | semantic-only

Original source text:
<exact post.text, or exact article.title / article.preview_text>

Agent translation:
<agent-translated text>

Rendering instruction:
- Preserve the original X source text, author, handle, media relationship, and all facts from `card-context.json`.
- Use the translation only as auxiliary text or semantic guidance according to the selected display mode.
- Do not invent extra claims, metrics, dates, links, comments, endorsements, UI labels, summaries, or continuation text from the translation.
- If both original and translation appear, keep them visually distinct and do not let the translation replace the source identity.
```

For Chinese translation requests, translate naturally into concise modern Chinese while preserving names, `@handles`, URLs, product names, emoji, and punctuation relationships. For English translation requests, translate naturally into clear English and keep Chinese names or handles unchanged when they are identity markers.

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

Current modules:

- `prompts/profile-portal-3d.md`: flagship 3D composition. A tilted X profile screen lies flat in the background; the selected post/article rises from it as a particle stream and assembles into a sharp floating X content card.
- `prompts/creator-signal-stage.md`: realistic creator launch poster. A real keynote/studio/cafe display, printed board, or workspace surface presents the creator profile, post, or article as a grounded promotional scene.
- `prompts/editorial-citation-desk.md`: photorealistic editorial citation desk. An open book, article proof, or magazine spread on a warm writing desk contains the X content as a printed source/citation card, often with one natural hand turning the page.
- `prompts/street-poster-wheatpaste.md`: photorealistic urban wheatpaste poster. The X content becomes a freshly pasted city wall poster with paper edges, glue texture, street light, and carefully protected readable source text.
- `prompts/museum-archive-case.md`: premium museum/archive display. The X content becomes a preserved digital artifact inside a glass case, frame, vitrine, or archival tray with restrained labels and controlled gallery lighting.
- `prompts/creator-field-notes.md`: intimate creator research desk. Printed X source cards, notebooks, sticky tabs, and hand-marked notes make the content feel studied and selected without inventing analysis facts.
- `prompts/cinematic-contact-sheet.md`: analog film review contact sheet. The X source card becomes the selected frame among film strips, darkroom paper, grease-pencil marks, and editorial review materials.
- `prompts/designer-pinboard.md`: design studio inspiration board. The X source card, banner swatches, exact count chips, and media thumbnails are pinned to a real cork/fabric board as an identity system.
- `prompts/skin-script-body-art.md`: tasteful adult body-art portrait. X avatar, text, handle, and source fragments become elegant flat temporary tattoo transfers from the collarbone downward across decolletage, upper chest, and garment-framed upper bust area.
- `prompts/bathroom-mirror-sticky-note.md`: humorous photorealistic bathroom mirror scene. X content becomes a morning sticky note, mirror card, toothbrush-cup label, or countertop reminder, with a tasteful steamy adult reflection kept secondary.
- `prompts/fridge-door-magnet.md`: humorous photorealistic kitchen-fridge scene. X content becomes a magnet, taped printout, grocery-list card, or calendar note discovered as part of ordinary household life.
- `prompts/elevator-notice-board.md`: humorous photorealistic elevator-lobby scene. X content becomes a pinned notice, laminated bulletin, or taped flyer on a real building notice board.
- `prompts/laundromat-machine-note.md`: humorous photorealistic laundromat scene. X content becomes a washer-door note, detergent-label card, dryer clipping, or folding-table printout found while waiting for laundry.
- `prompts/takeout-receipt-counter.md`: humorous photorealistic cafe/takeout scene. X content becomes a receipt, order ticket, paper-bag label, counter slip, or clipped pickup card.

Future modules should follow `references/prompt-module-guide.md` and stay in `prompts/`.

Use `editorial-citation-desk` when the user wants X content to feel like article evidence, a source card, a writing workflow asset, a newsletter/reference visual, a book/page composition, a hand-turning-page scene, or a credible editorial citation rather than a launch stage or sci-fi 3D portal.
Use `street-poster-wheatpaste` when the user wants bold urban/public-wall energy, wheatpaste paper, venue-poster mood, or city-light texture.
Use `museum-archive-case` when the user wants premium, curated, archival, exhibition, glass-case, or digital-artifact treatment.
Use `creator-field-notes` when the user wants research, field notes, careful reading, source study, creator dossier, or notebook/desk evidence.
Use `cinematic-contact-sheet` when the user wants filmic, director-review, darkroom, contact-sheet, analog photography, or selected-frame language.
Use `designer-pinboard` when the user wants design-board, moodboard, identity-system, pinned source cards, banner swatches, or studio planning language.
Use `skin-script-body-art` when the user wants tasteful adult body-art, tattoo typography, human canvas, skin script, fashion selfie, bedroom/studio portrait, or X avatar/text integrated as flat temporary tattoo transfers from collarbone downward onto decolletage/upper-chest skin and the opaque camisole edge.
Use `bathroom-mirror-sticky-note` when the user wants humorous bathroom-mirror contrast, morning reminder energy, sticky notes, toothbrush-countertop scenes, fogged mirror atmosphere, or X content appearing as absurd daily life advice.
Use `fridge-door-magnet` when the user wants kitchen humor, fridge magnets, grocery-list energy, family-calendar notes, domestic discovery, or X content appearing as an oddly important household reminder.
Use `elevator-notice-board` when the user wants lobby/elevator/public-building humor, notice-board energy, pinned flyers, laminated bulletins, hallway realism, or X content appearing as a strangely official building announcement.
Use `laundromat-machine-note` when the user wants errand humor, laundromat scenes, washer/dryer notes, detergent props, waiting-room realism, or X content appearing as unexpected reading material during laundry.
Use `takeout-receipt-counter` when the user wants cafe/takeout humor, receipt or order-ticket framing, pickup-counter scenes, coffee-shop realism, or X content appearing as a surprisingly important counter slip.

## Imagegen Guidance

When calling imagegen:

- Use the complete `final-prompt.md` text.
- If the user requested translation, append the agent-generated `Translation Aid` section before imagegen. Do not write that translation back into `card-context.json`.
- Do not force one fixed aspect ratio unless the user explicitly asks. For long text, let both width and height expand into a broad readable poster; avoid narrow extra-tall strips.
- Preserve multilingual source text exactly, including Chinese, English, punctuation, emoji, and `@handle` spelling.
- When translation is requested for post/article content, preserve the original source text as the factual anchor unless the user explicitly asked for translated-only rendering. Profile pages are not translated.
- If local avatar/media paths exist, include the paths. For local avatars, rely on Reference Image A and do not include a verbal avatar appearance description. For local post/article media, include concise observed visual details only when they help preserve attached-media content and layout.
- For local avatars, use avatar-lock language only for identity fidelity: Reference Image A, direct source-bitmap reproduction, no similar-looking substitute, no redrawing, no relighting, no beautifying, no restyling, no expression/angle/crop changes, and no face reinterpretation. The selected prompt module defines where and how the avatar appears.
- If avatar fidelity is uncertain, prefer a smaller, flatter, more bitmap-like avatar instead of asking imagegen to stylize it.
- Require readable typography: crisp strokes, high contrast, no blurry/warped Chinese text, no rain or particles covering source text.
- Ask for a polished cinematic poster, not a plain screenshot.
- If the first image has wrong text, wrong handle, invented numbers, copied reference content, or wrong attached media, regenerate with a stricter prompt that repeats the factual content section and the negative constraints. If the only issue is avatar identity drift, run the Avatar Correction Pass instead.

## Quality Checklist

Before answering the user, confirm:

- `card-context.json` exists and came from the user's X link.
- `final-prompt.md` exists and uses the requested style.
- If translation was requested, the imagegen prompt includes a `Translation Aid` section for post/article sources, or explicitly skips translation for profile sources.
- imagegen was called unless the user requested prompt-only output.
- The generated image is based on the fetched X data, not the reference screenshots.
- If an avatar is rendered, it has been visually checked against Reference Image A; avatar-only failures were handled with the Avatar Correction Pass rather than a full style regeneration.
- Image references came only from `assets/reference-screenshots/`; HTML references came only from `assets/fxbrief-reference/` or `assets/static-reference/`.
