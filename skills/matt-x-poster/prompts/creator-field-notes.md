# Creator Field Notes

Turn an X profile, post, or article into a creator research desk: printed X cards, handwritten field notes, sticky tabs, source clippings, notebook pages, and a quiet sense that someone is carefully studying the creator.

This structure is for intimate, lived-in, investigative creator posters. It should feel like a real photographed working desk with evidence and notes, not a launch stage, flat screenshot, moodboard collage, or chaotic detective wall.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a landscape, near-square, or 4:5 overhead or three-quarter desk photograph with room for the main X source card and supporting note fragments.
- Use a photorealistic editorial desk look: real paper, pen marks, soft shadows, tactile stationery, imperfect alignment, and natural camera depth.
- Use a thoughtful palette: ivory paper, graphite, muted yellow sticky notes, black ink, warm desk light, X blue accents, and one color derived from the avatar, banner, or media.
- Keep the main X source card crisp and clean. Handwritten notes can be atmospheric, but source facts must be readable.

## Desk And Note Environment

- Build one believable research desk:
  - printed X profile/post/article card as the main source sheet;
  - notebook spread, index cards, sticky notes, paper clips, tabs, pencil, pen, binder clip, small ruler, coffee cup, laptop edge, or phone edge;
  - margin marks, arrows, underlines, source labels, and small non-factual symbols used as layout texture;
  - warm desk lamp or soft window light with gentle shadows;
  - optional profile banner color as a small clipped image, color swatch, or reflection.
- The notes should imply attention and analysis without inventing claims. Use generic labels such as "source", "profile", "quote", "media", or exact source URL when present.
- Avoid red string boards, conspiracy aesthetics, excessive clutter, fake analysis metrics, or invented conclusions.

## Core Scene

1. The main focal object is a clean printed X source card on the desk, either placed on top of a notebook, clipped to a folder, or laid beside handwritten notes.
2. Supporting papers can point toward the source card with arrows, tabs, margin marks, and underlines, but they must not cover important source facts.
3. If `source_type` is `profile`, the desk contains a creator profile source sheet:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when present,
   - exact `profile.display_counts.text` in order,
   - strict flat bitmap avatar reference,
   - optional banner strip as a clipped reference image or page header.
4. If `source_type` is `post`, the desk contains a post field-note sheet:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text,
   - source URL when useful,
   - quote block when `post.quote` exists, using only quote facts from `card-context.json`,
   - attached media panel when local or remote post media exists.
5. If `source_type` is `article`, the desk contains an article research sheet:
   - exact article title,
   - exact preview text when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media panel when present.
6. Secondary note cards may repeat exact short factual fragments from the JSON, such as the exact handle, exact URL, or exact profile count strings. Do not create new facts.
7. Use the desk composition to make the X content feel studied, selected, and valuable.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- Do not summarize, rewrite, translate, shorten, or embellish source text unless the user explicitly asked for a summary poster.
- For profile counts, use `profile.display_counts.text` exactly and in order. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Handwritten marks and notes may be decorative, but they must not replace or contradict the exact source text.
- Keep the main X card typography crisp, dark, and readable. Do not let pen marks, coffee rings, paper clips, shadows, or shallow focus obscure facts.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The avatar should look like a direct source-avatar bitmap reproduction printed on the source card inside a circular X avatar mask, not a sketched portrait in the notebook. It may read as a small printed photo sticker only because it is physically printed, not because it has been redrawn.
- Preserve the exact subject type, face shape, eye shape, hair silhouette, pose, crop, accessories, held objects or visible text, color treatment, photo/illustration style, line quality, and background mood from the avatar file.
- Do not reinterpret the avatar to match the desk lighting. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Do not render the avatar as a hand drawing, newly drawn sticker illustration, stamp, 3D badge, glass coin, hologram, painted portrait, or enlarged hero face.
- Notebook paper grain, pen marks, sticky tabs, coffee shadows, clips, and desk light may sit around the avatar card, but they must not cover, recolor, blur, or alter the avatar interior.
- If fidelity is uncertain, keep the avatar smaller, flatter, front-facing, and printed cleanly on the main source card.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as printed clippings, pinned screenshots, source photos, or small media blocks on the desk.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI structure through the printed source card, while the desk, notes, and stationery create a human research workflow around it.
- It should look like a real field-notes photograph, not a screenshot collage or a flat design mockup.

## Realistic Lighting And Materials

- Use warm, grounded desk lighting: side-window daylight, practical lamp glow, soft paper shadows, and realistic contact shadows under each object.
- Use real material cues: paper fibers, ink strokes, sticky note adhesive edges, metal clip highlights, graphite marks, notebook texture, and matte card stock.
- Keep highlights, shadows, pen strokes, tabs, and props away from source text, avatar faces, and important media.
- Use shallow depth of field carefully: background notes may soften, but the main X card must remain sharp.

## Composition Variants

- Overhead research variant: source card centered on a notebook with sticky notes around it.
- Three-quarter desk variant: source card at a slight angle with warm lamp, pen, and paper stack.
- Profile study variant: avatar/name/handle as the main source card, bio and counts as exact underlined fields.
- Post evidence variant: exact post text printed large, with quote/media as side clippings.
- Article research variant: article title and preview printed on a proof sheet with media clipped beside it.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake research claims, fake annotations, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, sketch, sticker, icon, stamped face, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No conspiracy board, red-string visual logic, chaotic clutter, fake charts, fake trend graphs, fake scorecards, or invented categorization.
- No holographic panels, translucent sci-fi cards, impossible floating screens, glass shards, abstract signal beams, full-screen particles, or random neon symbols.
- No coffee stains, pen marks, sticky notes, paper clips, hands, shadows, glare, or depth-of-field blur covering source text, avatar faces, or important attached-media content.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, or unreadable typography.
