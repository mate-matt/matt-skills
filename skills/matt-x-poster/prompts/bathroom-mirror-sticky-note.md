# Bathroom Mirror Sticky Note

Turn an X profile, post, or article into a humorous photorealistic bathroom-mirror poster: the X content appears as a morning sticky note, small mirror card, toothbrush-cup label, or countertop reminder in a real bathroom. The joke is that a piece of X content has somehow become the first life advice someone sees after waking up.

This structure is for quiet visual comedy, intimate morning atmosphere, and believable domestic photography. It should feel surprising and funny, not like a meme template, flat screenshot, sci-fi UI, or explicit bathroom scene.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a vertical 4:5, 3:4, or 9:16 poster when the mirror reflection is important; use a near-square crop when the sticky note and countertop objects need more room.
- Use a photorealistic bathroom photography look: fogged mirror, ceramic sink, toothbrush cup, toothpaste tube, towel texture, warm vanity light, soft daylight, mild steam, and believable lens softness.
- Use a calm morning palette: warm white tile, muted cream towel, brushed metal, soft gray mirror fog, clean X blue accents, and one subtle accent color derived from the avatar, banner, or attached media.
- The scene should be funny through placement and contrast. Avoid exaggerated cartoon comedy, meme fonts, slapstick props, CGI plastic surfaces, neon sci-fi effects, and impossible floating interfaces.

## Humor Engine

- Treat the X source as an oddly serious morning reminder: a creator identity, post, or article has been placed where someone expects toothpaste, skincare notes, or a daily affirmation.
- Keep the humor dry and visual. The bathroom is ordinary and realistic; the X content is unexpectedly important.
- Do not invent jokes, captions, comments, reactions, or fake annotations. The real source text and placement create the joke.

## Core Scene

1. The main focal object is a bathroom mirror with one or more physical paper surfaces attached to it:
   - a yellow sticky note,
   - a small white mirror card,
   - a printed mini X source card taped to the mirror,
   - a waterproof label near the toothbrush cup,
   - or a small countertop reminder card leaning against a soap dish.
2. The X content must be physically present in the bathroom, not floating as a digital overlay. Show tape, paper edge, slight curl, condensation, contact shadow, and real mirror reflections.
3. If `source_type` is `profile`, the mirror note/card contains:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when short enough,
   - exact `profile.display_counts.text` in order when space allows,
   - strict flat bitmap avatar reference,
   - optional tiny banner color strip as tape, card header, or toothbrush-cup label accent.
4. If `source_type` is `post`, the mirror note/card contains:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text when short enough,
   - exact leading post excerpt when the post is too long,
   - quote facts only when `post.quote` exists and only from `card-context.json`,
   - attached media only as a small printed mini-photo or secondary card if local media exists.
5. If `source_type` is `article`, the mirror note/card contains:
   - exact article title,
   - exact preview excerpt when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media as a tiny printed clipping if present.
6. The bathroom objects should support the gag without covering facts: toothbrush cup, toothpaste cap, skincare bottle, towel, soap, comb, razor cover, small tray, water droplets, and mirror fog.
7. The X note/card should be the sharpest readable object. The background reflection can be soft, steamy, and atmospheric.

## Mirror Reflection And Adult Figure

- In the mirror background, include a tasteful, soft, steamy reflection of one clearly adult curvy woman in a bathing or post-shower context.
- The reflection should be beautiful but secondary: fogged mirror softness, warm vanity light, gentle silhouette, wet hair or towel/robe suggestion, and relaxed morning mood.
- Keep the figure non-explicit and non-nude. Use an opaque towel, robe, camisole, or steam-obscured shoulders and upper body. No visible nipples, areola, genitals, crotch focus, transparent clothing, or sexual act implication.
- The adult figure should remain blurred, partially reflected, cropped, or obscured by steam so the focus stays on the X sticky note/card.
- The figure must not cover the source text, avatar, author line, handle, or media. If the reflection competes with text readability, make the reflection softer and farther back.
- Do not make the subject teen-coded, doll-like, asleep, coerced, distressed, injured, dirty, or ambiguous in age.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON when visible.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- If source text is long, show a clean exact leading excerpt on the main sticky note/card and move secondary exact facts to a smaller card, mirror label, or countertop reminder. Do not invent continuation text, summaries, or fake note captions.
- For profile counts, use `profile.display_counts.text` exactly and in order. Counts above 1,000 should already include K/M compact notation. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Make the main source text crisp, high-contrast, and readable as marker, pen, or printed ink on paper. Condensation, mirror fog, water droplets, steam, towel shadows, and shallow focus must not obscure exact source text.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The avatar should look like a direct source-avatar bitmap reproduction printed on the sticky note, mirror card, or small X source card, inside a clean circular X avatar mask. It may read as a small printed photo sticker only because it is physically printed, not because it has been redrawn.
- Match Reference Image A directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- Do not reinterpret the avatar to match bathroom lighting. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Mirror fog, paper fibers, tape shine, water droplets, vanity light, reflection blur, and countertop shadows may surround the avatar or touch the outer card surface, but they must not cover, recolor, blur, warp, relight, or distort the avatar interior.
- Do not render the avatar as a bathroom selfie, reflected person, soap label mascot, hand drawing, sticker illustration, 3D badge, glass coin, hologram, painted portrait, or enlarged hero face.
- If avatar fidelity is uncertain, keep the avatar smaller, flatter, front-facing, cleaner-edged, and closer to the original bitmap crop.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as tiny printed clippings, mini-photo cards, or a phone sliver on the countertop. Keep visible media recognizable and do not invent new media.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI DNA through a tiny author row, circular avatar, handle line, rounded card geometry, and clean source-card spacing, but the card must be physically taped, stuck, or placed in the bathroom.
- Avoid making the image look like a phone screenshot pasted flat over a mirror. Use real paper, tape, condensation, and reflection cues.

## Realistic Lighting And Materials

- Use believable bathroom lighting: warm vanity bulbs, soft daylight from a small window, gentle steam diffusion, mirror haze, and realistic specular highlights on ceramic and metal.
- Keep the sticky note/card sharp and slightly forward of the reflection. The reflected adult figure, shower area, towel, and bathroom depth can be soft.
- Use real material cues: paper curl, transparent tape edge, wet ceramic sink, chrome faucet, toothbrush bristles, toothpaste plastic, towel weave, mirror fog, tiny water droplets, and soft countertop clutter.
- Keep glare, droplets, towel edges, fingers, bottles, and mirror scratches away from source text, avatar faces, and important media.

## Composition Variants

- Morning prophecy variant: the exact post appears on a yellow sticky note on the fogged mirror, like an absurd daily affirmation.
- Toothbrush-label variant: the author name, handle, and avatar appear as a small printed label near the toothbrush cup, while the post text sits on a mirror card.
- Countertop reminder variant: a small X card leans beside the sink, with the steamy adult reflection blurred in the mirror behind it.
- Profile routine variant: profile name, handle, bio, exact counts, and avatar are arranged like a strangely formal bathroom checklist.
- Article vanity variant: article title and preview appear on a taped mirror card, as if the bathroom mirror has become an editorial briefing board.

## Negative Constraints

- No minors, teen-coded subjects, childlike body proportions, school styling, youth styling, or ambiguous age.
- No nudity, exposed nipples or areola, visible genitals, transparent clothing, crotch focus, explicit sexual pose, fetish framing, pornographic lighting, or sexual act implication.
- No making the reflected adult figure the main subject. The X note/card is the focal object.
- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake bathroom captions, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, reflected face, bathroom selfie, soap-label mascot, unrelated icon, or loosely inspired illustration.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No holographic panels, translucent sci-fi cards, impossible floating UI, neon particles, glass shards, abstract signal beams, or random digital noise.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, water-smeared, or unreadable typography.
- No condensation, water droplets, steam, reflection glare, hands, toothbrushes, towels, bottles, or body reflection covering source text, avatar faces, profile counts, article title, or important attached-media content.
