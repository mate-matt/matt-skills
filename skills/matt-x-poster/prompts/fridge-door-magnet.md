# Fridge Door Magnet

Turn an X profile, post, or article into a humorous photorealistic kitchen-fridge poster: the X content appears as a magnet, taped printout, grocery-list card, or tiny family-calendar note on a real refrigerator door. The joke is that a creator or post has somehow become part of daily kitchen logistics.

This structure is for accidental discovery, warm domestic realism, and dry visual comedy. It should feel like someone opened the fridge and unexpectedly found an X source card treated with the seriousness of a grocery list, not like a meme template or a flat screenshot.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a near-square, 4:5, or 3:4 poster so the fridge door has enough width for magnets, notes, and a readable X source card.
- If source text is long, expand both width and height into a broad kitchen scene. Do not make a narrow extra-tall strip.
- Use photorealistic kitchen photography: enamel or stainless refrigerator surface, soft window light, warm under-cabinet light, magnet shadows, paper curl, tape texture, faint fingerprints, and believable shallow depth of field.
- Palette should feel lived-in but clean: warm white, brushed steel, soft blue X accents, small red/yellow magnet accents, and one color cue from the avatar, banner, or attached media.
- The humor should come from placement and ordinary props, not from cartoon exaggeration, joke captions, meme fonts, surreal CGI, or impossible floating UI.

## Humor Engine

- Treat the X source as a strangely important household reminder: a creator profile becomes a fridge magnet, a post becomes a daily note, or an article becomes the most serious item on a family calendar.
- Surround it with generic kitchen life cues such as a shopping list, meal-plan grid, blank reminder slips, coffee stain, timer, or small magnet set.
- Do not invent factual jokes, fake reactions, fake comments, fake endorsements, or fake labels about the author. Generic non-factual prop text may be minimal and ordinary, such as "milk", "eggs", or "today", but it must not compete with or reinterpret the source.
- Keep the source card visually dominant and readable; the surrounding kitchen notes are atmosphere.

## Core Scene

1. The main focal object is a real refrigerator door or side panel with physical paper objects attached:
   - a printed mini X profile card held by magnets,
   - a yellow sticky note with an exact post excerpt,
   - a small article clipping taped beside a grocery list,
   - a calendar square containing the exact author line,
   - or a clean magnet card carrying the avatar, handle, and source text.
2. The X content must be physically present on paper, magnet stock, or a small glossy print. Show magnet thickness, contact shadows, tape edges, paper fibers, curled corners, and slight surface reflections.
3. If `source_type` is `profile`, the fridge card contains:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when short enough,
   - exact `profile.display_counts.text` in order when space allows,
   - strict flat bitmap avatar reference,
   - optional banner color strip as a magnet header or small paper tab.
4. If `source_type` is `post`, the fridge card contains:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text when short enough,
   - exact leading post excerpt when the post is too long,
   - quote facts only when `post.quote` exists and only from `card-context.json`,
   - attached media only as a small printed photo, magnet photo, or secondary clipping if local media exists.
5. If `source_type` is `article`, the fridge card contains:
   - exact article title,
   - exact preview excerpt when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media as a small glossy clipping if present.
6. Kitchen props may include a mug, fruit bowl edge, timer, handwritten grocery list, calendar grid, dish towel, and soft countertop blur. They must not cover source text, avatar, counts, title, or media.
7. The X card is the sharpest readable object. The kitchen background may be softly out of focus.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON when visible.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- If source text is long, show a clean exact leading excerpt on the main fridge card and move secondary exact facts to a smaller adjacent card. Do not invent continuation text, summaries, commentary, or punchlines.
- For profile counts, use `profile.display_counts.text` exactly and in order. Counts above 1,000 should already include K/M compact notation. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Make the main source text crisp, high-contrast, and readable as printed ink or neat marker on paper. Magnets, glare, fridge reflections, tape, grocery notes, and shadows must not obscure exact source text.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The current avatar file listed in Current Avatar Binding is the real profile avatar of the current X account owner. Reproduce that exact avatar image 1:1 inside the circular avatar area as a direct bitmap sticker. It is not a style reference, not a character concept, and not an illustration prompt; do not redraw, reinterpret, pixel-art, iconify, beautify, relight, recolor, crop differently, replace the person, or create a similar-looking avatar.
- The avatar should look like a direct source-avatar bitmap reproduction printed on the magnet card or mini X card, inside a clean circular X avatar mask.
- Treat the avatar circle as a protected flat bitmap island and small circular printed decal / original-bitmap sticker on the magnet card. Fridge reflections, paper texture, tape shine, magnet shadows, kitchen light, and shallow focus may surround it, but they must not enter, recolor, blur, warp, relight, or repaint the avatar interior.
- Keep the avatar a compact UI identity marker inside the X author/profile row, roughly 6-10% of the magnet/source-card width when possible. It must not become a fridge mascot, large photo magnet, or standalone portrait.
- Match the current avatar asset directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- Do not reinterpret the avatar to match kitchen lighting. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Fridge reflections, paper texture, tape shine, magnet shadow, and shallow focus may affect the card surface around the avatar, but must not cover, recolor, blur, warp, relight, or distort the avatar interior.
- Do not render the avatar as a fridge mascot, hand drawing, sticker illustration, 3D badge, enamel pin, hologram, painted portrait, or enlarged hero face.
- If avatar fidelity is uncertain, keep the avatar smaller, flatter, front-facing, cleaner-edged, and closer to the original bitmap crop.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as small printed clippings or magnet photos. Keep visible media recognizable and do not invent new media.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI DNA through a compact author row, circular avatar, handle line, rounded card geometry, and clean text hierarchy, but the source card must be physically attached to the fridge.
- Avoid making the image look like a screenshot pasted flat over a stock kitchen photo. Use real paper, magnets, tape, shadows, and surface contact.

## Composition Variants

- Grocery-list variant: the exact post sits at the top of a grocery list as if it is the most urgent household item.
- Calendar-square variant: the exact author line and post excerpt are pinned over a family calendar square.
- Magnet-card variant: the profile name, handle, avatar, bio, and exact counts are printed on a custom fridge magnet.
- Article-clipping variant: the article title and preview are taped beside a coffee-stained meal plan, with cover media as a tiny glossy clipping.
- Midnight-snack variant: the fridge door is half lit by cool refrigerator light, with the X source card unexpectedly crisp in the glow.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake kitchen captions, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, household mascot, unrelated icon, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No holographic panels, translucent sci-fi cards, impossible floating UI, neon particles, signal beams, or random digital noise.
- No dirty, gross, spoiled-food, trash, or unhygienic scene.
- No blurry, warped, melted, low-contrast, over-reflective, grease-smeared, or unreadable typography.
- No magnets, tape, fridge handles, grocery notes, glare, fingers, mugs, or kitchen props covering source text, avatar faces, profile counts, article title, or important attached-media content.
