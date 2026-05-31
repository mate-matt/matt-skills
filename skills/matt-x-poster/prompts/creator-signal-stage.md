# Creator Signal Stage

Turn an X profile, post, or article into a realistic creator launch poster. The image should feel like a premium editorial photograph of a real creator showcase, small keynote setup, studio desk, cafe event corner, or venue display.

This structure is not a literal X screenshot and not a phone-portal scene. It is a grounded staged announcement: a real environment, physical screens or printed display boards, a faithful creator identity badge, and optional evidence/media panels. Prioritize realism, everyday texture, and believable lighting over futuristic effects.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- For profile pages, short posts, product launches, and quote posts, prefer a landscape, near-square, or 4:5 hero poster with generous negative space.
- For long posts or articles, expand both width and height into a broad editorial stage. Use two or three readable content panels instead of making a narrow tall strip.
- Use a high-resolution photorealistic commercial photography look: real materials, clean typography, controlled reflections, realistic camera depth, and natural venue lighting.
- Use a restrained palette anchored by deep graphite, soft black, clean white, X blue, warm practical light, and one accent color derived from the creator avatar, banner, or attached media.
- Avoid liquid-glass styling, holographic UI, translucent sci-fi cards, and impossible floating interfaces.

## Stage Environment

- Build one concrete, photorealistic environment with everyday life and real event details:
  - black-box product keynote stage with fabric curtains, floor marks, monitor stands, and soft spotlights,
  - quiet creator studio with a desk, laptop, wall-mounted screen, books, mic, cables, and warm lamp light,
  - cafe or bookstore event corner with a small screen, stools, table cards, and audience chairs out of focus,
  - office meeting room with a large display, whiteboard, notebooks, and practical overhead lighting,
  - museum-like exhibit room with printed placards, framed screens, matte walls, and controlled gallery lighting,
  - coastal or window-side launch table when the profile banner suggests an outdoor mood.
- Keep the environment clean, believable, spacious, and lived-in. Use real floors, walls, screens, tables, posters, paper, fabric, metal, wood, cables, chairs, lamps, and architectural depth.
- Do not use a noisy abstract background, full-screen particles, random bokeh fields, decorative clutter, or generic sci-fi scenery.
- The creator's profile banner may influence lighting, color, or a small contained screen/printed strip, but it must not become the full poster background unless it is explicitly the only intended subject.

## Core Scene

1. Place a central hero presentation object in the main focal area: a wall-mounted LED screen, tabletop monitor, printed foam-board poster, freestanding display board, framed lightbox, tablet, or realistic stage screen. Every display should feel physically supported by a wall, stand, table, frame, cable, or stage rig.
2. If `source_type` is `profile`, the central display is a creator identity launch card:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when present,
   - exact `profile.display_counts.text` in order,
   - strict flat bitmap avatar reference,
   - optional small banner strip inside the card, printed poster header, or screen header.
3. If `source_type` is `post`, the central display is a content launch card:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text,
   - quote block when `post.quote` exists, using only quote facts from `card-context.json`,
   - attached media panel when local or remote post media exists.
4. If `source_type` is `article`, the central display is an article launch card:
   - exact article title,
   - exact preview text when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media panel when present.
5. Arrange secondary details as physical stage or workspace elements:
   - small side panels for profile bio, media, quote, or provenance;
   - paper cards, printed placards, sticky notes, table tents, monitor sidebars, or framed small screens when helpful;
   - a lower nameplate with source URL if it improves credibility;
   - subtle X-inspired rounded card geometry and spacing, without copying reference screenshot content.
6. Use realistic stage lighting, screen glow, shadows, floor/table reflections, and natural camera perspective to connect the creator identity to the content. Any visible light should come from believable fixtures, windows, screens, or practical lamps.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON.
- Do not summarize, rewrite, translate, shorten, or embellish source text unless the user explicitly asked for a summary poster.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- For profile counts, use `profile.display_counts.text` exactly and in order. Counts above 1,000 should already include K/M compact notation. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- If the source text is short, make it large and iconic. If the source text is long, split the exact text into two or three readable panels with clear hierarchy and generous line spacing.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The current avatar file listed in Current Avatar Binding is the real profile avatar of the current X account owner. Reproduce that exact avatar image 1:1 inside the circular avatar area as a direct bitmap sticker. It is not a style reference, not a character concept, and not an illustration prompt; do not redraw, reinterpret, pixel-art, iconify, beautify, relight, recolor, crop differently, replace the person, or create a similar-looking avatar.
- The avatar should look like a direct source-avatar bitmap reproduction pasted into the UI, screen, printed board, or identity card, with at most a circular UI mask. It should not look like a newly invented portrait.
- Treat the avatar circle as a protected flat bitmap island and small circular printed decal / original-bitmap sticker on the stage UI/source surface. Stage lights, LED pixels, screen glow, monitor reflections, and printed-board shadows may surround it, but they must not pass through, recolor, blur, warp, relight, or repaint the avatar interior.
- Keep the avatar a compact UI identity marker inside the author/profile row or identity card, roughly 6-10% of the main source-surface width when possible. It must not become a stage portrait, performer image, or hero badge.
- Match the current avatar asset directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- Do not turn an animal avatar into a human, a human avatar into a different person, a photo into a generic illustration, or a distinctive avatar into a generic icon.
- Do not reinterpret the avatar to match the scene lighting. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Stage lights, LED pixel texture, screen glow, monitor reflections, printed-board shadows, and identity-card material may surround the avatar, but they must not cross, blur, recolor, relight, or distort the avatar interior.
- Do not render the avatar as a 3D object, glass coin, hologram, sculpture, painted portrait, poster portrait, badge illustration, or enlarged hero face. If fidelity is uncertain, keep the avatar smaller, flatter, front-facing, and closer to the source crop instead of stylizing it heavily.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear on real screens, printed boards, framed display panels, tablet screens, monitor sidebars, or physical product boards, and visible source content should remain recognizable.
- Do not invent new attached media. If no media exists, let the stage design rely on typography, avatar, profile identity, and lighting.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI DNA through clean information hierarchy and rounded cards, but those cards should appear on real screens, printed boards, or practical display surfaces. It should look photographed in a real launch-stage or creator-workspace setup, not like a flat screenshot.

## Realistic Lighting And Materials

- Use a strong but believable key light on the main content card and soft practical fill from screens, desk lamps, cafe windows, or stage fixtures.
- Use real reflections only where they make sense: monitor glare, polished table highlights, floor reflections, camera lens bloom, or soft screen glow.
- Let material details carry the richness: matte paper, LED pixels, fabric curtains, brushed metal stands, wood grain, coffee cups, notebook paper, cables, stickers, and realistic shadows.
- Keep light effects away from text and faces.
- Use subtle atmospheric depth from lens choice and real space, not foggy clutter, sci-fi haze, or abstract light trails.

## Composition Variants

- Profile variant: faithful avatar crop plus large name/handle, bio as a clean three-line identity block, counts as small exact chips, banner as a contained screen header or printed strip.
- Short post variant: exact post text as a large keynote quote on a real display, author capsule above, optional quote/media panel below.
- Product launch variant: attached media as the hero evidence panel on a real monitor or printed product board, post text as launch copy, author identity as a presenter badge.
- Article variant: title as the keynote headline, preview as a subhead, cover image as a real screen or printed backdrop panel inside the display.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, unrelated person, unrelated animal, unrelated icon, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No liquid-glass UI, holographic panels, translucent sci-fi cards, impossible floating screens, glass shards, abstract signal beams, full-screen particle fields, chaotic sprays, random neon symbols, or generic sci-fi noise.
- No fake 3D interface hovering in empty space. Every screen, board, card, or display should feel physically present in the scene.
- No cluttered abstract background.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, or unreadable typography.
- No reflections, props, hands, glare, screen bloom, or media covering source text, avatar faces, or important attached-media content.
