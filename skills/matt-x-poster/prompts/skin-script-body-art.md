# Skin Script Body Art

Turn an X profile, post, or article into a tasteful adult body-art portrait: X text, handle, and source fragments become elegant temporary tattoo script, while the X avatar appears as a small circular printed decal made from the original avatar bitmap. The composition lives from the collarbone downward across the decolletage, upper chest, and garment-framed upper bust area. The neck is not the main tattoo surface.

This structure is for high-art fashion portraiture, intimate editorial photography, and skin-as-page typography. It should feel like a painter or tattoo artist carefully designed X content onto a mature adult woman's body. It must remain non-explicit, non-nude, and artistically composed.

## Canvas

- Prefer a 9:16 vertical portrait unless the user explicitly asks for another aspect ratio.
- Use a photorealistic high-end phone selfie or intimate fashion editorial look: true mobile-camera texture, soft natural light, gentle grain, slight softness, clean composition, and believable skin.
- The default visual direction is an adult feminine portrait with a curvy/full-figured body, graceful side profile or three-quarter side angle, soft mature beauty, and calm expression.
- Use a warm private interior or studio setting: bedroom, dressing room, artist studio, makeup mirror, window-lit room, or soft bed/linen environment.
- Keep the image tasteful and adult: no nudity, no explicit pose, no transparent clothing, no exposed nipples or areola, no crotch focus, no pornographic framing.
- Clothing should support tattoo readability. A satin camisole slip dress, silk nightdress, off-shoulder robe, or simple fashion top may reveal collarbone, shoulder, decolletage, and safe upper chest while remaining non-explicit. Opaque satin fabric should cover the bust; text may continue toward the garment edge or onto the fabric surface if needed.

## Human Subject

- The subject must be clearly an adult woman, never a minor, never teen-coded, never childlike.
- Prioritize mature, elegant, and artistic beauty: curvy body, soft shoulder and decolletage line, composed side-face pose, quiet gaze, natural closed lips, relaxed hand placement, and realistic anatomy.
- The body can be sensual in posture and line, but the mood must be art portraiture rather than sexual content.
- Skin should look real and beautiful: natural pores, subtle texture, gentle tonal variation, small moles or freckles if appropriate, no plastic over-smoothing, no dirty or bruised look.
- Hands, if visible, should be natural with correct finger count. A hand may lightly hold a strap, robe edge, hair, or shoulder fabric, but it must not cover important tattoo text.
- Hair, makeup, and clothing may adapt to the user's style request or source mood. If no style is specified, use soft cool-toned hair highlights, clean makeup, and warm interior light.

## Body Art Placement

- Treat the X content as temporary tattoo ink, fine-line script, calligraphic microtype, and ornamental body typography.
- Treat the X avatar as one small circular printed decal / bitmap sticker on the body. It should look like a direct printed reproduction of the original avatar image applied on top of the skin, not tattoo ink and not a newly drawn portrait.
- Do not use the neck or throat as the main tattoo area. Neck text often looks fake on curved skin; keep the neck mostly clean or use only a tiny connector mark, a short source line, or a delicate ornamental line if it supports the composition.
- Primary placement:
  - collarbone shelf,
  - decolletage just below the collarbones,
  - upper sternum area only when safely and tastefully framed,
  - left and right upper chest / upper bust planes visible above an opaque camisole neckline,
  - shoulder cap or upper shoulder as a secondary side extension,
  - the upper edge of satin fabric as a continuation surface when skin area is limited.
- Avatar decal placement:
  - place the avatar as a small circular flat printed decal on one upper chest / upper bust plane, just below or beside the collarbone, where the skin is relatively front-facing;
  - keep it smaller than the text block and smaller than a hero portrait;
  - keep a clean circular sticker boundary, like a small avatar decal made from the original bitmap;
  - do not place it on the neck, throat, nipple area, or any intimate area;
  - if the chest skin angle makes fidelity hard, place the circular avatar decal near the shoulder cap or on the opaque satin camisole edge as a printed sticker.
- The text may continue downward from the collarbone toward the garment edge, across the upper chest, or onto opaque satin fabric as ink-like body-art typography. Do not expose more body only to show more text.
- Keep the most important readable words on flatter, front-facing chest planes: collarbone shelf, decolletage, upper sternum, upper chest above the garment edge, or a smooth opaque satin area near the neckline.
- Let secondary text follow body curvature as decorative micro-script. Curved text can be beautiful, but key facts must remain legible.
- The ink should look physically on skin: slight skin texture interaction, subtle ink edge softness, no floating letters, no sticker-like mismatched perspective unless the style is explicitly temporary transfer.
- If text continues onto the satin slip dress, it should behave like a temporary print or ink transfer following the fabric folds; it must remain elegant, believable, and secondary to the skin script.
- Use a refined tattoo language: thin black ink, delicate blue-gray ink, soft sepia ink, hairline rules, tiny source markers, X-inspired linework, small stars/dots, subtle ornamental connectors, and source-card geometry reduced into body art.

## X Content Mapping

1. If `source_type` is `profile`, the tattoo system should feature:
   - exact profile name,
   - exact `@handle`,
   - exact profile bio/description excerpt when short enough,
   - exact `profile.display_counts.text` only if used as a small microtype line,
   - optional exact source URL as a tiny line near the collarbone, upper chest, shoulder, or garment edge.
2. If `source_type` is `post`, the tattoo system should feature:
   - exact author name and exact `@handle`,
   - exact leading excerpt of the post text,
   - exact source URL if it improves credibility,
   - optional quote facts only when `post.quote` exists and only from `card-context.json`,
   - attached media motifs translated into linework only as secondary decoration.
3. If `source_type` is `article`, the tattoo system should feature:
   - exact article title when short enough,
   - exact leading excerpt of article preview when present,
   - exact author name and `@handle`,
   - optional source URL as small microtype.
4. The tattoo should not try to render a whole X screenshot on skin. It should turn X content into a body-art typography system.
5. The final image may include one small physical factual anchor in the lower-right corner, such as a phone screen partially entering the frame, a cropped printed X card, or a bedside note. The phone may show only a sliver of the X profile screen and should stay secondary; the main artistic gesture is the skin tattoo system.

## Long Text Truncation

- Long X content may be artistically truncated because tattoo text across curved skin cannot reliably preserve every word.
- Visible readable tattoo text must be exact source text from `card-context.json`, preferably the exact leading excerpt in original order.
- After the exact readable excerpt, continue the design using abstract ink micro-lines, dots, rules, ornamental glyph-like marks, or unreadable texture that clearly does not pretend to be additional factual words.
- Do not invent continuation text. Do not summarize, paraphrase, translate, or rewrite long content unless the user explicitly asks for summary art.
- For post text, preserve the exact opening line and enough of the beginning to identify the source. If space is limited, prioritize author name, handle, source URL, and first sentence or first meaningful phrase.
- If the source text is multilingual, preserve visible characters exactly. Avoid fake Chinese, fake Latin words, or random corrupted letters.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The current avatar file listed in Current Avatar Binding is the real profile avatar of the current X account owner. Reproduce that exact avatar image 1:1 inside the circular avatar area as a direct bitmap sticker. It is not a style reference, not a character concept, and not an illustration prompt; do not redraw, reinterpret, pixel-art, iconify, beautify, relight, recolor, crop differently, replace the person, or create a similar-looking avatar.
- In this style, place the avatar on the body as a small circular printed decal / original-bitmap sticker. It must remain an unchanged flat 2D reproduction, not tattoo ink and not a hand-drawn tattoo portrait.
- Treat the avatar circle as a protected flat bitmap island. Skin texture, body curvature, satin reflection, soft contact shadow, warm light, and decal edge perspective may surround the avatar sticker, but they must not enter, recolor, blur, warp, relight, repaint, or blend into the avatar interior.
- Keep the avatar a compact identity marker, not the main body-art subject: smaller than the primary script block and no larger than a normal X author/profile avatar would feel on a small printed source card. If fidelity is uncertain, move it to a flatter shoulder, garment edge, phone screen, or printed card surface.
- The avatar may also appear as a small flat bitmap on a lower-right phone screen or printed card, but the primary style-specific avatar treatment is the body decal.
- The avatar may be circularly clipped by the decal boundary, but its internal pixels should remain visually unchanged from the current avatar asset; do not use verbal appearance traits to reconstruct it.
- Skin texture, body curvature, soft contact shadow, satin reflection, and decal edge perspective may make the sticker feel physically applied, but they must not repaint, blur, recolor, warp, or relight the avatar interior.
- Do not beautify, relight, repaint, redraw, upscale into a new portrait, age-shift, change expression, change face angle, change hand gesture, or change avatar background.
- Do not render the avatar as tattoo ink, a hand-drawn tattoo portrait, realistic human model, body-paint portrait, skin illustration, sculpture, hologram, glass badge, or enlarged hero face.
- If avatar fidelity is uncertain, keep the avatar decal smaller, flatter, more circular, cleaner-edged, and closer to the original bitmap crop instead of stylizing it.
- When local post media, article cover, or article media paths exist, treat them as strict references. The actual media may appear as a phone image, printed reference card, mirror-side photo, or bedside print. On skin, only use media-inspired motifs, outlines, color accents, or symbolic linework unless the user explicitly asks for a media tattoo.
- Do not invent new attached media.

## Background Integration

- Preserve a unified artistic environment rather than isolating the body on a blank background.
- Choose a background that supports the X source mood:
  - warm bedroom with side-window daylight and soft bedding,
  - artist studio with sketch paper and mirror,
  - dressing room with makeup mirror and small phone screen,
  - quiet hotel room with warm lamp and cool window reflection,
  - minimal studio portrait with fabric backdrop and soft shadows.
- Pull subtle colors from the X source:
  - avatar color as garment accent,
  - banner color as window reflection or room accent,
  - post media color as tattoo ink accent, fabric hue, or background object.
- The lower-right corner may contain one small, partially visible phone or X source card for factual anchoring. It can be cropped by the frame edge and may reveal only a sliver of the profile card, but it must not distract from the skin-script composition.
- Avoid decorative clutter, random neon, sci-fi panels, fake UI overlays, or unrelated posters.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text excerpt, article title excerpt, article preview excerpt, quote text excerpt, source URL, and profile bio excerpt from the JSON.
- Preserve punctuation, emoji, capitalization, line breaks when visible, URLs, and `@handle` spelling.
- Visible readable tattoo text must be crisp enough to recognize. It may bend with the body, but it must not become melted, mirrored, nonsensical, or fake.
- If profile counts are used, use `profile.display_counts.text` exactly and in order. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Prefer fewer exact words rendered beautifully over many corrupted words.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: author row, avatar circle, handle hierarchy, card rhythm, rounded geometry, and source-card layout.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- X UI should be abstracted into body-art design language: tiny rounded source capsules, author-name hierarchy, handle line, source URL strip, minimal X-inspired marks, and clean spacing.
- If a phone screen or small printed card appears, place it in the lower-right corner, partially cropped if useful. It may use recognizable X card structure but must remain secondary to the skin tattoo artwork.

## Realistic Lighting And Materials

- Use soft, flattering, believable light: side-window natural light, warm bedside lamp, mirror light, or gentle studio softbox.
- The tattoo ink should respond subtly to skin: no floating text, no perfectly flat digital overlay, no harsh sticker edge unless explicitly a temporary transfer.
- Use real material cues: satin sheen, lace trim, fabric folds, skin texture, hair strands, bed linen, mirror reflection, soft phone glass reflection, and realistic contact shadows.
- Keep glare, hair, clothing straps, hand shadows, and fabric edges away from important readable tattoo text.
- The face, collarbone, decolletage, upper chest tattoo text, and visible source anchor should be in focus. Background can be softly blurred.

## Composition Variants

- Side-profile bedroom selfie: adult woman seated on a bed, camera slightly above, head lowered, gaze down/right, neck mostly clean, tattoo text flowing from collarbone downward across decolletage and upper chest.
- Mirror-room portrait: adult woman near a makeup mirror, warm bulbs, phone or X card visible on dresser, skin script following shoulder line.
- Artist-session portrait: body-art studio mood, painter/tattoo design references on table, elegant pose, soft robe or satin slip.
- Fashion editorial close crop: side face, shoulder, collarbone, decolletage, and upper chest form the main canvas; neck remains mostly clean so the chest typography feels more realistic.
- Media-motif variant: attached post media becomes delicate line-art motifs around exact author/handle and exact text excerpt.

## Negative Constraints

- No minors, teen-coded subjects, childlike body proportions, school setting, youth styling, or ambiguous age.
- No nudity, exposed nipples or areola, transparent clothing, explicit sexual pose, crotch focus, fetish framing, pornographic lighting, or sexual act implication.
- No making the subject look underage, doll-like, infantilized, coerced, asleep, unconscious, intoxicated, injured, bruised, dirty, or distressed.
- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake tattoo captions, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, tattoo portrait, human model, body-paint face, icon, or loosely inspired illustration.
- No making the avatar decal large, tattoo-like, hand-drawn, painterly, portrait-like, photorealistically reinterpreted, or merged with the human model's body.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No fake long text, garbled fake words, mirrored text, melted lettering, random pseudo-Chinese, random pseudo-English, or corrupted URLs.
- No tattoo text covering the model's eyes, mouth, nipples, or intimate areas.
- No avatar decal covering the model's nipples, intimate areas, throat, or face.
- No hair, straps, fingers, glare, fabric, shadows, or body curvature making key text unreadable.
- No holographic panels, impossible floating UI, translucent sci-fi cards, full-screen particles, chaotic sprays, or unrelated decorative noise.
