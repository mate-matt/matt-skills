# Takeout Receipt Counter

Turn an X profile, post, or article into a humorous photorealistic cafe or takeout-counter poster: the X content appears as a receipt, order ticket, paper bag label, counter slip, or small menu-board card in a real food pickup scene. The joke is that the content has accidentally entered the daily economy of coffee orders and takeout receipts.

This structure is for lively urban realism, quick-discovery comedy, and small-object promotional charm. It should feel like a candid photo of a counter where an X source card is hiding in plain sight, not like a formal product ad or a flat screenshot.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a near-square, 4:5, or 3:4 poster that gives enough width for a receipt, cup, counter surface, and a readable X source card.
- If source text is long, expand both width and height into a wider counter composition. Do not make a narrow extra-tall strip.
- Use photorealistic cafe or takeout photography: paper receipt texture, thermal-printer ink, ceramic cup, kraft paper bag, taped order rail, pastry paper, counter scratches, soft window light, and warm interior depth.
- Palette should feel appetizing but restrained: warm counter wood or stone, white receipt paper, kraft brown, black thermal ink, X blue accents, and one accent color from the avatar, banner, or attached media.
- The humor should come from bureaucratic receipt/order-ticket framing. Avoid cartoon food props, meme fonts, exaggerated jokes, fake brand ads, glossy sci-fi UI, and impossible floating screens.

## Humor Engine

- Treat the X source as if it has been printed by the cafe system: a creator profile becomes a loyalty-card slip, a post becomes the order ticket everyone sees, or an article becomes the receipt headline.
- Use ordinary counter props to support the gag: cup sleeve, pickup number, napkin, pastry paper, paper bag fold, counter bell, receipt rail, or small clipboard.
- Do not invent factual jokes, fake prices, fake ratings, fake endorsements, fake comments, or fake author claims. Generic prop text may be very minimal and non-factual, but the X source must remain the only meaningful content.
- Keep the X source card visually dominant and readable; cafe/takeout props should frame it.

## Core Scene

1. The main focal object is a real cafe counter, takeout pickup shelf, or order-ticket rail:
   - a receipt-like printout carrying exact X source content,
   - a small X profile card taped to a paper bag,
   - a printed order ticket clipped to a rail,
   - a cup sleeve label carrying the exact author line,
   - or a menu-board side card containing article title and preview.
2. The X content must be physically present as receipt paper, sticker label, clipped card, or printed bag tag. Show paper curl, thermal print texture, tape edges, clip pressure, contact shadows, and counter reflections.
3. If `source_type` is `profile`, the receipt/card contains:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when short enough,
   - exact `profile.display_counts.text` in order when space allows,
   - strict flat bitmap avatar reference,
   - optional banner color strip as cup-sleeve or receipt-header accent.
4. If `source_type` is `post`, the receipt/card contains:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text when short enough,
   - exact leading post excerpt when the post is too long,
   - quote facts only when `post.quote` exists and only from `card-context.json`,
   - attached media only as a tiny printed thumbnail, bag sticker, or secondary clipped card if local media exists.
5. If `source_type` is `article`, the receipt/card contains:
   - exact article title,
   - exact preview excerpt when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media as a small glossy clipping if present.
6. Cafe/takeout props may include a cup, napkin, paper bag, tray, pastry paper, receipt printer edge, clipboard, or pickup shelf. They must not cover source text, avatar, counts, title, or media.
7. The X receipt/card is the sharpest readable object. Background staff, customers, menu boards, or shelves should be blurred, generic, and non-factual.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON when visible.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- If source text is long, show a clean exact leading excerpt on the main receipt/card and move secondary exact facts to a bag label or clipped mini-card. Do not invent continuation text, summaries, order descriptions, prices, ratings, commentary, or punchlines.
- For profile counts, use `profile.display_counts.text` exactly and in order. Counts above 1,000 should already include K/M compact notation. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Make the main source text crisp, high-contrast, and readable as printed thermal ink or clean card typography. Coffee cups, crumbs, tape, clips, counter glare, and receipt curl must not obscure exact source text.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The avatar should look like a direct source-avatar bitmap reproduction printed on the receipt/card or bag label, inside a clean circular X avatar mask.
- Match Reference Image A directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- Do not reinterpret the avatar to match cafe lighting. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Thermal paper texture, tape shine, clip shadows, cup sleeve fiber, and shallow focus may affect the card surface around the avatar, but must not cover, recolor, blur, warp, relight, or distort the avatar interior.
- Do not render the avatar as a cafe logo, food mascot, hand drawing, sticker illustration, 3D badge, hologram, painted portrait, or enlarged hero face.
- If avatar fidelity is uncertain, keep the avatar smaller, flatter, front-facing, cleaner-edged, and closer to the original bitmap crop.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as small printed thumbnails, bag stickers, or clipped mini-cards. Keep visible media recognizable and do not invent new media.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI DNA through a compact author row, circular avatar, handle line, rounded card geometry, and clean source-card spacing, but the card must be a real receipt, ticket, label, or clipped card.
- Avoid making the image look like a digital kiosk screen unless the user explicitly asks. The default is physical paper on a real counter.

## Composition Variants

- Receipt-prophecy variant: the exact post is printed like the most surprising line on a thermal receipt lying beside a coffee cup.
- Pickup-ticket variant: author name, handle, avatar, and exact post excerpt are clipped on an order rail above a paper bag.
- Bag-label variant: a profile card is taped to a kraft takeout bag like a strangely premium delivery label.
- Counter-slip variant: article title and preview appear on a small card beside a cup sleeve and napkin.
- Late-cafe variant: the counter is warmly lit at night, with the X source receipt sharply readable against soft cafe blur.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake order details, fake prices, fake ratings, fake brand partnerships, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, cafe logo, food label, unrelated icon, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No holographic panels, translucent sci-fi cards, impossible floating UI, neon particles, signal beams, or random digital noise.
- No dirty, gross, unsafe food-handling, spill-disaster, or humiliating service scene.
- No blurry, warped, melted, low-contrast, over-reflective, coffee-smeared, grease-smeared, or unreadable typography.
- No cups, napkins, clips, paper bags, receipt curls, crumbs, hands, counter glare, or background menu boards covering source text, avatar faces, profile counts, article title, or important attached-media content.
