# Film Dynamic Style Guide

Use this guide only when the user explicitly requests `--style film-dynamic`.

Film-dynamic mode creates a runtime prompt module at:

```text
output/matt-x-poster/<slug>/film-dynamic-style.md
```

Then compose the final prompt with:

```bash
bun run scripts/compose-prompt.ts \
  --context output/matt-x-poster/<slug>/card-context.json \
  --style film-dynamic \
  --out output/matt-x-poster/<slug>/final-prompt.md
```

You may also pass an explicit runtime module:

```bash
bun run scripts/compose-prompt.ts \
  --context output/matt-x-poster/<slug>/card-context.json \
  --style film-dynamic \
  --style-file output/matt-x-poster/<slug>/film-dynamic-style.md \
  --out output/matt-x-poster/<slug>/final-prompt.md
```

## Goal

Create one content-specific poster by choosing a classic movie scene mechanism from `references/film-shot-catalog.md`, then inserting the fetched X content into the key object, reveal, screen, paper, wall, doorway, table, or prop that drives that scene.

Film-dynamic is not a generic cinematic mood and not a film-production/backstage prompt. It should feel like a recognizable classic movie moment has been rewritten so that the X post/profile/article is the thing discovered, judged, broadcast, hidden, chased, revealed, or carried inside the scene.

Example: a prison official tears open a wall poster and the hidden cavity reveals a glowing X post card. The scene mechanism is the wall-poster reveal; the X content is the discovered object.

## Required Inputs

Before writing `film-dynamic-style.md`, inspect:

- `references/film-shot-catalog.md`
- `card-context.json`
- local avatar path, only to confirm the asset exists
- local post media or article cover/media paths when present
- `article-body.md` only for the article Summary workflow
- bundled X reference screenshots only for X card spacing, author row hierarchy, and readable source-card proportions

## Film Planning

Decide:

- Source type: profile, post, or article.
- Content role: opinion, warning, confession, product judgment, technical note, joke, announcement, creator identity, article thesis, visual proof, or list.
- Primary scene mechanism: choose one catalog card whose famous visual action or reveal fits the source content.
- Optional secondary lens: choose at most one secondary catalog card only for camera distance, lighting, or material support. Never mash up more than two films.
- Main X insertion point: hidden wall cavity, torn poster, courtroom evidence, war-room table, train timetable, TV broadcast, newspaper front page, diner menu, hotel room typewriter page, surveillance photo wall, elevator doors, cockpit screen, ring/box/object close-up, or another concrete scene object.
- Character role: generic scene archetypes only, such as prison official, juror, detective, clerk, passenger, witness, officer, courier, projectionist, office worker, diner patron, or lone passerby.
- Optional scene line: at most one short original cinematic line, 3-8 words. It must be generated from the source mood, not quoted from a film, not attributed to the X author, and not presented as fetched data.
- Text strategy: exact full text if short; exact leading excerpt if long; article title plus Summary bullets for articles.

## Required Output

`film-dynamic-style.md` must contain these sections:

```md
# Film Dynamic Structure: <short descriptive name>

## Film Lens

## Classic Scene Mechanism

## Canvas

## Content Rationale

## Core Scene

## X Content Insertion

## Characters And Optional Dialogue

## Text And Data Fidelity

## Avatar And Media Fidelity

## Cinematography And Materials

## Composition Variants

## Negative Constraints
```

## Film Lens

Name the primary catalog card and optional secondary card:

```md
Primary scene: <catalog number and title>
Secondary lens: <catalog number and title, or none>
```

Then summarize the borrowed scene mechanism in one or two sentences: what is being opened, revealed, watched, judged, chased, discovered, broadcast, or carried, and where the X content sits inside that action.

Do not write a film-set, director-board, behind-the-scenes, rehearsal, camera crew, or production-office concept unless the selected catalog card itself is a famous on-screen scene about filmmaking and the X content is embedded into that scene action.

## Classic Scene Mechanism

This section is mandatory. Specify the exact cinematic action that makes the poster work:

- a poster is torn back;
- a jury table turns into an evidence surface;
- a television broadcast reveals the X card;
- a newspaper headline is unfolded;
- a train window reflection carries the post;
- a box/object close-up reveals the source;
- a doorway frames the X content beyond it;
- a surveillance wall, chalkboard, war table, or interrogation desk exposes the source.

The scene mechanism must be concrete enough that imagegen can stage it. Avoid "cinematic vibes", "classic mood", "dreamlike production set", "director review", or "studio backstage" as the core idea.

## Content Rationale

Use 3-5 bullets. Explain why the chosen scene mechanism fits the specific X source content. Keep it operational:

- The post reads like hidden proof, so the X card appears inside a torn wall cavity.
- The article is an argument, so the title becomes courtroom evidence.
- The post media is the visual proof, so it appears as photos pinned to the investigation wall.

## Core Scene Rules

Specify:

- one recognizable movie-scene environment;
- one main scene action or reveal;
- one main information surface that holds the X content;
- where the author row, avatar, handle, source text or article title, Summary, and media appear;
- how long text is handled without inventing facts;
- which generic characters appear, if any;
- what props are generic and non-factual.

The X content must be readable and physically plausible inside the scene. It cannot be a tiny easter egg or background decoration.

## Film Safety Rules

Use classic scene mechanisms, not protected identity.

Allowed:

- scene action, blocking, camera distance, lighting, set geometry, material texture, and atmosphere;
- generic character archetypes;
- one short original micro-dialogue or subtitle line generated for this poster;
- broad props such as wall poster, evidence folder, prison wall, newspaper, lamp, train window, TV screen, chalkboard, box, diner counter, rain window, or courtroom table.

Avoid:

- actor likenesses;
- protected character names;
- direct one-to-one recreation of a specific copyrighted frame;
- recognizable costumes, logos, fictional institutions, or signature props that identify one copyrighted scene too literally;
- long or famous film dialogue quotes;
- fake production credits, studio marks, ratings, awards, or festival laurels;
- film camera crews, clappers, director chairs, rehearsal marks, or backstage equipment unless the scene mechanism explicitly requires them.

## Text Rules

Use factual text only from:

- `card-context.json`;
- `Summary` bullets created by the Article Summary Workflow;
- `Translation Aid` only when the user requested translation.

Optional film text:

- You may add one short original scene line if it improves the poster.
- Keep it clearly separate from the X content, such as a small subtitle strip, whispered off-screen line, wall scrawl, evidence note, or handwritten scene note.
- It must not be attributed to the source author or presented as fetched X content.
- It must not add factual claims, metrics, dates, endorsements, warnings, instructions, or comments.
- Omit it when the source text is already long or dense.

For articles:

- use exact article title as the anchor;
- use exact preview only if it fits;
- use `Summary` bullets as compact secondary article points;
- never include the full article body in the imagegen prompt.

## Avatar Rules

Do not restate verbal avatar appearance. The global Current Avatar Binding controls identity fidelity.

The film-dynamic module may define only placement and surface:

- author row avatar;
- profile card avatar;
- small printed sticker;
- compact UI identity marker;
- circular mask on the X source surface.

Keep it small, flat, protected, and UI-like. The avatar must not become a film character, actor headshot, mugshot, newspaper portrait, painted face, surveillance suspect, poster pin-up, or projected giant face.

When the source has a local avatar file, the film-dynamic module must include an explicit real-avatar reproduction rule in `## Avatar And Media Fidelity`. Use the current run's actual avatar path from `profile.avatar_local_path` or `assets.profile_avatar_path`:

```md
The image file at <current avatar local path> is the real profile avatar of the current X account owner. Reproduce this exact avatar image 1:1 inside the circular avatar area as a direct bitmap sticker. This file is not a style reference, not a character concept, and not an illustration prompt. Do not redraw, reinterpret, pixel-art, iconify, beautify, relight, recolor, crop differently, replace the person, or create a similar-looking avatar. The avatar must look like the same source image pasted into the UI circle.
```

If exact avatar fidelity is difficult, keep the avatar as a clean pasted bitmap sticker with a simple circular crop; do not convert it into a stylized icon. This rule is film-dynamic-specific because the cinematic scene, fabric, paper, screen, projection, or prop material can otherwise pull the avatar into the movie style.

## Media Rules

Treat local media as strict visual references. Decide whether each visible media asset is:

- evidence photo;
- hidden-wall print;
- newspaper image;
- TV monitor insert;
- surveillance-board photo;
- courtroom exhibit;
- projection/screen content;
- omitted because the scene is text-led.

If media contains faces, those faces are media content only and must not become the author avatar or film characters.

## Quality Bar

A good film-dynamic module is:

- tied to one concrete catalog scene mechanism;
- readable;
- cinematic but not derivative;
- strict about facts;
- physically coherent;
- short enough for imagegen to follow;
- clear about avatar and media boundaries.

Reject a concept if it:

- feels like generic "cinematic vibes" without a specific scene action;
- stages a film production set instead of an on-screen movie moment;
- depends on unreadable tiny text;
- asks imagegen to render too many factual surfaces;
- copies a famous film frame too literally;
- uses actor likeness or character identity;
- turns the X content into background decoration;
- lets fictional dialogue compete with exact X source text.
