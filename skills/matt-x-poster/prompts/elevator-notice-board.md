# Elevator Notice Board

Turn an X profile, post, or article into a humorous photorealistic elevator-lobby notice-board poster: the X content appears as a taped notice, cork-board flyer, building bulletin, or tiny laminated card beside ordinary apartment or office announcements. The joke is that the content has become so unavoidable it is now part of the building's daily notices.

This structure is for public-place comedy, candid realism, and "found in the wild" promotion. It should feel like someone noticed the X source while waiting for the elevator, not like a formal ad campaign or a flat screenshot.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a vertical 4:5, 3:4, or near-square poster that captures the notice board, elevator edge, and readable source card.
- If source text is long, expand both width and height into a broad board or lobby wall. Do not make a narrow extra-tall strip.
- Use photorealistic lobby lighting: fluorescent ceiling light, brushed metal elevator doors, cork or felt board, acrylic cover, tape edges, pushpins, slight wall scuffs, and subtle floor reflections.
- Palette should be clean and grounded: brushed metal, beige or gray wall, cork brown or dark felt, white paper, X blue accents, and one accent color from the avatar, banner, or attached media.
- The scene should feel quietly funny through serious public-notice treatment. Avoid cartoon signage, meme fonts, exaggerated comedy props, CGI plastic surfaces, and impossible floating UI.

## Humor Engine

- Treat the X source as an absurdly official building notice: a creator profile becomes a lobby bulletin, a post becomes the thing everyone sees while waiting, or an article title becomes a laminated announcement.
- Surround it with generic non-factual notices such as blank schedules, maintenance shapes, small arrows, or simple unlabeled papers. These props must not create fake claims about the X source.
- The comedy should be observational: an ordinary hallway gives the X content too much ceremonial importance.
- Do not add invented jokes, reactions, comments, endorsements, building warnings, or fake QR claims.

## Core Scene

1. The main focal object is a real elevator lobby or hallway wall with a notice board:
   - cork board with pushpins,
   - felt board behind acrylic,
   - taped flyer beside elevator buttons,
   - laminated source card near a mailroom wall,
   - or a clean building bulletin frame.
2. The X content must be physically present as paper, laminated print, or pinned card. Show pushpin pressure, tape transparency, acrylic glare, paper curl, contact shadows, and slight hallway perspective.
3. If `source_type` is `profile`, the notice contains:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when short enough,
   - exact `profile.display_counts.text` in order when space allows,
   - strict flat bitmap avatar reference,
   - optional banner color strip as a board header or flyer accent.
4. If `source_type` is `post`, the notice contains:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text when short enough,
   - exact leading post excerpt when the post is too long,
   - quote facts only when `post.quote` exists and only from `card-context.json`,
   - attached media only as a small printed thumbnail, taped photo, or secondary bulletin card if local media exists.
5. If `source_type` is `article`, the notice contains:
   - exact article title,
   - exact preview excerpt when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media as a small printed clipping if present.
6. Include subtle elevator context: elevator call button, brushed door seam, floor indicator glow, hallway corner, mailboxes, or a soft reflection in metal. These elements must stay secondary.
7. The X source card is the sharpest readable object. Other notices may be blurred, generic, cropped, or blank to avoid fake facts.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON when visible.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- If source text is long, show a clean exact leading excerpt on the main notice and move secondary exact facts to a smaller pinned card. Do not invent continuation text, summaries, commentary, warnings, or official wording.
- For profile counts, use `profile.display_counts.text` exactly and in order. Counts above 1,000 should already include K/M compact notation. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Make the main source text crisp, high-contrast, and readable as printed ink on paper or laminated stock. Acrylic glare, pushpins, tape, hallway reflections, and board texture must not obscure exact source text.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The avatar should look like a direct source-avatar bitmap reproduction printed on the notice card, inside a clean circular X avatar mask.
- Match Reference Image A directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- Do not reinterpret the avatar to match lobby lighting. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Acrylic glare, paper fibers, pushpin shadows, tape shine, and hallway depth may affect the card surface around the avatar, but must not cover, recolor, blur, warp, relight, or distort the avatar interior.
- Do not render the avatar as a building icon, warning symbol, hand drawing, sticker illustration, 3D badge, hologram, painted portrait, or enlarged hero face.
- If avatar fidelity is uncertain, keep the avatar smaller, flatter, front-facing, cleaner-edged, and closer to the original bitmap crop.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as small printed thumbnails or pinned clippings. Keep visible media recognizable and do not invent new media.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI DNA through a compact author row, circular avatar, handle line, rounded card geometry, and clear source-card spacing, but the card must be a real pinned or taped notice.
- Avoid making the image look like a digital ad screen unless the user explicitly asks. The default is physical paper on a real notice board.

## Composition Variants

- Elevator-wait variant: the source card is pinned beside the elevator call button, with the button glow and brushed metal door in the edge of frame.
- Acrylic-board variant: the exact X content sits behind a slightly reflective locked notice case, still crisp and readable.
- Cork-board variant: the profile card is pushpinned among generic blurred papers, feeling strangely official.
- Mailroom variant: the article title appears on a laminated card near mailboxes, like an oddly prestigious announcement.
- Late-night-lobby variant: the hallway is quiet and slightly cinematic, and the X source card is the one bright readable notice.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake building announcements, fake QR claims, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, warning icon, building sign, unrelated icon, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No holographic panels, translucent sci-fi cards, impossible floating UI, neon particles, signal beams, or random digital noise.
- No unsafe emergency notices, threats, panic scenes, surveillance paranoia, or humiliating public shaming.
- No blurry, warped, melted, low-contrast, over-reflective, glare-smeared, or unreadable typography.
- No pushpins, tape, acrylic glare, elevator buttons, hands, notice edges, wall fixtures, or hallway reflections covering source text, avatar faces, profile counts, article title, or important attached-media content.
