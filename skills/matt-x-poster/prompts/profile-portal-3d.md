# Profile Portal 3D

Create a cinematic 3D promotional poster for an X creator's content. The composition should feel like a premium product launch visual and a liquid-glass sci-fi editorial poster, not a flat social screenshot.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks. Choose an adaptive poster canvas based on content length.
- For long posts, expand both width and height into a broad readable editorial canvas. Do not solve long text by making a narrow extra-tall strip. Prefer a landscape or near-square poster with generous width, multi-column text panels, and a balanced hero/media area.
- Give long text enough horizontal measure, line spacing, and panel width to stay readable without turning the poster into a thin scroll screenshot.
- Use a high-resolution, editorial 3D render look with clean lighting, shallow depth of field, precise UI surfaces, and controlled contrast.
- Use a modern palette anchored by X blue, white, deep graphite, soft cyan light, and subtle liquid-glass reflections.
- Set the poster in one concrete, clean, photorealistic scene such as a cafe table, neat creator work desk, rainy window-side desk, grass or park bench, or a cinematic space-station/outer-space work surface. The scene should be calm and believable, not an abstract noisy particle background.

## Core Scene

1. Place a realistic smartphone screen or glass slab in the lower third of the image, tilted in perspective and lying almost flat on a reflective surface.
2. On that lower screen, show the creator's X profile page using the real profile data from card-context.json:
   - banner region at the top,
   - circular avatar overlapping the banner,
   - display name,
   - exact @handle,
   - short bio/description when present,
   - profile counts in the exact order declared by `profile.display_counts` and `prompt_guards`; use Following then Followers only, with no posts count in this profile row,
   - tab row and vertical feed rhythm.
3. The lower screen may show the selected post as a small in-feed card, but it should remain secondary and atmospheric.
4. From the selected post area on the profile screen, make the content rise toward the hero card as a controlled, physically plausible stream of blue-white particles, liquid glass droplets, and tiny refractive shards. The stream must be localized between the phone screen and the content area; it must not fill the whole image.
5. At the upper focal point, do not simply make another normal X card. Instead, build a bold elevated hero composition:
   - a large readable liquid-glass content card using the exact post text or article title;
   - a crisp author identity capsule with exact name, exact @handle, and avatar;
   - the real attached post media or article cover inside a floating glass frame, curved display, or holographic panel;
   - layered depth, with text, avatar, and media at slightly different z-depths;
   - enough X card DNA to feel related to X, but arranged as a cinematic promotional poster rather than a literal screenshot.
6. If source_type is profile, render a creator identity hero with the exact profile name, @handle, bio/description, avatar, banner relationship, and display counts.

## Text And Data Fidelity

- Render the exact X text from card-context.json. Preserve Chinese, English, emoji, punctuation, line breaks, and @handle spelling.
- Do not summarize the post unless the user explicitly asks for a summary poster.
- Do not invent new post text, metrics, usernames, badges, dates, or images.
- Prefer local media paths from card-context.json when available; otherwise use the original media URLs as provenance.
- If there is too much text for a beautiful composition, split the exact text across two or three adjacent readable panels, multi-column blocks, or layered typographic planes. Increase poster width as well as height. Still use only exact source text.
- For profile counts, obey `profile.display_counts.text` and `prompt_guards` exactly. X profile count row order is Following first, Followers second. Counts above 1,000 should appear with compact K/M suffixes as supplied by `profile.display_counts.text`; never render raw unformatted follower counts, never swap the numeric values, and do not add a posts count to that row.

## Readable Typography

- Source text must be crisp and easy to read at social-feed size.
- Prefer solid high-contrast Chinese typography on glass panels: white or near-white fills, clean cyan edge light, subtle 3D bevels, and controlled shadow.
- Keep the face of each Chinese character flat enough to read. Put reflections, chrome, glass refraction, and liquid effects around the characters, not across their main strokes.
- Use generous line spacing, clear grouping, and uncluttered negative space around text.
- Do not let rain streaks, particles, droplets, shards, glow, or source media overlap the exact text.
- Avoid mirrored, warped, melted, broken, tiny, low-contrast, blurry, over-extruded, or heavily refracted text.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image. The avatar inside the X UI must look like a direct circular crop of that local image, not a newly invented portrait.
- Preserve the exact subject type, face shape, pose, crop, accessories, held objects or visible text, color/monochrome treatment, photo/illustration/pixel style, and background mood from the avatar file. Do not turn an animal avatar into a human, a photo into a generic illustration, or a distinctive avatar into a generic icon.
- If the avatar is enlarged as a glass medallion, holographic coin, circular identity badge, or small 3D portrait disc near the hero text, keep it faithful to the same source image. If fidelity is uncertain, keep the avatar smaller and flatter rather than stylizing it.
- When post media local paths exist, treat them as strict media references. The media may be reframed inside glass, rain, holographic, or 3D perspective treatment, but visible source content should remain recognizable.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`. These references are only for structure: spacing, hierarchy, rounded card geometry, profile header proportions, bottom navigation rhythm, and typography weight.
- Do not copy screenshot content or screenshot media from the references.
- The background profile screen may be slightly defocused, but its profile structure must remain recognizable.
- The elevated hero composition should be sharper, bigger, and more expressive than the background screen.

## Adaptive Atmosphere

- Do not use the profile banner as the overall poster background. The global background should be newly designed for the poster and should harmonize with the liquid-glass theme.
- The profile banner may appear only inside the small X profile screen if helpful, and even there it can be simplified so it does not constrain the whole composition.
- Choose one concrete background scene and keep it clean: cafe table, neat creator desk, rainy window-side desk, grass or park bench, or a realistic space-station/outer-space work surface. The background should have real surfaces, depth, and lighting, with enough negative space for the content.
- Let the post topic influence small props and lighting while keeping facts unchanged. Avoid busy abstract backgrounds, full-screen particle fields, and decorative clutter.
- Keep the lower phone profile faithful enough to be recognized as the source context, but let the surrounding world become more dramatic and poster-like.

## 3D Particle Direction

- Particles originate from the selected content region on the profile screen.
- Use a restrained stream of tiny blue-white luminous particles, short motion trails, liquid-glass droplets, micro glass fragments, and thin light ribbons.
- The particle stream should carve a path from the lower profile screen into the upper hero composition.
- The particle stream should occupy only the path between the screen and content card, like a focused transfer beam or physical materialization trail. Leave the rest of the background clean.
- The particles should not hide the real text or source media.
- Keep the effect elegant, sparse, directional, and technical, not chaotic or full-screen.

## Camera And Lighting

- Use a low front three-quarter camera angle looking across the tilted phone screen toward the floating card.
- Use cinematic depth of field: background phone/profile slightly soft, floating post/article card crisp.
- Use soft studio key light, blue rim light, and subtle caustic reflections on the surface.
- Keep the final image clean enough for social sharing and easy reading, but make the elevated content bold, spacious, and attention-grabbing.

## Negative Constraints

- No fake comments, fake repost text, fake endorsement badges, fake analytics panels, fake UI labels, or invented source pages.
- No generic stock-photo people.
- No replacing the real avatar with a generic portrait, human face, unrelated animal, unrelated icon, or loosely inspired illustration.
- No unrelated logos beyond the X context implied by the data.
- No warped unreadable UI blocks where exact source text is required.
- No blurry, distorted, melted, mirrored, low-contrast, over-reflective, or unreadable Chinese typography.
- No particles, rain, glass shards, source media, or glow covering the source text.
- No full-screen particle spray or noisy abstract particle background.
- No screenshot content copied from the bundled reference images.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No using the profile banner as the full poster background.
