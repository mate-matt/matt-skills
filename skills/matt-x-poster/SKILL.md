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

5. For high-fidelity imagegen work, inspect local avatar/media paths from `card-context.json`, true X app screenshot images from `assets/reference-screenshots/`, and HTML structure references from `assets/fxbrief-reference/` or `assets/static-reference/` before imagegen. Add short, task-specific layout notes when needed. When local avatar or post media exists, visually inspect it first and add concise observed visual details to the imagegen prompt, because paths alone may not lock the generated image tightly enough. For important avatars, preserve the avatar as a flat direct reproduction of the local image rather than a portrait to redraw or restyle; the selected prompt module defines where it appears.

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
- Do not force one fixed aspect ratio unless the user explicitly asks. For long text, let both width and height expand into a broad readable poster; avoid narrow extra-tall strips.
- Preserve multilingual source text exactly, including Chinese, English, punctuation, emoji, and `@handle` spelling.
- If local avatar/media paths exist, include both the paths and a short visual description observed from those files, such as subject type, pose, accessories, visible text, color treatment, and key media layout.
- For local avatars, use avatar-lock language only for visual fidelity: strict local avatar source, same crop/subject/face/pose/style/background, no redrawing, relighting, beautifying, restyling, age/expression/pose changes, or face reinterpretation. The selected prompt module defines where and how the avatar appears.
- If avatar fidelity is uncertain, prefer a smaller, flatter, more direct reproduction instead of asking imagegen to stylize it.
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
