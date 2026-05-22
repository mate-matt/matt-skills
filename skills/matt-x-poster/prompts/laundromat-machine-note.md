# Laundromat Machine Note

Turn an X profile, post, or article into a humorous photorealistic laundromat poster: the X content appears as a taped note, washer-door card, detergent-bottle label, dryer-window clipping, or folded waiting-room printout. The joke is that someone came to do laundry and accidentally found this X content doing its own publicity.

This structure is for everyday errand comedy, fluorescent realism, and casual "found while waiting" energy. It should feel like a spontaneous phone photo of a funny scene, polished into a cinematic poster.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a near-square, 4:5, or 3:4 poster that gives enough width for washer circles, countertop props, and a readable X source card.
- If source text is long, expand both width and height into a broader laundromat composition. Do not make a narrow extra-tall strip.
- Use photorealistic laundromat photography: rows of washer doors, chrome rims, detergent bottles, coin tray, plastic basket, folding table, fluorescent ceiling light, clean tile floor, and realistic reflections in glass.
- Palette should feel clean and slightly cinematic: white machines, chrome, pale mint or blue walls, detergent color accents, X blue, and one accent color from the avatar, banner, or attached media.
- The humor should be deadpan and situational. Avoid slapstick mess, cartoon props, meme fonts, glossy sci-fi UI, and impossible floating screens.

## Humor Engine

- Treat the X source as a laundry-room instruction with unexpected importance: a profile becomes a machine label, a post becomes a "while you wait" note, or an article becomes the reading material nobody expected.
- Use ordinary laundry props to frame the gag: detergent cap, coin slot, basket edge, folded towel, dryer sheet box, numbered machine label, or a waiting bench.
- Do not invent factual jokes, fake safety instructions, fake endorsements, fake reactions, or fake author claims. Generic prop text should be minimal and non-factual.
- Keep the X source card visually dominant and readable; the laundromat props are supporting atmosphere.

## Core Scene

1. The main focal object is a real washer, dryer, folding table, or laundromat wall:
   - a printed mini X source card taped to a washer door,
   - a sticky note above the coin slot,
   - a laminated card on a folding table,
   - a detergent-bottle label area carrying the exact author line,
   - or a post/article clipping reflected in dryer glass.
2. The X content must be physically present as paper, laminated stock, label, or glossy print. Show tape edges, paper curl, machine reflections, contact shadows, condensation-free glass, and slight wear on metal.
3. If `source_type` is `profile`, the card contains:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when short enough,
   - exact `profile.display_counts.text` in order when space allows,
   - strict flat bitmap avatar reference,
   - optional banner color strip as a machine label accent.
4. If `source_type` is `post`, the card contains:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text when short enough,
   - exact leading post excerpt when the post is too long,
   - quote facts only when `post.quote` exists and only from `card-context.json`,
   - attached media only as a small printed photo, card insert, or secondary clipping if local media exists.
5. If `source_type` is `article`, the card contains:
   - exact article title,
   - exact preview excerpt when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media as a small glossy clipping if present.
6. Laundry props may include a detergent bottle, folded towel, plastic basket, coin tray, machine number sticker, rolling cart, or waiting bench. They must not cover source text, avatar, counts, title, or media.
7. The X card is the sharpest readable object. Machines and props may form rhythmic circles and reflections around it.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON when visible.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- If source text is long, show a clean exact leading excerpt on the main card and move secondary exact facts to a smaller note or folded printout. Do not invent continuation text, summaries, laundry instructions, commentary, or punchlines.
- For profile counts, use `profile.display_counts.text` exactly and in order. Counts above 1,000 should already include K/M compact notation. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Make the main source text crisp, high-contrast, and readable as printed ink, neat marker, or label text. Glass reflections, machine glare, tape, towel edges, and detergent bottles must not obscure exact source text.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The avatar should look like a direct source-avatar bitmap reproduction printed on the source card or label, inside a clean circular X avatar mask.
- Match Reference Image A directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- Do not reinterpret the avatar to match laundromat lighting. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Machine reflections, paper texture, tape shine, chrome highlights, and shallow focus may affect the card surface around the avatar, but must not cover, recolor, blur, warp, relight, or distort the avatar interior.
- Do not render the avatar as a detergent mascot, laundry icon, hand drawing, sticker illustration, 3D badge, hologram, painted portrait, or enlarged hero face.
- If avatar fidelity is uncertain, keep the avatar smaller, flatter, front-facing, cleaner-edged, and closer to the original bitmap crop.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as small printed clippings, glossy inserts, or taped mini-photos. Keep visible media recognizable and do not invent new media.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI DNA through a compact author row, circular avatar, handle line, rounded card geometry, and clear source-card spacing, but the card must be a real physical note or printout in the laundromat.
- Avoid making the image look like a phone screenshot taped flat without material cues. Use real tape, paper, glass reflections, machine curvature, and contact shadows.

## Composition Variants

- Washer-door variant: the exact post is taped to the circular washer glass, with a clean ring framing the source card.
- Coin-slot variant: the author name, handle, avatar, and exact post excerpt sit above the coin slot like a strangely important machine label.
- Folding-table variant: a profile card lies beside folded towels and detergent, photographed from a casual overhead angle.
- Dryer-window variant: article title and preview are taped beside a dryer window, with a soft circular reflection behind it.
- Waiting-bench variant: a printed X source card sits on a laundromat bench next to a laundry basket, like unexpected reading material.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake laundry instructions, fake machine warnings, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, detergent mascot, machine icon, unrelated icon, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No holographic panels, translucent sci-fi cards, impossible floating UI, neon particles, signal beams, or random digital noise.
- No dirty, gross, unsafe, flooded, broken-machine, or humiliating laundry scene.
- No blurry, warped, melted, low-contrast, over-reflective, soap-smeared, or unreadable typography.
- No washer rims, dryer glass, tape, towels, detergent bottles, baskets, hands, coin slots, or reflections covering source text, avatar faces, profile counts, article title, or important attached-media content.
