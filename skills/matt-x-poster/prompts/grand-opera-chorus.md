# Grand Opera Chorus

Turn an X profile, post, or article into a grand opera-house chorus declaration poster: the X content appears as the solemn libretto, stage surtitles, or gala-program source card in a prestigious concert hall. The joke is that a small, casual, internet-sized thought has been elevated into a formal collective performance with conductor, choir, orchestra, velvet curtain, and ceremonial lighting.

This structure is for dramatic contrast, high-culture absurdity, and deadpan collective-call humor. It should feel like a serious opera finale or choral premiere that accidentally treats the X source text as sacred performance material. It must not become a meme graphic, political rally, restroom joke, vulgar body gag, or slapstick scene.

## Canvas

- Do not lock to one fixed aspect ratio unless the user explicitly asks.
- Prefer a cinematic landscape, near-square, or 4:5 poster with enough space for the grand stage, conductor, choir, orchestra pit, and one large readable X source surface.
- For short posts, allow the source text to become large and iconic like opera surtitles or a libretto page. For long posts or articles, expand into a broad opera-program board or multiple readable stage panels rather than a narrow tall strip.
- Use a photorealistic premium stage-photography look: deep proscenium depth, velvet curtains, polished wood, brass music stands, tuxedos or formal black concertwear, choir risers, sheet music, warm spotlights, controlled haze, and realistic audience darkness.
- Palette should feel prestigious and theatrical: red velvet, antique gold, warm amber light, black formalwear, ivory paper, polished wood, subtle X blue accents, and one restrained accent color derived from the avatar, banner, or attached media.
- The scene should be funny through excessive formality and collective ceremony. Avoid cartoon comedy, meme fonts, bathroom context, club-neon styling, crude props, CGI plastic surfaces, and impossible floating UI.

## Dramatic Humor Engine

- Treat the X source as a solemn opera chorus line, gala libretto excerpt, or projected supertitle that the entire hall is preparing to perform.
- The comedy comes from contrast: high-art ritual, exacting stagecraft, and collective seriousness surrounding a short casual post, odd daily reminder, countdown phrase, or tiny private thought.
- If the source text contains count-in rhythm, line breaks, chant-like punctuation, emoji, or repeated short lines, preserve those line breaks and let the conductor's raised baton visually imply the count-in.
- If the source text feels like a collective slogan or call-and-response, stage it as a formal chorus entrance. The choir may appear poised to sing together, but do not invent extra sung words.
- Keep the humor dry and cinematic. Do not add captions, jokes, audience reactions, fake reviews, stage titles, conductor quotes, lyric translations, musical notation text, or extra slogans.
- The scene should make the viewer smile because everyone on stage takes the exact X text with absurd seriousness.

## Core Scene

1. The main focal environment is a grand opera house, concert hall, conservatory stage, rehearsal hall, or black-tie gala performance space.
2. Include a believable performance arrangement:
   - a conductor in the foreground or center aisle with baton raised;
   - a formal chorus on risers, evenly spaced and poised;
   - an orchestra pit or seated musicians with music stands;
   - velvet curtains, proscenium arch, stage lights, balcony boxes, or dark audience silhouettes.
3. The X content must appear physically or optically within the stage world, not as a flat pasted screenshot:
   - projected supertitles above the stage;
   - a large illuminated libretto board;
   - a printed gala-program page on a music stand in the foreground;
   - a conductor's score page;
   - a stage backdrop screen with an X source card;
   - or a framed performance placard at the stage edge.
4. The X source surface should carry recognizable X UI DNA through clean spacing, rounded card geometry, compact author row, circular avatar, handle line, and source-text hierarchy, while still feeling like a real stage object, projection, or printed program.
5. When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, the visible author row must include the strict source avatar as a small protected circular bitmap. Do not omit the avatar, replace it with a generic portrait, or infer a public/person photo from the author name.
6. If `source_type` is `profile`, the source surface contains:
   - exact profile name,
   - exact `@handle`,
   - verified state if present,
   - exact profile bio/description when short enough,
   - exact `profile.display_counts.text` in order when space allows,
   - strict flat bitmap avatar reference,
   - optional banner color strip as a proscenium light accent, program header, or small projected band.
7. If `source_type` is `post`, the source surface contains:
   - exact author name and exact `@handle`,
   - strict flat bitmap avatar reference,
   - exact post text when short enough,
   - exact leading post excerpt when the post is too long,
   - quote facts only when `post.quote` exists and only from `card-context.json`,
   - attached media only as a printed program plate, small projected still, or secondary stage placard if local media exists.
8. If `source_type` is `article`, the source surface contains:
   - exact article title,
   - exact preview excerpt when present,
   - exact author name and `@handle`,
   - strict flat bitmap avatar reference,
   - article cover/media as a program plate, projected still, or framed stage placard if present.
9. For very short post text, make the exact post text the dominant typographic event. Let the conductor, choir, and orchestra frame it like the climactic final line of an opera.
10. Keep performers secondary to the source text. The choir and conductor create scale and seriousness; they must not cover the X card, avatar, author line, handle, media, or exact post text.

## Text And Data Fidelity

- Use only `card-context.json` as factual content.
- Obey all `prompt_guards` exactly.
- Render exact names, handles, post text, article title, article preview, quote text, source URL, and profile bio from the JSON when visible.
- Preserve multilingual text exactly, including Chinese, English, punctuation, emoji, line breaks, URLs, and `@handle` spelling.
- Do not translate, summarize, rewrite, paraphrase, stylize, musicalize, lyricize, censor, or embellish the source text unless the user explicitly requested translation or adaptation.
- For short source text, preserve original line breaks and punctuation exactly. Stage typography may be elegant, but the words themselves must remain unchanged.
- For profile counts, use `profile.display_counts.text` exactly and in order. Counts above 1,000 should already include K/M compact notation. Never render raw unformatted counts, never swap Following and Followers, and never add a posts count to the profile count row.
- If source text is long, show a clean exact leading excerpt on the main stage surface and move secondary exact facts to a readable program card. Do not invent continuation text, commentary, subtitles, reviews, opera titles, or summaries.
- Make the main source text crisp, high-contrast, and readable as projected typography, printed ink, or illuminated stage-board lettering. Stage haze, spotlight bloom, curtain folds, sheet music, conductor hands, music stands, and audience silhouettes must not obscure exact source text.

## Avatar And Media Fidelity

- When `profile.avatar_local_path` or `assets.profile_avatar_path` exists, treat it as the strict avatar source image.
- The current avatar file listed in Current Avatar Binding is the real profile avatar of the current X account owner. Reproduce that exact avatar image 1:1 inside the circular avatar area as a direct bitmap sticker. It is not a style reference, not a character concept, and not an illustration prompt; do not redraw, reinterpret, pixel-art, iconify, beautify, relight, recolor, crop differently, replace the person, or create a similar-looking avatar.
- The avatar should look like a direct source-avatar bitmap reproduction printed or projected inside a clean circular X avatar mask on the program card, stage card, or source surface.
- Treat the avatar circle as a protected flat bitmap island and small circular printed decal / original-bitmap sticker on the program/source surface. Stage light, projection softness, paper fiber, program gloss, screen texture, and music-stand shadows may surround it, but they must not enter, recolor, blur, warp, relight, repaint, or convert the avatar interior.
- Keep the avatar a compact UI identity marker inside the author/profile row, roughly 6-10% of the program/source-card width when possible. It must never become a performer portrait, composer medallion, stage projection headshot, or opera poster face.
- Match the current avatar asset directly as a source bitmap. Do not use verbal appearance traits to reconstruct the avatar; the generated avatar must look like the same image asset placed into this style's avatar surface.
- If the current avatar asset is an illustration, drawing, logo, animal, object, abstract mark, or non-photo image, preserve that exact non-photo source image character. Do not convert it into a realistic human photograph, celebrity-like portrait, inferred public figure, performer headshot, or generic profile photo.
- Do not reinterpret the avatar as the conductor, singer, composer portrait, opera character, audience member, stage mascot, painted medallion, sculpture, stained glass, or enlarged hero face.
- Do not beautify, relight, repaint, upscale into a new drawing, simplify, age-shift, change expression, change face angle, change hand gesture, or change the avatar background.
- Stage light, paper fiber, screen pixel texture, projection softness, program gloss, and music-stand shadows may affect the surface around the avatar, but must not cover, recolor, blur, warp, relight, or distort the avatar interior.
- If fidelity is uncertain, keep the avatar smaller, flatter, front-facing, cleaner-edged, and closer to the original bitmap crop.
- When local post media, article cover, or article media paths exist, treat them as strict visual references. They may appear as a program illustration, projected still, or framed side placard. Keep visible media recognizable and do not invent new media.

## UI Realism

- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- These references are only for structural cues: X spacing, hierarchy, rounded card geometry, profile header proportions, avatar/banner relationship, post-detail text scale, and card rhythm.
- Do not copy visible screenshot text, screenshot media, metrics, avatars, handles, or facts.
- The final poster should carry X UI DNA through a compact author row, circular avatar, handle line, rounded card geometry, and source text rhythm, but the card must belong to the opera-house world as a projection, libretto board, score page, or printed gala program.
- Avoid making the image look like a phone screenshot pasted over a stage photo. Use projection falloff, paper texture, board thickness, screen mount, music-stand clips, or stage-edge framing to integrate the source card physically.

## Realistic Lighting And Materials

- Use believable theater lighting: warm key spotlight on the stage, amber footlights, soft balcony darkness, controlled stage haze, reflections on polished wood, gentle glow from projected text, and subtle rim light on the conductor and choir.
- Use real material cues: velvet curtain nap, gilded trim, sheet-music paper, brass instrument highlights, black formalwear fabric, baton lacquer, music-stand metal, ivory program stock, screen pixels, projection falloff, and dust in the spotlight beam.
- Keep the source text surface as the sharpest readable object. The choir, conductor, orchestra, and audience may have shallow depth of field, motion softness, or dramatic silhouettes.
- Keep glare, spotlight bloom, baton motion, hands, music stands, microphones, curtain folds, and stage haze away from source text, avatar faces, profile counts, article title, and important attached-media content.

## Composition Variants

- Supertitle finale variant: the exact post text appears as huge opera surtitles above a full choir while the conductor holds the final count-in.
- Libretto close-up variant: a foreground music stand holds a printed X source card as if it were the official libretto, with the choir and velvet stage behind it.
- Conductor-score variant: the conductor's open score contains the exact post or article source card, sharp in the foreground, while the stage waits in solemn silence.
- Gala-program variant: a premium printed program page on a red velvet seat or music stand contains the profile/post/article card, with the opera house glowing beyond.
- Chorus-oath variant: a symmetrical choir stands under a projection of the exact post, giving a collective-chant feeling without political symbols, propaganda styling, or invented slogans.
- Article-premiere variant: the article title and preview appear as a formal premiere placard on stage, with cover media as a tasteful program plate.

## Negative Constraints

- No fake comments, fake reposts, fake quote text, fake endorsements, fake analytics panels, fake UI labels, fake dates, fake source pages, fake critic reviews, fake program notes, fake opera titles, fake lyrics, fake subtitles, fake institutions, or invented links.
- No invented slogans, call-and-response lines, musical notation text, conductor dialogue, audience reactions, or explanatory captions beyond exact fetched X source content.
- No invented metrics or extra badges beyond facts present in `card-context.json`.
- No raw unformatted follower counts when `profile.display_counts.text` supplies compact count strings.
- No swapping Following and Followers values.
- No posts count in the profile count row beneath the profile bio.
- No replacing the real avatar with a conductor, singer, composer portrait, opera character, generic face, unrelated icon, stage emblem, or loosely inspired illustration.
- No converting an illustrated, graphic, logo, object, animal, or abstract source avatar into a realistic person photo or inferred public figure portrait.
- No redrawing, relighting, beautifying, aging, expression-changing, face-angle-changing, pose-changing, hand-gesture-changing, or style-changing of the avatar.
- No copying factual content from bundled reference screenshots or HTML.
- No using bundled reference screenshot media as poster media.
- No restroom, toilet, bathroom stall, locker room, medical diagram, anatomy diagram, explicit body imagery, vulgar gesture, sexualized pose, nudity, humiliation, injury, or crude bodily visual gag.
- No political rally, government ceremony, military parade, courtroom, protest, propaganda poster, dystopian crowd scene, religious ritual, cult ceremony, or authoritarian symbolism.
- No cartoon meme fonts, speech bubbles, emoji confetti, exaggerated expressions, slapstick props, comedy arrows, reaction faces, glossy ad mascot, or nightclub stage design.
- No holographic panels, translucent sci-fi cards, impossible floating UI, neon particles, signal beams, random digital noise, or abstract portal effects.
- No blurry, warped, melted, mirrored, low-contrast, over-reflective, spotlight-washed, haze-covered, or unreadable typography.
- No conductor, baton, choir member, instrument, music stand, curtain fold, spotlight beam, audience silhouette, program edge, glare, or projection artifact covering source text, avatar faces, profile counts, article title, or important attached-media content.
