# Lunar Flag Signal

Turn an X profile, post, or article into a hyperreal lunar-surface mission poster: an astronaut stands on the Moon beside a planted flag, and the flag cloth carries the real X source content as the mission signal.

This structure is for cinematic space, exploration, and announcement posters. It should feel like a premium still photograph from a lunar EVA inspired by public-domain NASA lunar-surface photography, not a flat screenshot, sci-fi hologram, fantasy planet, or generic space illustration.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a vertical 4:5, near-square, or cinematic landscape poster depending on source text length.
- Use a hyperreal photographic space look: sharp lunar regolith, believable suit fabric, visor reflection, hard sunlight, deep black sky, Earth or stars when useful, high dynamic range, and physically plausible shadows.
- The planted flag is the main information surface. It must be large enough and front-facing enough for the source content to remain readable.
- Use a restrained palette: lunar gray, off-white flag fabric, black space, clean white typography, subtle X blue accents, and one controlled accent derived from the source avatar/banner/media.

## Lunar Environment

- Build one believable lunar EVA scene:
  - cratered Moon surface with granular regolith, boot prints, small rocks, dust ridges, and long sharp shadows;
  - one generic astronaut in a plain realistic spacesuit, standing or kneeling near the flagpole;
  - a planted flag with a support pole/crossbar so the cloth appears wind-swept or waving through creases, even though there is no lunar atmosphere;
  - optional Earth low over the horizon, starless black sky or sparse stars, and distant lunar hills;
  - subtle equipment details such as a generic tool pouch, camera mount, or rover-like silhouette only if they stay secondary and non-factual.
- Use NASA public-domain lunar EVA photography only as realism inspiration: lighting, exposure, lunar dust, horizon geometry, suit material, and flag-pole physicality. Do not copy a specific NASA photo, mission patch, astronaut identity, logo, national flag, mission number, or historical scene.

## Core Scene

1. The main focal object is a physical flag planted in the Moon surface.
2. The X content is printed or woven into the flag cloth, not floating above it. The cloth may ripple, crease, and cast shadows, but the main source text must stay readable on flatter fabric panels.
3. If `source_type` is `profile`, the flag becomes a creator identity mission banner:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when present,
   - exact `profile.display_counts.text` in order,
   - strict flat bitmap avatar reference,
   - optional banner strip as a contained flag-header band.
4. If `source_type` is `post`, the flag becomes a lunar post signal:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text,
   - quote block when `post.quote` exists, using only quote facts from `card-context.json`,
   - attached media panel when local or remote post media exists.
5. If `source_type` is `article`, the flag becomes a lunar article banner:
   - exact article title,
   - exact preview text when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media panel when present,
   - Summary bullets only when the Article Summary Workflow appended them.
6. Use X UI DNA on the flag: author row, circular avatar, handle line, clean hierarchy, rounded source-card geometry, and exact count chips where relevant.
7. The astronaut should guide scale and drama, not replace the source author. The astronaut is a generic scene figure only.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, profile bio, and profile counts from the JSON.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- Do not summarize, rewrite, translate, shorten, or embellish source text unless the user explicitly asked for a summary poster.
- For profile counts, use `profile.display_counts.text` exactly and in order. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Keep source typography crisp, high-contrast, and readable as printed ink or woven mission text on the flag.
- If the source text is long, split exact text across two or three flag panels, a lower lunar placard, or a secondary mission card attached to the flagpole. Do not shrink text into unreadability.
- Flag cloth creases, dust, shadows, glare, visor reflections, and lunar light must not cross or obscure important source text.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The current avatar file listed in Current Avatar Binding is the real profile avatar of the current X account owner. Reproduce that exact avatar image 1:1 inside the circular avatar area as a direct bitmap sticker. It is not a style reference, not a character concept, and not an illustration prompt; do not redraw, reinterpret, pixel-art, iconify, beautify, relight, recolor, crop differently, replace the person, or create a similar-looking avatar.
- The avatar should look like a direct source-avatar bitmap reproduction printed on the flag's X author row or on a small mission-source card attached to the flagpole, inside a clean circular X avatar mask.
- Treat the avatar circle as a protected flat bitmap island and small circular printed decal / original-bitmap sticker. Lunar sunlight, flag fabric texture, suit reflections, moon dust, cloth creases, stitching, and shadows may surround it, but they must not enter, recolor, blur, warp, relight, repaint, pixel-art, iconify, or alter the avatar interior.
- Keep the avatar a compact UI identity marker, roughly 6-10% of the main flag-source card width when possible. It must not become the astronaut face, visor reflection, mission portrait, shoulder patch, helmet decal, or enlarged hero face.
- Match the current avatar asset directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- Do not reinterpret the avatar to match lunar lighting, suit reflection, mission-patch embroidery, fabric weave, or dust. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- If fidelity is uncertain, keep the avatar smaller, flatter, cleaner-edged, front-facing, and more obviously pasted as a bitmap UI sticker on the flattest flag area or attached source card.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as printed mission-photo panels on the flag, small sample cards clipped to the pole, or flat media patches on a nearby lunar placard. Keep visible media recognizable and do not invent new media.
- If post/article media contains faces, those faces are attached media only. Never use any face from media references as the circular author/profile avatar or as the astronaut.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should look like X content has been redesigned as a lunar mission flag while preserving X hierarchy and factual content.
- Avoid making the flag look like a phone screenshot pasted onto fabric. Integrate X hierarchy into the flag design as printed mission typography and source-card panels.

## Hyperreal Space Lighting And Materials

- Use physically plausible lunar light: hard sun, black shadows, strong rim on suit edges, bright flag highlights, long regolith shadows, and high-contrast exposure.
- Use realistic materials: woven flag cloth, metal flagpole, dust-coated boots, ribbed suit fabric, glassy helmet visor, dusty gloves, compressed regolith, tiny rocks, and subtle fabric stitching.
- The flag can appear to wave through crossbar tension, folds, creases, and angled fabric, not through atmospheric wind.
- Keep the source text, avatar, author row, media panels, and important profile counts on the cleanest, flattest fabric regions.
- Use shallow depth of field only in distant lunar hills or background equipment. The flag content must remain sharp.

## Composition Variants

- Hero flag variant: astronaut stands beside a large planted flag, X content centered on the flag cloth, Earth visible above the horizon.
- Low-angle lunar variant: camera close to regolith and boot prints, flag towering upward with readable X content.
- Wide mission variant: small astronaut and flag against vast Moon surface and black sky, with a secondary close-readable flag panel.
- Media mission variant: exact post media or article cover printed as flat sample panels clipped below the main flag text.
- Profile mission variant: profile identity as a clean mission banner, avatar and counts in compact X-style chips on the flag.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake NASA mission numbers, fake mission patches, fake astronaut names, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, mission patch, helmet reflection, unrelated person, unrelated icon, embroidered face, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, crop-changing, background-changing, or style-changing of the avatar.
- No actor likenesses, famous astronauts, celebrity faces, recognizable mission crew, real NASA logo, real national flag design, real mission insignia, copyrighted spacecraft marks, or exact recreation of a specific historical lunar photograph.
- No using bundled X reference screenshot media as poster media.
- No generic fantasy planet, sci-fi hologram, neon HUD, impossible floating UI, laser beams, alien landscape, spaceships as the main subject, or abstract cosmic collage.
- No heavy dust clouds, glare, lens flare, visor reflection, flag folds, particles, or shadows covering source text, avatar, or important attached-media content.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, or unreadable typography.
