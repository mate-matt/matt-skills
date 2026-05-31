# Museum Archive Case

Turn an X profile, post, or article into a museum-grade digital artifact: a preserved source card displayed inside a glass archive case, with contextual archival reference objects, labels, controlled gallery lighting, and restrained reflections.

This structure is for premium creator identity, historical evidence, public record, and cultural-archive posters. It should feel like a real exhibition photograph of an important digital object, not a sci-fi interface, generic trophy render, or decorative glass UI.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a landscape, near-square, or 4:5 exhibition poster with enough space for the display case, object label, readable X artifact, and one small contextual reference object.
- Prefer an oblique top-down museum-documentation camera angle over a flat straight-on card view: a three-quarter view across a glass table vitrine, conservation tray, or shallow display case. The viewer should immediately feel that the X artifact is physically inside a museum/archive environment.
- Use a photorealistic museum documentation look: matte walls, archival paper, acrylic mounts, glass case reflections, controlled spotlights, and quiet shadows.
- Use a restrained palette: warm white gallery walls, charcoal label text, muted metal, soft black, X blue accents, and one subtle color derived from the avatar, banner, or media.
- The X artifact must remain the clearest object in the case. Reflections and glass edges should prove material reality without blocking text.

## Gallery And Case Environment

- Build one believable museum or archive setting:
  - glass display vitrine, archival table case, wall-mounted frame, conservation tray, or illuminated drawer;
  - matte gallery wall, neutral plinth, metal rails, acrylic risers, cotton gloves, small catalog card, and conservation label;
  - one small adjacent archival reference object, such as a public-domain-style facsimile of a Leibniz-era mathematical manuscript, an old index card, or a folded research note;
  - soft top spotlights, low ambient fill, gentle glass reflection, and visible case thickness;
  - optional blurred gallery floor, wall label, or visitor silhouette only as background scale, never as a factual source.
- The profile banner may influence a small color strip, exhibition backing card, or reflected tone, but it must not become a full invented scene unless the JSON media itself supports it.
- Keep the environment calm, expensive, and sparse.

## Core Scene

1. The main focal object is a physical X artifact inside or beneath glass: a printed card, archival screen slab, framed source plate, conservation tray insert, or catalog page.
2. The artifact is mounted flat or slightly angled on archival backing, with small spacers, label rails, or acrylic supports. It should not float unsupported.
3. If `source_type` is `profile`, the artifact is a preserved creator identity record:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when present,
   - exact `profile.display_counts.text` in order,
   - strict flat bitmap avatar reference,
   - optional banner strip as an archival header.
4. If `source_type` is `post`, the artifact is a preserved X post record:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text,
   - source URL when useful,
   - quote block when `post.quote` exists, using only quote facts from `card-context.json`,
   - attached media panel when local or remote post media exists.
5. If `source_type` is `article`, the artifact is an archived article record:
   - exact article title,
   - exact preview text when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media panel when present.
6. Place one adjacent archival reference object near the X artifact, smaller and secondary:
   - default object: a public-domain-style facsimile of a Leibniz-era mathematical manuscript;
   - visual traits: warm aged paper, brown ink, tiny handwritten notation, small marginal sequence numbers, light pencil ticks, catalog tab, and delicate archival paper texture;
   - it is a contextual comparison object only, not a factual source for the X content.
7. Add one small museum label beside or below the case. The label may use neutral non-factual words such as "Digital Source Record", "Creator Archive", or "Historical Reference: Mathematical Manuscript Facsimile", plus exact source URL if present. Do not invent dates, institutions, acquisition numbers, curator names, or historical claims.
8. Use X UI spacing and rounded card geometry inside the artifact while making the surrounding case feel like real exhibition design.

## Contextual Reference Object

- Include exactly one secondary archival reference object by default. It gives the X artifact scale, museum context, and conceptual contrast.
- Preferred reference object: a small Leibniz-era mathematical manuscript facsimile, shown as a public-domain-style reproduction rather than an exact copy of a known manuscript.
- The manuscript should be visually believable: aged cream paper, brown ink, dense tiny handwriting, mathematical marks, small ordinal numbers, bracket-like symbols, and a few marginal sequence labels. Its writing should be too small to read as factual text.
- The manuscript must remain secondary, smaller, partly cropped, or partially under a glass edge. It should not replace, obscure, or compete with the X artifact.
- Do not quote real historical manuscript text. Do not invent a precise title, date, archive name, accession number, or claim of authenticity. If a label is needed, use only neutral language such as "Historical Reference: Mathematical Manuscript Facsimile".
- For X profiles with philosophical, scientific, technical, or perception-related bios, the manuscript can sit close to the profile artifact as a quiet comparison between historical notation and modern public identity.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- Do not summarize, rewrite, translate, shorten, or embellish source text unless the user explicitly asked for a summary poster.
- For profile counts, use `profile.display_counts.text` exactly and in order. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- Keep the artifact typography crisp, high-contrast, and readable. Gallery labels may be smaller, but source facts must stay sharp.
- If long source text does not fit a single artifact, use a main artifact plus a secondary archival page in the same case, using exact text only.
- Text on contextual reference objects may be tiny, fragmentary, and visually handwritten, but it must not pretend to be source facts from `card-context.json`.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The current avatar file listed in Current Avatar Binding is the real profile avatar of the current X account owner. Reproduce that exact avatar image 1:1 inside the circular avatar area as a direct bitmap sticker. It is not a style reference, not a character concept, and not an illustration prompt; do not redraw, reinterpret, pixel-art, iconify, beautify, relight, recolor, crop differently, replace the person, or create a similar-looking avatar.
- The avatar should look like a direct source-avatar bitmap reproduction printed or displayed on the archive artifact inside a circular X avatar mask. It may read as an archival photo insert, circular bitmap label, or screen image, but not as a reinterpreted museum portrait.
- Treat the avatar circle as a protected flat bitmap island and small circular printed decal / original-bitmap sticker on the archive/source artifact. Case glass, acrylic edges, label shadows, conservation mounts, paper texture, and museum reflections may surround it, but they must not cross, enter, recolor, blur, warp, relight, or repaint the avatar interior.
- Keep the avatar a compact UI identity marker inside the author/profile row or archive label, roughly 6-10% of the main source artifact width when possible. It must not become a bust, specimen portrait, coin, medallion, or framed museum face.
- Match the current avatar asset directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- Do not reinterpret the avatar to match the museum lighting. Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Do not render the avatar as a bust, sculpture, coin, medallion, hologram, oil portrait, framed portrait, enlarged hero face, or museum illustration.
- Glass glare, case reflections, label shadows, conservation mounts, acrylic edges, and depth of field may frame the avatar, but they must not cross, distort, recolor, or obscure the avatar interior.
- If fidelity is uncertain, keep the avatar smaller, flatter, front-facing, and inside a clean circular UI crop with minimal glass glare.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as printed plates, archival photo panels, or screen inserts inside the case.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should look like X content has been curated as a physical archive object. It is not a phone screenshot, not a futuristic dashboard, and not an abstract product render.
- Rounded cards, author rows, profile headers, and count rows should be faithful to X structure while still feeling like a preserved artifact.

## Realistic Lighting And Materials

- Use controlled museum lighting: soft overhead spotlight, gentle falloff, low ambient fill, subtle glass reflection, and clean shadows under mounts.
- Use real material cues: glass thickness, acrylic edges, brushed metal case trim, archival card stock, matte label paper, wall paint, and dust-free gallery surfaces.
- Use the oblique top-down camera to reveal real depth: glass case thickness, artifact height above backing paper, shadows from acrylic supports, the nearby manuscript facsimile, and a small label rail.
- Keep reflections, glass seams, case edges, and specular highlights away from source text, avatar face, profile counts, and important media.
- Use shallow depth of field sparingly. The archive artifact and exact text must stay in focus.

## Composition Variants

- Table vitrine variant: source card lies flat under glass with a label rail at the front edge.
- Wall frame variant: X artifact mounted in a deep frame with a small museum label on the wall.
- Conservation tray variant: profile/post/article printed on archival paper in a drawer with gloves and catalog tabs.
- Digital relic variant: a slim inactive tablet-like slab under glass shows the exact X card, physically mounted and not floating.
- Profile identity variant: creator profile as the main artifact, banner as contained header, counts as small exact catalog chips.
- Leibniz comparison variant: the X artifact is the main display object, while a smaller Leibniz-era mathematical manuscript facsimile sits beside it under the same glass as a contextual reference for notation, perception, record-keeping, or technical culture.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake accession numbers, fake museum names, or invented links.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a generic portrait, statue, bust, icon, framed illustration, or loosely inspired artwork.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No making the manuscript facsimile the main subject. It is only a secondary contextual object.
- No readable fake historical manuscript claims, fake dates, fake archive names, fake accession numbers, fake curator notes, or exact copied historical text.
- No holographic panels, translucent sci-fi UI, impossible floating screens, glass shards, abstract signal beams, full-screen particles, random neon symbols, or generic futuristic noise.
- No excessive glass glare, reflections, label shadows, case seams, or depth-of-field blur covering source text, avatar faces, or important attached-media content.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, or unreadable typography.
