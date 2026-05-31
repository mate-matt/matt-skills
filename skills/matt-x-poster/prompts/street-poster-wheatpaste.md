# Street Poster Wheatpaste

Turn an X profile, post, or article into a gritty but premium city street poster: layered wheatpasted paper on a real wall, torn edges, glue texture, city light, and the X content printed as the main poster surface.

This structure is for bold public-facing creator posters. It should feel like a real photographed wall poster in an urban environment, not a flat screenshot, digital mockup, CGI billboard, hologram, or generic graffiti collage.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a portrait, 4:5, near-square, or landscape street-poster crop with enough physical wall around the poster to show scale, glue marks, paper seams, and city light.
- Use a photorealistic street photography look: real paper fibers, paste bubbles, curled corners, wall scratches, subtle dirt, believable shadows, and lens depth of field.
- Use a strong but controlled palette: black ink, off-white poster paper, city concrete gray, warm sodium street light, cool blue evening spill, and one accent color derived from the creator avatar, banner, or media.
- Keep all important X text on the cleanest, flattest part of the poster. Texture may enrich the edges, but it must not damage readability.

## Wall And Street Environment

- Build one believable urban posting surface:
  - concrete wall, painted brick, subway underpass tile, studio alley wall, venue exterior, or construction plywood;
  - layered old posters beneath the main X poster;
  - glue streaks, paper wrinkles, tape marks, torn edges, staple holes, and modest weathering;
  - soft street lamp, storefront reflection, passing city light, or early-evening window glow;
  - optional blurred sidewalk, curb, metal railing, poster frame, or venue door edge for depth.
- The main X poster should be freshly pasted and readable. Older poster layers can be torn, abstract, and non-factual, but they must not contain fake names, fake metrics, fake tweets, or fake X UI.
- Avoid chaotic graffiti, heavy rain, smoke, dense stickers, or aggressive distressing over source content.

## Core Scene

1. The main focal object is one large wheatpasted poster physically attached to the wall.
2. The X content is printed into that poster, not floating above it. Show paper grain, ink absorption, slight curl, paste bubbles, and a thin shadow where an edge lifts from the wall.
3. If `source_type` is `profile`, the poster is a creator identity street bill:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when present,
   - exact `profile.display_counts.text` in order,
   - strict flat bitmap avatar reference,
   - optional banner strip as a printed header or torn color band.
4. If `source_type` is `post`, the poster is a public quote/post bill:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text,
   - source URL when useful,
   - quote block when `post.quote` exists, using only quote facts from `card-context.json`,
   - attached media panel when local or remote post media exists.
5. If `source_type` is `article`, the poster is an editorial street notice:
   - exact article title,
   - exact preview text when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media panel when present.
6. Use X UI DNA as a printed card inside the poster: rounded author capsule, clean spacing, avatar circle, handle line, and count row where relevant.
7. Keep the source card front-facing enough for text fidelity. Perspective can be cinematic, but not so angled that the text becomes warped.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- Do not summarize, rewrite, translate, shorten, or embellish source text unless the user explicitly asked for a summary poster.
- For profile counts, use `profile.display_counts.text` exactly and in order. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Make the main source text crisp, dark, high-contrast, and readable as printed ink. Paper texture, paste wrinkles, torn edges, shadows, and city reflections must not obscure exact text.
- If the source text is long, split it into two or three clean printed panels on the same poster instead of shrinking it into unreadability.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The current avatar file listed in Current Avatar Binding is the real profile avatar of the current X account owner. Reproduce that exact avatar image 1:1 inside the circular avatar area as a direct bitmap sticker. It is not a style reference, not a character concept, and not an illustration prompt; do not redraw, reinterpret, pixel-art, iconify, beautify, relight, recolor, crop differently, replace the person, or create a similar-looking avatar.
- The avatar should look like a clean circular printed bitmap decal on the poster: a direct reproduction of the local avatar image inside a circular X avatar mask. It should not become a newly painted street portrait.
- Treat the avatar circle as a protected flat bitmap island and small circular printed decal / original-bitmap sticker. Paper grain, paste texture, wrinkles, tears, dirt, city glare, and wheatpaste distress may affect only the surrounding poster surface or outer sticker edge; they must not enter, recolor, blur, warp, relight, repaint, or obscure the avatar interior.
- Keep the avatar a compact UI identity marker inside the poster's X author/profile row, roughly 6-10% of the main source-poster width when possible. It must stay smaller than the headline/source text and attached-media panel.
- Match the current avatar asset directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- Do not reinterpret the avatar to match the wall lighting. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Do not render the avatar as a mural, stencil, spray-paint portrait, 3D badge, glass coin, hologram, sculpture, painted poster portrait, or enlarged hero face.
- Paper grain, paste texture, wrinkles, tears, dirt, city glare, and wheatpaste distress may affect the surrounding poster surface or the outer avatar edge only. They must not enter the avatar interior or obscure the source bitmap pixels, crop, or background.
- If fidelity is uncertain, keep the avatar smaller, flatter, front-facing, and placed in a clean printed UI circle with minimal distressing.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as printed image panels within the street poster, with only mild paper texture and no heavy tearing over key content.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should look like X content has been redesigned into a real street poster while preserving X hierarchy and factual content.
- Avoid making the image look like a phone screenshot pasted onto a wall. Integrate the X card as a deliberately designed printed poster.

## Realistic Lighting And Materials

- Use real wall and paper materials: matte paste, pulp paper, concrete pores, chipped paint, brick mortar, small wrinkles, tape shadows, curled corners, and ink texture.
- Use plausible city light: warm street lamp from one side, cool twilight fill, storefront reflection, or venue entrance glow.
- Keep glare, shadow, and grime away from the avatar face, author line, handle, profile counts, post text, article title, and important media.
- Use shallow depth of field only in the wall edges or street background. The main poster content must stay sharp.

## Composition Variants

- Fresh paste variant: one clean main poster over older torn layers, with wet glue sheen only on the margins.
- Night street variant: warm street lamp and cool blue ambient light, poster centered and readable.
- Venue wall variant: poster outside a small event venue, with blurred doorway or marquee edge, no invented event text.
- Construction wall variant: plywood wall, staples, tape, rough paper, strong creator identity card.
- Post bill variant: exact post text as oversized printed quote, author capsule above, optional media panel below.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, unrelated person, unrelated icon, stencil face, mural face, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No holographic panels, translucent sci-fi cards, impossible floating UI, glass shards, abstract signal beams, full-screen particles, chaotic sprays, or random neon symbols.
- No extreme grunge, heavy tearing, water damage, folds, stickers, graffiti, glare, or dirt covering source text, avatar faces, or important attached-media content.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, or unreadable typography.
