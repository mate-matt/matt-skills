# Designer Pinboard

Turn an X profile, post, or article into a designer's inspiration pinboard: printed source cards, banner color swatches, pinned media, layout notes, yarn-free connectors, and tactile studio materials.

This structure is for creator identity mapping, brand research, and visual planning posters. It should feel like a real design studio wall or cork board, not a launch stage, flat collage, crime board, or generic moodboard with invented content.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a landscape, near-square, or 4:5 studio-wall poster with room for the main X card, pinned support pieces, and readable profile facts.
- Use a photorealistic design-studio look: cork, fabric board, push pins, paper tabs, printed cards, color chips, tape, shadows, and slight paper curl.
- Use a balanced palette: cork tan or neutral fabric, black ink, off-white card stock, X blue accents, warm studio light, and colors sampled from the avatar, banner, or media.
- The pinboard can be rich, but it must be orderly. Important source text should sit on clean cards, not on textured background.

## Board And Studio Environment

- Build one believable designer pinboard:
  - cork board, fabric tack board, magnetic design wall, foam-core panel, or studio rail board;
  - main X source card pinned centrally or slightly off-center;
  - small pinned cards for banner colors, exact handle, exact URL, media thumbnails, profile count chips, and source labels;
  - push pins, washi tape, binder clips, transparent sleeves, ruler edge, pencil, swatches, and layout grid marks;
  - warm studio daylight, soft desk lamp, or overhead track light.
- Use thin lines, tape strips, or layout arrows for organization. Avoid red-string investigation aesthetics.
- If a profile banner exists, use it as a contained strip, thumbnail, or color palette source. Do not turn it into an invented full-wall background.

## Core Scene

1. The main focal object is a printed X source card pinned to the board, with visible pin shadows and paper thickness.
2. Arrange secondary cards around it in a clean visual system: color swatches, media thumbnails, exact count chips, exact URL label, or quote/media side card.
3. If `source_type` is `profile`, the board centers on a creator profile card:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when present,
   - exact `profile.display_counts.text` in order,
   - strict flat bitmap avatar reference,
   - optional banner strip as a pinned header or color source.
4. If `source_type` is `post`, the board centers on a post source card:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text,
   - source URL when useful,
   - quote block when `post.quote` exists, using only quote facts from `card-context.json`,
   - attached media panel when local or remote post media exists.
5. If `source_type` is `article`, the board centers on an article source card:
   - exact article title,
   - exact preview text when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media panel when present.
6. Supporting swatches and layout notes may be non-factual visual elements, but any text that looks factual must come from `card-context.json`.
7. The board should reveal the creator as a designed identity system, with the X card as the authoritative source.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- Do not summarize, rewrite, translate, shorten, or embellish source text unless the user explicitly asked for a summary poster.
- For profile counts, use `profile.display_counts.text` exactly and in order. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Make the main X card typography crisp, dark, and readable. Pins, tape, swatches, shadows, and overlapping cards must not cover source facts.
- If the source text is long, use a larger central card or two aligned source cards instead of shrinking text into a dense block.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The avatar should look like a direct source-avatar bitmap reproduction printed on the pinned X card, inside a clean circular X avatar mask. It may feel like a physical photo sticker only because it is printed, not because it has been redrawn.
- Preserve the exact subject type, face shape, eye shape, hair silhouette, pose, crop, accessories, held objects or visible text, color treatment, photo/illustration style, line quality, and background mood from the avatar file.
- Do not reinterpret the avatar to match pinboard lighting. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Do not render the avatar as a newly drawn sticker illustration, mascot, sketch, 3D badge, glass coin, hologram, painted portrait, cutout face, or enlarged hero face.
- Cork texture, tape shadows, pin shadows, paper grain, swatch overlap, and studio glare may surround the avatar, but they must not cover or alter the avatar interior.
- If fidelity is uncertain, keep the avatar smaller, flatter, front-facing, and printed cleanly on the main source card.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as pinned thumbnails, contact cards, printed image strips, or media panels attached to the board.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI hierarchy through the pinned source card while the surrounding pinboard behaves like a real physical design board.
- Avoid a generic digital moodboard. Show pins, paper thickness, shadows, board texture, and real studio depth.

## Realistic Lighting And Materials

- Use believable studio lighting: soft side daylight, overhead design-room light, or warm desk lamp with gentle object shadows.
- Use real material cues: cork granules, woven fabric board, matte card stock, tape translucency, pin heads, binder clips, swatch paper, paper curl, and subtle dust only in the board texture.
- Keep tape, pins, clips, swatches, connector lines, and shadows away from source text, avatar faces, and important media.
- Use depth of field lightly. The central source card and nearby factual support cards must stay sharp.

## Composition Variants

- Clean identity board variant: profile card centered, banner strip above, counts as pinned chips, color swatches to the side.
- Studio wall variant: wider board with source card, media thumbnails, and exact URL label arranged on a grid.
- Post layout board variant: exact post text as the central card, quote/media as neighboring pinned cards.
- Article planning board variant: title and preview as the main article source card, cover image pinned beside it.
- Minimal pinboard variant: one strong source card with a few swatches and two support notes, high readability.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake design claims, fake brand values, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, sticker, sketch, mascot, icon, cutout face, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No red-string boards, chaotic investigation walls, fake trend charts, fake scorecards, fake audience segments, or invented analysis notes.
- No holographic panels, translucent sci-fi cards, impossible floating screens, glass shards, abstract signal beams, full-screen particles, or random neon symbols.
- No pins, tape, clips, swatches, shadows, glare, or overlapping cards covering source text, avatar faces, or important attached-media content.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, or unreadable typography.
