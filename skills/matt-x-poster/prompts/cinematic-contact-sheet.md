# Cinematic Contact Sheet

Turn an X profile, post, or article into a cinematic photography contact sheet: darkroom paper, film-strip frames, grease-pencil marks, editorial selects, and the X content arranged as a photographed sequence of source frames.

This structure is for filmic creator posters, post showcases, and article evidence boards. It should feel like a real photographer or director reviewing contact prints, not a flat grid, screenshot wall, fake app dashboard, or glossy sci-fi display.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a landscape, near-square, or 4:5 contact-sheet poster with a strong central source frame and smaller surrounding frames.
- Use a photorealistic analog photography look: black borders, film rebate texture, glossy or satin contact paper, red grease-pencil circles, loupe shadow, light table glow, and believable paper reflections.
- Use a cinematic palette: deep black, warm darkroom amber, soft white paper, muted red annotation marks, X blue accents, and one subtle color derived from the avatar, banner, or media.
- The main X source frame must be clean and readable. Film texture and darkroom marks should decorate the margins, not damage the facts.

## Darkroom And Review Environment

- Build one believable contact-sheet setting:
  - contact print on a light table, darkroom desk, editor's table, or director's review board;
  - film strips, loupe, wax pencil, clip, notebook edge, negative sleeve, or archival envelope;
  - red or white grease-pencil circles, frame numbers, crop marks, and small non-factual review marks;
  - soft overhead review light, low darkroom ambient light, and realistic glossy-paper reflections.
- The profile banner or media may become one or two small film frames if available, but it must remain contained and sourced from JSON media.
- Avoid fake camera metadata, fake dates, fake shot numbers tied to real facts, or invented editorial comments.

## Core Scene

1. The main focal object is a physical contact sheet or light-table print containing multiple frames.
2. One largest selected frame contains the main X source card. Smaller frames can contain exact media panels, banner strip, profile detail crop, quote card, or decorative non-factual film texture.
3. If `source_type` is `profile`, the selected frame is a creator identity contact frame:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when present,
   - exact `profile.display_counts.text` in order,
   - strict flat bitmap avatar reference,
   - optional banner strip as a small film frame or frame header.
4. If `source_type` is `post`, the selected frame is a post contact frame:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text,
   - source URL when useful,
   - quote block when `post.quote` exists, using only quote facts from `card-context.json`,
   - attached media panel when local or remote post media exists.
5. If `source_type` is `article`, the selected frame is an article contact frame:
   - exact article title,
   - exact preview text when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media panel when present.
6. Use red grease-pencil or crop marks to indicate the selected source frame, but do not cover the avatar, name, handle, source text, counts, or media.
7. The contact sheet can include visual rhythm through repeated frames, but only the JSON-derived frames should contain factual X content.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- Do not summarize, rewrite, translate, shorten, or embellish source text unless the user explicitly asked for a summary poster.
- For profile counts, use `profile.display_counts.text` exactly and in order. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Keep source text crisp and readable inside the selected frame. Film grain, frame borders, grease-pencil marks, loupe reflections, and light-table glow must not obscure text.
- If the source text is long, use a large selected frame plus one continuation frame, preserving exact order and avoiding invented continuation copy.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The avatar should look like a direct source-avatar bitmap reproduction inside the X card within the selected contact frame, with at most a circular UI mask. It remains an X UI avatar image, not a new film portrait or actor sample.
- Preserve the exact subject type, face shape, eye shape, hair silhouette, pose, crop, accessories, held objects or visible text, color treatment, photo/illustration style, line quality, and background mood from the avatar file.
- Do not reinterpret the avatar as a photographed actor, film still, headshot, hand-colored print, or darkroom portrait.
- Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Do not render the avatar as a 3D object, glass coin, hologram, sculpture, painted portrait, enlarged hero face, or analog portrait remake.
- Film grain, contact-sheet emulsion, loupe glare, red grease-pencil marks, scratches, light-table bloom, and frame borders may appear around the selected frame, but they must not cover, recolor, blur, or remake the avatar interior.
- If fidelity is uncertain, keep the avatar smaller, flatter, front-facing, and printed cleanly inside the selected source frame.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as additional contact frames or media panels within the selected X card.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI structure inside the selected contact frame while the overall image feels like analog film review.
- Do not make the layout a generic app grid. The physical contact sheet, paper edges, light table, and annotation marks must be visible.

## Realistic Lighting And Materials

- Use believable darkroom or review-table lighting: soft light-table glow, warm overhead lamp, deep edge falloff, and controlled reflections on satin paper.
- Use real material cues: film strip sprocket holes, black frame borders, contact print emulsion, pencil wax texture, loupe glass edge, paper curl, negative sleeve translucency, and dust only in margins.
- Keep reflections, grease-pencil marks, frame borders, loupe shadow, and shallow focus away from the source text, avatar face, profile counts, and important media.
- The selected source frame should be in the sharpest focus.

## Composition Variants

- Light-table variant: contact sheet lies flat on a glowing review table, selected frame circled.
- Director desk variant: contact sheet beside pencil, notebook, and negative sleeve, warm cinematic light.
- Profile reel variant: avatar/profile card in the hero frame, banner or media as smaller frames.
- Post select variant: exact post text as the selected frame, attached media in adjacent frames.
- Article proof variant: article title and preview as a selected editorial frame, cover image as a neighboring contact frame.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake camera metadata, fake frame numbers with factual meaning, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, actor still, analog headshot, illustration, icon, or loosely inspired film frame.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No holographic panels, translucent sci-fi UI, impossible floating screens, glass shards, abstract signal beams, full-screen particles, random neon symbols, or fake futuristic review boards.
- No heavy film grain, scratches, red marks, loupe glare, frame borders, or light-table bloom covering source text, avatar faces, or important attached-media content.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, or unreadable typography.
