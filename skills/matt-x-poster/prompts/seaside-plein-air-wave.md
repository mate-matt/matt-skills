# Seaside Plein Air Wave

Turn an X profile, post, or article into a hyperreal seaside plein-air poster. A painter has just finished a clear X source card on an easel canvas, then turns slightly in profile to look toward a huge offshore wave. The wave carries a poetic shadow echo of the X content through water, light, and foam, while the easel canvas remains the crisp factual reading surface.

This structure is for natural coastal realism, quiet wonder, and a beautiful double image: exact X content rendered flat and readable on the painter's canvas, and the same content remembered by the ocean as wave-shaped silhouettes. It should feel like an extraordinary moment inside ordinary seaside life, not a disaster scene, fantasy illustration, flat screenshot, or sci-fi portal.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a cinematic landscape, near-square, or 4:5 poster with enough space for the painter, easel canvas, beach foreground, huge wave, horizon, blue sky, and white clouds.
- Use a hyperreal coastal photography look: natural daylight, clean air, believable lens depth, wet sand, canvas texture, brush marks, paint tubes, wind-touched fabric, real ocean spray, and crisp readable typography.
- Compose from a side three-quarter camera angle so the viewer can see the painter's side profile, the front plane of the easel canvas, the distant wave, the horizon line, and open sky in one image.
- The easel canvas must be large enough, flat enough, and front-facing enough for exact X content to read clearly. The painter and beach atmosphere support the card; they must not compete with it.
- Keep the palette clear and natural: ocean blue, white clouds, sunlit sand, weathered wood, canvas ivory, graphite ink, soft X blue accents, and one restrained color cue from the avatar, banner, or attached media.

## Coastal Scene

- Build one believable beach painting setup:
  - a real wooden easel on wet or compact sand;
  - a canvas, painting board, or taped watercolor sheet mounted on the easel;
  - an adult painter shown in side profile or side-back profile, having just finished the work and turned slightly toward the wave;
  - brushes, paint tubes, palette, rag, folding stool, canvas bag, footprints, and a cup or jar for brushes;
  - a high but natural offshore wave behind the easel;
  - visible horizon, blue sky, and white clouds beyond and above the wave.
- The painter should feel anonymous and observational. Do not make the painter the X author, do not infer the author's body or face from the avatar, and do not turn the avatar into a real person in the scene.
- The painter may hold a brush or palette, but the pose should read as a quiet pause after finishing: body angled to the easel, head slightly turned toward the wave.
- The ocean event should be beautiful and uncanny, not catastrophic. The beach remains calm, the easel is standing, the painter is safe, and the image has natural life and breathing room.

## Core Scene

1. The main factual object is the easel canvas in the foreground or midground.
2. On the easel canvas, render a clean, flat, readable X source card with real data from `card-context.json`.
3. If `source_type` is `profile`, the easel canvas contains:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when short enough,
   - exact `profile.display_counts.text` in order when space allows,
   - strict flat bitmap avatar reference,
   - optional banner color strip as a small painted or printed header.
4. If `source_type` is `post`, the easel canvas contains:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text when short enough,
   - exact leading post excerpt when the post is too long,
   - quote facts only when `post.quote` exists and only from `card-context.json`,
   - attached media only as a canvas card image block or pinned reference plate if local media exists.
5. If `source_type` is `article`, the easel canvas contains:
   - exact article title,
   - exact preview excerpt when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media as a clean canvas card image block if present.
6. Far behind the easel, place a very tall ocean wave rising offshore. It should be high enough to feel monumental, but it must not cover the entire sky or hide all clouds.
7. Inside the darker wave body and foam-shadow areas, echo the X content as a water-shaped memory:
   - rounded card silhouette,
   - horizontal text-line shadows following the water curve,
   - avatar-circle silhouette,
   - media-rectangle silhouette when source media exists,
   - soft fragments of exact source text only when short and naturally readable.
8. The wave echo should follow the crest, trough, and translucent volume of the wave. It should feel caused by sunlight, shadow, foam density, and refraction inside water, not pasted over the wave.
9. The easel card is the primary readable factual surface. The wave carries poetic recognition and large visual rhythm, not the burden of full factual readability.
10. Keep the viewer's eye path clear: painter profile, finished X canvas, wave echo, open blue sky.

## Wave Echo Logic

- The wave echo may suggest the same X content at a larger, more emotional scale, but it must remain secondary to the easel canvas for exact data.
- Use the wave to repeat structure, not to invent new facts: card geometry, author row rhythm, line blocks, avatar circle, and media-panel shape.
- If the post text is short, a few exact words or lines may appear as soft water-shadow lettering inside the wave. They must be copied exactly from `card-context.json`.
- If the source text is long, do not force the whole text into the wave. Use readable exact text on the easel canvas and abstract line-shadow rhythm in the wave.
- Do not create a second independent X card floating in the ocean. The wave echo should be embedded in water and foam.
- Do not turn the wave echo into a literal screen, hologram, neon sign, projection, or glossy UI panel.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON when visible.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- Do not summarize, rewrite, translate, shorten, or embellish source text unless the user explicitly requested translation or adaptation.
- If source text is long, show a clean exact leading excerpt on the easel canvas and move secondary exact facts to a smaller painted note or taped reference card on the canvas edge. Do not invent continuation text, summaries, or captions.
- For profile counts, use `profile.display_counts.text` exactly and in order. Counts above 1,000 should already include K/M compact notation. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- The easel canvas text must be crisp, high-contrast, and flat enough to read. Canvas grain, brush texture, sunlight, sea spray, hand shadows, and shallow focus must not obscure exact source text.
- The wave text, when present, may be softer and more poetic, but any legible words must still be exact copied source text.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The current avatar file listed in Current Avatar Binding is the real profile avatar of the current X account owner. Reproduce that exact avatar image 1:1 inside the circular avatar area as a direct bitmap sticker. It is not a style reference, not a character concept, and not an illustration prompt; do not redraw, reinterpret, pixel-art, iconify, beautify, relight, recolor, crop differently, replace the person, or create a similar-looking avatar.
- The avatar on the easel canvas should look like a direct source-avatar bitmap reproduction placed inside a clean circular X avatar mask, as if carefully printed or pasted as a flat bitmap sticker onto the source card.
- Match the current avatar asset directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- Treat the avatar circle as a protected flat bitmap island and small circular printed decal / original-bitmap sticker. Beach light, canvas grain, paint texture, wave reflections, paper fibers, shadows, glare, and depth of field may surround the avatar, but they must not enter the avatar circle or alter the interior pixels, crop, subject, expression, background, or colors.
- Keep the avatar a compact UI identity marker inside the easel-card author/profile row, roughly 6-10% of the main source-card width when possible. It must stay smaller than the source text and attached-media panel, and it must never become a beach portrait or painted face.
- Do not reinterpret the avatar to match beach lighting, paint style, canvas texture, water shadows, or the painter's hand. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Canvas grain, matte ink, paper edge, easel shadow, and natural daylight may affect the card surface around the avatar, but must not cover, recolor, blur, warp, relight, or distort the avatar interior.
- Do not render the avatar as the painter, a beach portrait, a painted figure on the horizon, a water face, a foam face, a 3D medallion, a badge, a poster portrait, or an enlarged hero face.
- In the wave echo, prefer an abstract avatar-circle shadow or protected tiny source-avatar hint. Do not create a second stylized or watery avatar face if fidelity is uncertain.
- If avatar fidelity is uncertain, keep the easel avatar smaller, flatter, front-facing, cleaner-edged, and closer to the original bitmap crop.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as a clean image block on the easel canvas and as a broad abstract media-panel shadow inside the wave. Keep visible easel media recognizable and do not invent new media.
- If attached post media contains faces, those faces are media-panel content only. Never use any face from attached media as the circular author/profile avatar.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI DNA through a compact author row, circular avatar, handle line, rounded card geometry, source text hierarchy, and media-card proportions.
- The easel surface may look like a carefully painted or printed plein-air poster, but the X source card must remain flat, clean, and readable rather than loose brush scribbles.
- Avoid making the image look like a phone screenshot pasted over a beach photo. Use canvas fibers, taped edges, easel wood, paint marks around the card, and realistic contact shadows to integrate the source card physically.

## Realistic Lighting And Materials

- Use believable coastal light: clear sun or soft late-afternoon daylight, reflected blue from the ocean, warm sand bounce, and gentle shadows from the easel and painter.
- Keep the source card and easel canvas as the sharpest readable foreground object, while the wave can carry atmospheric scale and partial depth-of-field softness.
- Use real material cues: canvas weave, matte ink, rough wood, damp sand, brush bristles, paint smears, cloth texture, salt haze, foam translucency, and layered water shadows.
- The wave should show real water mass, foam, backlit translucency, and internal shadow gradients. It should not look like plastic, glass sculpture, frozen CGI, or a painted backdrop.
- Keep glare, sea spray, foam, brush handles, painter hands, easel bars, and lens bloom away from source text, avatar faces, profile counts, article title, and important attached-media content.

## Composition Variants

- Finished-turn variant: the painter has just completed the X card on the easel and turns slightly in profile toward the offshore wave echo.
- Low-beach variant: a low side angle across wet sand shows the easel canvas large in the foreground and the wave rising behind it under open sky.
- Studio-on-beach variant: a tidy plein-air setup with paint tubes, rag, folding stool, and brush cup frames the exact X card, while the wave forms the poetic background memory.
- Short-post wave variant: a short exact post appears clearly on the easel and as a few exact water-shadow words riding the wave crest.
- Article-wave variant: the article title and preview sit as a refined source card on the canvas, with the cover/media shape echoed as a large translucent panel inside the wave.
- Profile-wave variant: the profile name, handle, avatar, bio, and exact count chips sit on the easel canvas, while the wave repeats only the profile-card silhouette and author-row rhythm.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake painter captions, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, painter face, beach portrait, water face, unrelated icon, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No tsunami destruction, panic, evacuation, collapsed buildings, dark apocalypse, violent storm, disaster-news framing, or dangerous impact about to hit the painter.
- No giant wave covering the entire sky; keep blue sky and white clouds visible.
- No sci-fi portal, holographic UI, neon projection, floating glass card, impossible screen, abstract particle beam, or full-screen digital noise.
- No making the wave echo the primary factual reading surface.
- No loose painterly scribbles replacing the exact readable X card on the easel.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, sea-spray-covered, foam-covered, or unreadable typography on the easel canvas.
- No painter, brush, hand, easel bar, wave foam, glare, sea spray, canvas texture, or shallow-focus blur covering source text, avatar faces, profile counts, article title, or important attached-media content.
