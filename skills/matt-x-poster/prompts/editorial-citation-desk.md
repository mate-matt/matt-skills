# Editorial Citation Desk

Turn an X profile, post, or article into a photorealistic editorial citation poster: a real writing desk, open book or magazine spread, one natural hand turning a page, and an X source card printed or embedded into the page as credible article evidence.

This structure is for creator workflows where X content becomes a source, quote, citation, newsletter asset, article reference, or public writing material. It should feel like a real photograph of an editorial desk, not a 3D render, launch-stage screen, flat screenshot, hologram, or sci-fi interface.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a landscape, near-square, or 4:5 editorial poster with enough room for the open page, the hand, and a readable source card.
- Use a photorealistic editorial photography look: real paper fibers, real ink, natural hand anatomy, believable shadows, lens depth of field, warm wood, desk objects, and true-to-life lighting.
- Use a warm editorial palette: warm wood, ivory paper, black ink, graphite shadows, soft X blue accents, and a subtle coastal-blue reflection inspired by the profile banner when available.
- The image should look like a real photographed desk scene. Avoid illustration style, CGI plastic surfaces, fake 3D render sheen, holographic effects, translucent glass UI, neon particles, and impossible floating interfaces.

## Desk And Background

- Build one quiet, believable editorial desk environment:
  - warm wooden writing desk or matte graphite desktop,
  - open printed book, magazine spread, newsletter draft, or article proof,
  - one natural hand gently turning or lifting a page corner,
  - pen, notebook, coffee cup, small stack of printed drafts, sticky notes, and a laptop edge or side screen softly out of focus when useful,
  - soft side-window daylight plus a warm practical desk lamp,
  - subtle coastal-blue reflection from a small side screen, window, or glossy desk edge if a profile banner has ocean/coastal tones.
- Keep the background quiet, tactile, and real. Do not fill it with decorative clutter, random bokeh, abstract gradients, or busy props.
- The profile banner may influence a small side-screen reflection, desk-edge color, or a narrow printed strip, but it must not become the full background.

## Core Scene

1. The main focal object is an open printed page, book spread, magazine proof, newsletter draft, or article layout lying on the desk.
2. One hand enters naturally from an edge of the frame, cropped at the wrist, gently turning or lifting the page corner. The hand should support the scene's realism, not dominate it.
3. Place the X content as a clean citation/source card printed into the visible page, attached as a paper clipping, or embedded as a magazine source block. It must feel physically integrated with paper: printed ink, slight paper texture, subtle page curvature, and believable shadows.
4. If `source_type` is `profile`, the page contains a creator source card:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when present,
   - exact `profile.display_counts.text` in order,
   - strict flat bitmap avatar reference,
   - optional small profile banner strip as printed header or page accent.
5. If `source_type` is `post`, the page contains an X post citation card:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text,
   - source URL when useful,
   - quote block when `post.quote` exists, using only quote facts from `card-context.json`,
   - attached media panel when local or remote post media exists.
6. If `source_type` is `article`, the page contains an X Article citation card:
   - exact article title,
   - exact preview text when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media panel when present.
7. The X card should be the clearest information object in the image. The surrounding book, page, hand, and desk create realism and context.
8. Secondary source details may appear as printed footnotes, margin notes, sticky notes, table cards, or small source labels only when they use exact facts from `card-context.json`.

## Hand And Page Rules

- Use only one visible adult hand, cropped naturally at the wrist or lower palm.
- The hand gently turns the page corner, holds the page edge, or rests beside the source card. It must not cover the avatar, author name, handle, post text, article title, or important media.
- Fingers should be natural, correctly counted, and anatomically plausible. No extra fingers, duplicated hands, warped joints, fused fingertips, or impossible grips.
- Page texture should feel real: slight curl, fibers, printed ink, subtle shadow under the page, and believable contact with the desk.
- Do not make the X card float above the page unless it is a physical paper clipping with visible paper edge and shadow.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON.
- Do not summarize, rewrite, translate, shorten, or embellish source text unless the user explicitly asked for a summary poster.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- If a quote is too long for a beautiful readable composition, make the quote a secondary physical source card and show only exact short visible lines from the beginning of the quote, plus exact quote author and exact quote handle. Do not invent continuation text, fake summaries, or fake quote labels.
- For profile counts, use `profile.display_counts.text` exactly and in order. Counts above 1,000 should already include K/M compact notation. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Make the main source text crisp, dark, and readable as printed ink on paper or as a clean card printed on the page. Do not let paper grain, hand shadows, glare, reflections, or shallow depth of field obscure exact text.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The avatar should look like a direct source-avatar bitmap reproduction printed or pasted into the citation card, with at most a circular UI mask. It may read as a small photo sticker or printed source image, but it should not look like a newly invented portrait.
- Preserve the exact subject type, face shape, eye shape, hair silhouette, pose, crop, accessories, held objects or visible text, color treatment, photo/illustration/pixel style, line quality, and background mood from the avatar file.
- Do not reinterpret the avatar to match the desk lighting. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Do not render the avatar as a 3D object, glass coin, hologram, sculpture, painted portrait, poster portrait, badge illustration, or enlarged hero face. If fidelity is uncertain, keep the avatar smaller, flatter, front-facing, and closer to the source crop instead of stylizing it.
- Paper fibers, page curvature, hand shadows, ink texture, desk glare, depth of field, and folds may affect the page or card around the avatar, but they must not cover, recolor, blur, warp, or relight the avatar interior.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as printed images, page panels, clipped screenshots, or small media blocks inside the article layout, and visible source content should remain recognizable.
- Do not invent new attached media. If no media exists, let the scene rely on typography, paper, desk realism, creator identity, quote/source relationships, and lighting.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI DNA through clean information hierarchy, rounded card geometry, author row, and source-card rhythm, but it must appear physically printed or embedded in the page.
- It should look like X content has become a credible article citation, not like a phone screenshot pasted randomly onto a stock desk photo.

## Realistic Lighting And Materials

- Use warm editorial desk lighting: soft side-window daylight, warm practical lamp fill, realistic falloff, and gentle shadows.
- Add a very subtle coastal-blue reflection from a window, side screen, or glossy desk edge when the profile banner suggests ocean/coast tones. Keep it restrained and plausible.
- Use real material cues: wood grain, paper fibers, ink edges, slightly curled page corners, matte card stock, coffee ceramic, metal pen, notebook cloth, and soft dust or paper texture only where natural.
- Keep light effects away from text, avatar faces, and important media.
- Use shallow depth of field carefully: desk background can be soft, but the source card and exact main text must stay sharp.

## Composition Variants

- Post citation variant: exact post text as the main printed source block on the open page, author capsule above, optional quote/source card in the margin.
- Article citation variant: exact title as a magazine headline or source-card title, preview as subhead, cover/media as a printed page image.
- Profile source variant: exact creator identity card printed like a contributor/source card inside a book spread or article sidebar.
- Book-flip variant: one hand turns the page while the visible page reveals the X source card. The page turn is atmospheric and must not hide source facts.
- Desk-proof variant: a printed article proof on the desk contains the X card, with pen marks, sticky notes, and a laptop edge out of focus.

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
- No holographic panels, translucent sci-fi cards, impossible floating screens, glass shards, abstract signal beams, full-screen particle fields, chaotic sprays, random neon symbols, or generic sci-fi noise.
- No fake 3D interface hovering in empty space. Every card or screen should be printed, embedded, clipped, or physically present on paper, a real desk object, or a practical display.
- No cluttered abstract background.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, or unreadable typography.
- No extra hands, extra fingers, duplicated hands, warped fingers, or hands covering source text/avatar/media.
- No reflections, props, page folds, hand shadows, glare, screen bloom, or depth-of-field blur covering source text, avatar faces, or important attached-media content.
