# Sunlit Sail Signal

Turn an X profile, post, or article into a hyperreal ocean sailing poster: a real sailboat moves across bright blue water under clear sunlight, and the X source content is printed on the boat's sailcloth as a readable maritime signal.

This structure is for sunny ocean realism, open-air movement, and premium nautical photography. It should feel like a believable documentary/editorial sailing photograph with the X content physically integrated into the sail, not a yacht ad mockup, flat screenshot, fantasy ocean illustration, or sci-fi projection.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer cinematic landscape, near-square, or 4:5 poster depending on source text length.
- Use a very realistic sunny seascape: bright natural sky, clean horizon, crisp water texture, white sailcloth, believable rigging, hull reflections, and physically plausible shadows.
- Camera angle should look across the sea from a low-to-mid waterline or chase-boat viewpoint, roughly 20-45 degrees above the horizontal water plane. Avoid top-down drone views, vertical flat front views, and impossible camera angles.
- The sail is the main information surface. It must be large, readable, and angled only slightly enough that the source content remains legible.
- Keep the palette clear and natural: ocean blue, sunlit white sailcloth, pale sky, warm wood or neutral hull details, subtle X blue accents, and one restrained accent derived from the avatar, banner, or attached media.

## Ocean Sailing Environment

- Build one believable sunny sailing scene:
  - open ocean or calm coastal water with small rolling waves, foam streaks, sun glitter, and a visible horizon;
  - one real sailboat, sloop, cutter, dinghy, or small cruising yacht with mast, boom, rigging lines, hull, deck details, and wind-filled sails;
  - a mainsail, jib, or spinnaker acting as the source-content surface;
  - optional distant coastline, small clouds, seabirds, or another tiny sail in the far background only if they stay secondary and non-factual;
  - optional anonymous crew as small practical scale figures, never as the X author and never blocking the sail content.
- The scene should feel bright, fresh, and physical: wind tension in fabric, rope strain, hull motion, spray, sunlight, and true boat geometry.
- The boat may heel gently, but not so much that the content becomes warped, hidden, or unreadable.
- Do not copy a specific vessel, regatta, club mark, national flag, sail number, brand logo, or race identity.

## Core Scene

1. The main focal object is a physical sailboat on a sunny ocean.
2. The X content is printed, stitched, or screen-printed onto the sailcloth, not floating above it. The sail may curve, billow, and cast shadows, but the main source text must stay on flatter cloth panels.
3. If `source_type` is `profile`, the sail becomes a creator identity sail:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when present,
   - exact `profile.display_counts.text` in order,
   - strict flat bitmap avatar reference,
   - optional banner strip as a clean sail-header band.
4. If `source_type` is `post`, the sail becomes a bright ocean post signal:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text when short enough,
   - exact leading post excerpt when the post is long,
   - quote block when `post.quote` exists, using only quote facts from `card-context.json`,
   - attached media panel when local or remote post media exists.
5. If `source_type` is `article`, the sail becomes a maritime article banner:
   - exact article title,
   - exact preview text when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media panel when present,
   - Summary bullets only when the Article Summary Workflow appended them.
6. Use X UI DNA on the sail: author row, circular avatar, handle line, clean hierarchy, rounded source-card geometry, and exact count chips where relevant.
7. If the source text is long, put the headline or leading exact excerpt on the main sail and move secondary exact text to a smaller jib panel, deck placard, cockpit card, or boom-hung canvas panel. Do not shrink text into unreadability.
8. Rigging, sail seams, mast, boom, crew, wave spray, glare, and shadows must not cross or obscure important source text, avatar, profile counts, article title, or attached-media content.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, profile bio, and profile counts from the JSON when visible.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- Do not summarize, rewrite, translate, shorten, or embellish source text unless the user explicitly requested translation or adaptation.
- For profile counts, use `profile.display_counts.text` exactly and in order. Counts above 1,000 should already include K/M compact notation. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Keep source typography crisp, high-contrast, and readable as ink, sailcloth transfer, or stitched mission lettering on the sail.
- Sail seams, cloth folds, sunlight, spray, reflection, and shallow focus must not obscure exact source text.
- If only a leading excerpt fits on the main sail, keep it exact and use a secondary sail/deck surface for additional exact facts. Do not invent continuation text.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The current avatar file listed in Current Avatar Binding is the real profile avatar of the current X account owner. Reproduce that exact avatar image 1:1 inside the circular avatar area as a direct bitmap sticker. It is not a style reference, not a character concept, and not an illustration prompt; do not redraw, reinterpret, pixel-art, iconify, beautify, relight, recolor, crop differently, replace the person, or create a similar-looking avatar.
- The avatar should look like a direct source-avatar bitmap reproduction printed on the sail's X author row or on a small canvas source tag clipped to the boom, inside a clean circular X avatar mask.
- Treat the avatar circle as a protected flat bitmap island and small circular printed decal / original-bitmap sticker. Sunlight, sailcloth weave, salt spray, rigging shadows, hull reflections, and wind wrinkles may surround it, but they must not enter, recolor, blur, warp, relight, repaint, stitch, embroider, iconify, or alter the avatar interior.
- Keep the avatar a compact UI identity marker, roughly 6-10% of the main sail-source card width when possible. It must not become a sailor's face, figurehead, hull emblem, sail number, club badge, cockpit portrait, reflection in water, or enlarged hero face.
- Match the current avatar asset directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- Do not reinterpret the avatar to match nautical lighting, sail stitching, embroidery, wind-blown fabric, deck shadows, or water reflections. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- If fidelity is uncertain, keep the avatar smaller, flatter, front-facing, cleaner-edged, and more obviously pasted as a bitmap UI sticker on the flattest sail area or attached source card.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as flat printed media panels on the sail, a smaller jib-panel image, a clipped deck sample card, or a canvas plate near the boom. Keep visible media recognizable and do not invent new media.
- If post/article media contains faces, those faces are attached media only. Never use any face from media references as the circular author/profile avatar, crew member, or sailor portrait.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should look like X content has been redesigned as a sail signal while preserving X hierarchy and factual content.
- Avoid making the sail look like a phone screenshot pasted onto a boat. Integrate X hierarchy into the sail design as clean printed sail typography, canvas appliques, or source-card panels that follow the sail plane.

## Hyperreal Ocean Lighting And Materials

- Use believable sunny marine light: hard but natural sun, bright sky fill, blue water bounce, crisp sail highlights, subtle rigging shadows, hull reflections, and sparkling wavelets.
- Use realistic materials: woven sailcloth, reinforced corners, seams, stitching, metal mast, taut ropes, deck hardware, fiberglass or wood hull, wet spray, foam, and rippled water.
- The sail should show wind tension, cloth curvature, reef points, seams, and edge reinforcement without destroying text clarity.
- Keep the source text, avatar, author row, media panels, and important counts on the cleanest, flattest sail regions.
- Use shallow depth of field only in distant coastline, far boats, or water spray. The sail content must remain sharp.

## Composition Variants

- Main-sail signal variant: a sloop sails across bright blue water, with the X source card centered on the large mainsail and the horizon behind it.
- Chase-boat low-angle variant: camera skims over the water at 20-45 degrees above the horizontal plane, making the sailboat feel large and real while the sail remains readable.
- Jib-and-main variant: the author row and avatar sit on the jib, while the main source text and media panel occupy the mainsail.
- Spinnaker poster variant: a large sunlit spinnaker fills the frame as a clean curved cloth poster, with source text kept on the flattest central panels.
- Deck placard variant: long secondary text appears on a canvas placard tied near the boom while the main sail carries the concise headline and author row.
- Media sail variant: attached post media or article cover appears as a flat printed sail panel below the main source text, with no invented imagery.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake race names, fake sail numbers, fake yacht brands, fake club marks, fake national flags, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, sailor face, crew face, figurehead, hull emblem, sail badge, unrelated icon, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, crop-changing, background-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No storm, shipwreck, distress signal, emergency rescue, dark apocalypse, violent wave impact, sinking boat, or dangerous disaster framing.
- No luxury yacht advertisement, brand campaign, regatta poster, national-flag design, racing number, sponsor logo, or marina real-estate ad.
- No fantasy ocean, sci-fi hologram, neon HUD, impossible floating UI, laser beams, alien sky, plastic CGI water, or abstract particle collage.
- No top-down drone map view, fisheye distortion, impossible mast geometry, unreadable steep perspective, or sail cropped so the X content cannot be read.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, spray-covered, glare-covered, or unreadable typography.
- No mast, boom, rigging line, sail seam, crew, rope, hand, spray, wave splash, lens flare, or shadow covering source text, avatar, profile counts, article title, or important attached-media content.
