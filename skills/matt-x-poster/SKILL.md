---
name: matt-x-poster
description: Generate imagegen cinematic poster cards from real X/Twitter links using FxEmbed data. Use when Codex needs to turn an X profile, post, or X Article URL into a cinematic social image, especially 3D profile/post posters, creator launch cards, exact X-content visual cards, or prompt-structured X content images.
---

# Matt X Poster

Create cinematic X content posters from real FxEmbed data. The deterministic scripts fetch and normalize profile/post/article data; the prompt modules turn that data into strong imagegen prompts.

Do not depend on a globally installed `fxbrief` CLI at runtime. This skill's Bun scripts call FxEmbed directly.

## Core Workflow

1. Identify the user's X input and desired style. Default style: `profile-portal-3d`.
2. Fetch real X data:

```bash
bun run scripts/x-card-data.ts prepare "<x-url-or-handle>" --out output/matt-x-poster/<slug>
```

Use `prepare` for most requests. It fetches a profile URL as profile-only data, or a status URL as post/article data plus the author's profile.
Use a fresh output slug for each distinct X source/style run. The script gives avatar files unique names, but `card-context.json`, `manifest.json`, and `final-prompt.md` are still the current run's files inside that directory.

3. Compose the imagegen prompt:

```bash
bun run scripts/compose-prompt.ts \
  --context output/matt-x-poster/<slug>/card-context.json \
  --style profile-portal-3d \
  --out output/matt-x-poster/<slug>/final-prompt.md
```

If the user explicitly requests `--style dynamic`, run the Dynamic Style Workflow below before composing, write `output/matt-x-poster/<slug>/dynamic-style.md`, then compose with `--style dynamic`.

If the user explicitly requests `--style film-dynamic`, run the Film Dynamic Workflow below before composing, write `output/matt-x-poster/<slug>/film-dynamic-style.md`, then compose with `--style film-dynamic`.

Fixed style names continue to use files from `prompts/`.

4. If `card-context.json` has `source_type: "article"` and `article.body_text_path`, run the Article Summary Workflow below before imagegen. Append a `Summary` section to the prompt you send to imagegen. Do not run this step for post or profile sources.

5. If the user requested translation, run the agent translation workflow below before imagegen. Do not modify `card-context.json`; append a `Translation Aid` section to the prompt you send to imagegen.

6. If `card-context.json` contains `profile.avatar_local_path` or `assets.profile_avatar_path`, call `view_image` on that exact local file before imagegen. Treat the loaded image as `Input image: current X avatar reference`. This is an operational requirement, not just prompt text.

7. For high-fidelity imagegen work, inspect local avatar/media paths from `card-context.json`, true X app screenshot images from `assets/reference-screenshots/`, and HTML structure references from `assets/fxbrief-reference/` or `assets/static-reference/` before imagegen. Add short, task-specific layout notes when needed. For avatars, use `view_image` to load and confirm the current avatar asset only; do not append verbal face, hair, clothing, pose, lighting, or mood descriptions that could make imagegen reconstruct a similar-looking person. For post/article media, visual observations are allowed because media content often needs layout-specific anchoring.

8. Read `final-prompt.md`, keep its `Required Input Images` section intact, add any required media observations, optional Summary, and optional Translation Aid, then call imagegen with that complete prompt. Do not stop after producing the prompt unless the user explicitly asks for prompt-only output.

9. If `card-context.json` contains `profile.avatar_local_path` or `assets.profile_avatar_path`, and the selected prompt module renders or should render an X author/profile avatar, run the Avatar Finalization Pass below against the generated poster before considering the poster final.

10. Verify the generated image visually against `card-context.json`: exact author name, exact handle, exact post text or article title, faithful avatar identity when an avatar is rendered, and no invented metrics or extra UI facts. If the only failure after finalization is avatar fidelity, retry the Avatar Finalization Pass once with stricter unchanged-region constraints instead of regenerating the whole poster.

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
- `article-body.md`: extracted X Article body text when FxEmbed provides article content blocks. This file is only for the article-only Summary workflow and should not be pasted wholesale into imagegen.
- `dynamic-style.md`: runtime prompt module created only for explicit `--style dynamic` requests.
- `film-dynamic-style.md`: runtime prompt module created only for explicit `--style film-dynamic` requests.
- `media/`: downloaded profile/avatar/banner/post/article image assets when remote image download succeeds. Profile avatar filenames include the handle, source id/profile token, and avatar/source hash so one run cannot silently overwrite another run's avatar asset.
- `manifest.json`: generated paths and source type.
- `final-prompt.md`: composed prompt after running `compose-prompt.ts`.

## Factual Rules

- Use only `card-context.json` for factual content.
- Preserve exact profile name, `@handle`, post text, article title, source URL, and media relationships.
- If the source is an X Article, prioritize the article title, preview text, cover image, author metadata, and the optional `Summary` bullets. Never render the full long-form body in the poster.
- If the post contains media, include the media relationship in the prompt and ask imagegen to render that media as the real post/card media.
- Prefer local media paths from `card-context.json` when present; keep original media URLs as provenance.
- For local avatars, prefer `profile.avatar_asset_id` / `assets.profile_avatar_id` plus `profile.avatar_local_path` / `assets.profile_avatar_path` as the binding pair. The id and file path identify the current avatar asset for this run.
- For profile count rows, use `profile.display_counts.text` exactly; it intentionally follows X's visible profile row order, uses X-style compact K/M notation for counts above 1,000, and should not include a posts count.
- Do not invent comments, replies, endorsements, analytics panels, new metrics, extra badges, new images, or unrelated links.

## Dynamic Style Workflow

Use this workflow only when the user explicitly requests `--style dynamic`. Do not run it for ordinary fixed-style requests.

Dynamic mode creates a runtime prompt module at `output/matt-x-poster/<slug>/dynamic-style.md`, then composes with:

```bash
bun run scripts/compose-prompt.ts \
  --context output/matt-x-poster/<slug>/card-context.json \
  --style dynamic \
  --out output/matt-x-poster/<slug>/final-prompt.md
```

The composer also supports an explicit runtime module path:

```bash
bun run scripts/compose-prompt.ts \
  --context output/matt-x-poster/<slug>/card-context.json \
  --style dynamic \
  --style-file output/matt-x-poster/<slug>/dynamic-style.md \
  --out output/matt-x-poster/<slug>/final-prompt.md
```

Before writing `dynamic-style.md`, read `references/dynamic-style-guide.md`, `card-context.json`, and relevant local media paths. For avatars, inspect only enough to confirm the current avatar asset exists; do not write verbal avatar appearance descriptions.

The dynamic module must be a normal prompt module with these sections:

- `Canvas`
- `Content Rationale`
- `Core Scene`
- `Text And Data Fidelity`
- `Avatar And Media Fidelity`
- `UI Realism`
- `Realistic Lighting And Materials`
- `Composition Variants`
- `Negative Constraints`

Dynamic mode should choose one concrete content-specific visual structure: one environment, one main information surface, one visual metaphor, and one clear text strategy. It should not produce a vague "futuristic poster", abstract gradient, generic ad, or mixed collage.

Keep global responsibilities separate:

- `dynamic-style.md` defines scene, layout, surface, tone, and where source blocks appear.
- `compose-prompt.ts` still injects factual JSON, hard guards, avatar binding, visual reference rules, and final generation requirements.
- Article `Summary` and `Translation Aid` are still appended by the current Codex agent after composition when applicable.

## Film Dynamic Workflow

Use this workflow only when the user explicitly requests `--style film-dynamic`. Do not run it for ordinary fixed-style requests or for plain `--style dynamic`.

Film-dynamic mode creates a runtime prompt module at `output/matt-x-poster/<slug>/film-dynamic-style.md`, then composes with:

```bash
bun run scripts/compose-prompt.ts \
  --context output/matt-x-poster/<slug>/card-context.json \
  --style film-dynamic \
  --out output/matt-x-poster/<slug>/final-prompt.md
```

The composer also supports an explicit runtime module path:

```bash
bun run scripts/compose-prompt.ts \
  --context output/matt-x-poster/<slug>/card-context.json \
  --style film-dynamic \
  --style-file output/matt-x-poster/<slug>/film-dynamic-style.md \
  --out output/matt-x-poster/<slug>/final-prompt.md
```

Before writing `film-dynamic-style.md`, read `references/film-dynamic-style-guide.md`, `references/film-shot-catalog.md`, `card-context.json`, and relevant local media paths. For avatars, inspect only enough to confirm the current avatar asset exists; do not write verbal avatar appearance descriptions.

The film-dynamic module must be a normal prompt module with these sections:

- `Film Lens`
- `Classic Scene Mechanism`
- `Canvas`
- `Content Rationale`
- `Core Scene`
- `X Content Insertion`
- `Characters And Optional Dialogue`
- `Text And Data Fidelity`
- `Avatar And Media Fidelity`
- `Cinematography And Materials`
- `Composition Variants`
- `Negative Constraints`

Film-dynamic mode should choose one primary classic movie scene mechanism from `references/film-shot-catalog.md` and at most one secondary lens for camera, lighting, or material support. It should embed the X content into the key on-screen action or object: torn poster, wall cavity, evidence table, TV broadcast, newspaper page, train window, doorway reveal, box close-up, surveillance wall, courtroom exhibit, or similar. It should not become a film-production/backstage/director-board concept unless the selected catalog scene itself is a famous on-screen filmmaking moment.

Optional characters must be generic scene archetypes only, such as a prison official, juror, detective, clerk, passenger, witness, officer, courier, projectionist, office worker, diner patron, or lone passerby. They must not replace the X author avatar and must not be implied to be the source author unless the X data itself establishes that.

Optional dialogue is limited to one short original cinematic line, 3-8 words, derived from the source mood. It must be clearly non-factual scene text, never a film quote, never attributed to the X author, and never presented as fetched X content. Omit it when the source text is already long or dense.

Keep global responsibilities separate:

- `film-dynamic-style.md` defines film lens, classic scene mechanism, layout, character blocking, optional scene line, X insertion point, tone, and where source blocks appear.
- `compose-prompt.ts` still injects factual JSON, hard guards, avatar binding, visual reference rules, and final generation requirements.
- Article `Summary` and `Translation Aid` are still appended by the current Codex agent after composition when applicable.

## Article Summary Workflow

Use this workflow only when `card-context.json` has `source_type: "article"`. Do not run it for post or profile sources.

When `article.body_text_path` exists:

1. Read the article body text file.
2. Write a `Summary` section with 3-5 short bullets.
3. Default Summary language: match the article body's primary language.
4. If the user explicitly requests a language while invoking the skill, write the Summary bullets in that requested language.
5. Keep each bullet concise and poster-friendly. Summarize only the article body; do not invent claims, metrics, dates, links, comments, endorsements, UI labels, or continuation text.
6. Append the section to the prompt sent to imagegen. Do not write it back into `card-context.json`.

Summary section format:

```md
## Summary

- <short article point>
- <short article point>
- <short article point>
```

Use the Summary as compact secondary article content. The exact article title, preview, author, cover/media, and source relationship remain the factual anchors. Do not paste the full article body into the imagegen prompt and do not ask imagegen to render the full body.

If `source_type` is `article` but `article.body_text_path` is missing, skip Summary and use the article title, preview, cover/media, and author metadata only.

## Current Avatar Asset Lock

When `card-context.json` contains `profile.avatar_local_path` or `assets.profile_avatar_path`, the composed prompt binds that file to a current avatar asset id from `profile.avatar_asset_id` or `assets.profile_avatar_id`.

- Before imagegen, load the avatar file with `view_image` and label it conceptually as `Input image: current X avatar reference`.
- The generated `final-prompt.md` includes a `Required Input Images` section. Follow it exactly; do not treat the local path as sufficient by itself.
- Treat the current avatar asset as an image asset to reproduce, not as a textual portrait idea.
- Use only the current avatar asset for the current profile/author. Ignore avatar references, generated posters, profile images, or avatar assets from earlier generations.
- Treat the rendered avatar circle as a protected flat bitmap island / small circular printed bitmap sticker. Scene lighting, material style, paper/canvas/glass texture, painterly treatment, and cinematic effects may surround it, but they must not alter the avatar interior.
- Do not describe the avatar's face, hair, clothing, pose, lighting, or mood in task-specific prompt notes. Such descriptions encourage imagegen to create a similar-looking avatar instead of preserving the source identity.
- If post/article media contains faces, those faces are attached media only. Never use a face from media references as the circular author/profile avatar.
- The selected prompt module controls avatar placement, scale, crop, and physical surface. The avatar lock controls identity fidelity only.
- If fidelity is hard, prefer a smaller, flatter, cleaner-edged, more obviously pasted bitmap UI sticker over an enlarged or stylized avatar.
- Do not add case-specific avatar fixes for one user, one handle, one gender, one pose, or one source image. The rule is asset-based and applies to every local avatar.

## Current Avatar Input Image Workflow

Use this workflow whenever `profile.avatar_local_path` or `assets.profile_avatar_path` exists:

1. Resolve the current avatar path from `card-context.json`.
2. Call `view_image` on that local path before calling imagegen.
3. Treat the loaded image as `Input image: current X avatar reference`.
4. In any extra prompt notes you append after `final-prompt.md`, refer to the loaded avatar only by that label. Do not describe the avatar's visual traits.
5. If several local images are loaded, keep roles separate: the avatar image is only the circular X author/profile avatar; post media and article media are content panels, never avatar substitutes.

## Avatar Finalization Pass

Compatibility alias: `Avatar Correction Pass` means retrying this same avatar-only finalization edit after visual inspection finds avatar drift.

Run this after every initial imagegen output when `profile.avatar_local_path` or `assets.profile_avatar_path` exists and the selected prompt module renders or should render an X author/profile avatar.

This is a narrow image-editing pass, not a full regeneration. Use the generated poster as the base image and the already loaded local avatar file as `Input image: current X avatar reference`. The pass exists even if the first avatar looks plausible, because initial scene generation often restyles, humanizes, or borrows avatar identity from post media.

Finalization prompt pattern:

```md
Only edit the circular avatar area that represents the X author/profile avatar.

Replace that avatar with a faithful direct visual reproduction of the current avatar asset:
<local avatar path>

Use the loaded input image labeled `current X avatar reference` as the visual source for the replacement.

Keep every other part of the image unchanged: all text, cards, media thumbnails, layout, board/material texture, lighting, shadows, crop, colors, and composition.

Do not create a similar-looking person. Do not redraw, beautify, relight, stylize, change expression, change face angle, change crop, replace the subject, or alter the avatar background. The avatar should look like the same current source bitmap placed into the existing avatar circle.

If exact fidelity is difficult, make the avatar smaller, flatter, cleaner-edged, and more obviously pasted as a bitmap UI sticker. Do not use any face from attached post/article media as the avatar.
```

Use this pass only for avatar fidelity. If source text, handle, media, metrics, or layout facts are wrong, regenerate the whole poster with stricter factual constraints instead.

If the finalization pass changes any non-avatar region, discard that edit and retry once with stricter wording:

```md
This is an avatar-only edit. Preserve the entire poster pixel-for-pixel except the single circular author/profile avatar. Do not alter text, typography, composition, media, sail/flag/paper/material texture, lighting, shadows, crop, background, or colors.
```

If the retry still changes non-avatar content, keep the best unchanged-region version and tell the user the avatar could not be safely finalized.

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
- `prompts/creator-signal-stage.md`: realistic creator launch poster. A real keynote/studio/cafe display, printed board, or workspace surface presents the creator profile, post, or article as a grounded visual scene.
- `prompts/seaside-plein-air-wave.md`: hyperreal coastal plein-air scene. A side-profile painter has just finished a crisp X source card on an easel while a distant giant wave echoes the same content as poetic water-shadow geometry.
- `prompts/sunlit-sail-signal.md`: hyperreal sunny ocean sailing poster. A sailboat moves across bright water while the X profile/post/article content is printed on readable sailcloth as a maritime signal.
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
- `prompts/grand-opera-chorus.md`: dramatic high-culture comedy poster. X content becomes a solemn opera-house libretto, supertitle, stage placard, or gala-program source card performed by a formal chorus and conductor.
- `prompts/lunar-flag-signal.md`: hyperreal lunar EVA poster. An astronaut stands on the Moon beside a planted flag, and the X profile/post/article content is printed on the flag cloth as a readable mission signal.

Future modules should follow `references/prompt-module-guide.md` and stay in `prompts/`.

Use `seaside-plein-air-wave` when the user wants a hyperreal beach, ocean, painter, easel, plein-air painting, huge wave, blue sky, natural coastal atmosphere, or poetic wave-shadow echo of X content while the exact readable source card stays on the canvas.
Use `sunlit-sail-signal` when the user wants a very realistic sunny ocean, sailboat, yacht/sloop/dinghy, blue water, bright sky, sailcloth, nautical signal, 20-45 degree waterline/chase-boat camera angle, or X content printed on the sail rather than on a flag, wall, paper, or screen.
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
Use `grand-opera-chorus` when the user wants dramatic high-culture absurdity, opera-house formality, chorus/conductor staging, collective call-and-response humor, solemn supertitles, libretto/program treatment, or a casual X post elevated into a ceremonial stage performance.
Use `lunar-flag-signal` when the user wants a hyperreal moon, lunar surface, astronaut, space/NASA-photo-inspired realism, planted flag, or X content printed on a flag as a mission signal.
Use `film-dynamic` only when the user explicitly asks for `--style film-dynamic` or a classic-cinema dynamic mode. It is a runtime style, not a fixed prompt module: choose a primary classic movie scene mechanism from `references/film-shot-catalog.md`, write `film-dynamic-style.md`, and embed the X content into the scene's key object, reveal, screen, paper, wall, doorway, table, or prop.

## Imagegen Guidance

When calling imagegen:

- Use the complete `final-prompt.md` text.
- For `--style dynamic`, confirm `dynamic-style.md` exists and the final prompt shows `## Selected Prompt Structure: dynamic`.
- For `--style film-dynamic`, confirm `film-dynamic-style.md` exists, follows `references/film-dynamic-style-guide.md`, selects a primary catalog scene mechanism from `references/film-shot-catalog.md`, and the final prompt shows `## Selected Prompt Structure: film-dynamic`.
- For `film-dynamic`, use a classic movie scene mechanism: a concrete on-screen action or reveal that contains the X content. Do not ask imagegen to stage a generic film set, director board, camera crew, rehearsal, or backstage production scene unless the selected catalog scene itself requires it. Do not recreate exact film frames, actor likenesses, protected characters, famous quotes, studio marks, ratings, awards, or fictional institutions. Optional scene dialogue is limited to one short original non-factual line and must stay separate from the X source card.
- For X Article sources with `article.body_text_path`, append the article-only `Summary` section before imagegen. Use 3-5 short bullets, matching the article body's language by default or the user's requested language when explicit.
- If the user requested translation, append the agent-generated `Translation Aid` section before imagegen. Do not write that translation back into `card-context.json`.
- Do not force one fixed aspect ratio unless the user explicitly asks. For long text, let both width and height expand into a broad readable poster; avoid narrow extra-tall strips.
- Preserve multilingual source text exactly, including Chinese, English, punctuation, emoji, and `@handle` spelling.
- Do not include full X Article body text in the imagegen prompt. Use title, preview, cover/media, author metadata, and Summary bullets instead.
- When translation is requested for post/article content, preserve the original source text as the factual anchor unless the user explicitly asked for translated-only rendering. Profile pages are not translated.
- If local avatar/media paths exist, include the paths. For local avatars, rely on the current avatar asset id/file from `card-context.json` and do not include a verbal avatar appearance description. For local post/article media, include concise observed visual details only when they help preserve attached-media content and layout.
- For local avatars, use avatar-lock language only for identity fidelity: current avatar asset id/file, direct source-bitmap reproduction, protected flat bitmap island, small circular printed bitmap sticker, no similar-looking substitute, no redrawing, no relighting, no beautifying, no restyling, no expression/angle/crop changes, no face reinterpretation, and no borrowing faces from attached media. The selected prompt module defines where and how the avatar appears.
- If avatar fidelity is uncertain, prefer a smaller, flatter, cleaner-edged, more obviously pasted bitmap UI sticker instead of asking imagegen to stylize it.
- Require readable typography: crisp strokes, high contrast, no blurry/warped Chinese text, no rain or particles covering source text.
- Ask for a polished cinematic poster, not a plain screenshot.
- If the first image has wrong text, wrong handle, invented numbers, copied reference content, or wrong attached media, regenerate with a stricter prompt that repeats the factual content section and the negative constraints. If the only issue is avatar identity drift, run or retry the Avatar Finalization Pass instead.

## Quality Checklist

Before answering the user, confirm:

- `card-context.json` exists and came from the user's X link.
- `final-prompt.md` exists and uses the requested style.
- If the requested style was `dynamic`, `dynamic-style.md` exists, follows `references/dynamic-style-guide.md`, and is content-specific rather than a generic style shell.
- If the requested style was `film-dynamic`, `film-dynamic-style.md` exists, follows `references/film-dynamic-style-guide.md`, selects a catalog scene mechanism from `references/film-shot-catalog.md`, embeds X content into the scene's key object/action, and avoids film-production/backstage concepts, exact film frames, actor likenesses, and protected character identity.
- For X Article sources, if `article.body_text_path` exists, the imagegen prompt includes a `Summary` section with 3-5 short bullets and does not include the full article body.
- If translation was requested, the imagegen prompt includes a `Translation Aid` section for post/article sources, or explicitly skips translation for profile sources.
- imagegen was called unless the user requested prompt-only output.
- If a local avatar exists and an X author/profile avatar is rendered or expected, the Avatar Finalization Pass was run before final delivery.
- The generated image is based on the fetched X data, not the reference screenshots.
- If an avatar is rendered, it has been visually checked against the current avatar asset; avatar-only failures were handled with the Avatar Finalization Pass rather than a full style regeneration.
- Image references came only from `assets/reference-screenshots/`; HTML references came only from `assets/fxbrief-reference/` or `assets/static-reference/`.
