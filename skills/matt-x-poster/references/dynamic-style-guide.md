# Dynamic Style Guide

Use this guide only when the user explicitly requests `--style dynamic`.

Dynamic mode creates a runtime prompt module at:

```text
output/matt-x-poster/<slug>/dynamic-style.md
```

Then compose the final prompt with:

```bash
bun run scripts/compose-prompt.ts \
  --context output/matt-x-poster/<slug>/card-context.json \
  --style dynamic \
  --out output/matt-x-poster/<slug>/final-prompt.md
```

You may also pass an explicit runtime module:

```bash
bun run scripts/compose-prompt.ts \
  --context output/matt-x-poster/<slug>/card-context.json \
  --style dynamic \
  --style-file output/matt-x-poster/<slug>/dynamic-style.md \
  --out output/matt-x-poster/<slug>/final-prompt.md
```

## Goal

Create one content-specific visual structure from the fetched X data instead of choosing a fixed module from `prompts/`.

The dynamic module must be as strict as a normal prompt module: it chooses one concrete physical or cinematic setting, one clear information surface, and one visual metaphor that fits the source content.

## Dynamic Planning

Before writing `dynamic-style.md`, inspect:

- `card-context.json`
- local avatar path, only to confirm the asset exists
- local post media or article cover/media paths when present
- `article-body.md` only for the article Summary workflow
- bundled X reference screenshots only for structure, spacing, hierarchy, and UI proportions

Decide:

- Source type: profile, post, or article.
- Content role: announcement, tutorial, product update, opinion, quote, prompt, visual showcase, creator profile, digest, list, warning, reflection, or joke.
- Tone: calm, technical, cinematic, deadpan, premium, intimate, public, archival, domestic, field-note, theatrical, or absurdly official.
- Best physical carrier: notice, receipt, field notebook, museum label, transit board, classroom handout, lab bench card, newspaper clipping, menu board, packaging insert, ticket, blueprint, dashboard print, storefront sign, or another specific object.
- Media role: hero image, evidence thumbnail, cover plate, side clipping, material texture cue, or no visible media.
- Text strategy: exact full text if short; exact leading excerpt if long; article title plus Summary bullets for articles.

## Required Output

`dynamic-style.md` must contain these sections:

```md
# Dynamic Structure: <short descriptive name>

## Canvas

## Content Rationale

## Core Scene

## Text And Data Fidelity

## Avatar And Media Fidelity

## UI Realism

## Realistic Lighting And Materials

## Composition Variants

## Negative Constraints
```

## Content Rationale

Use 3-5 bullets. Explain why this structure fits the specific X content. Keep it visual and operational, not poetic.

Good:

- The source is a compact AI concept guide, so the X Article becomes a building notice that feels oddly official and useful.
- The cover is a clean visual guide, so it appears as the main printed clipping.
- The Summary bullets become the notice board's quick-read section.

Bad:

- Make it futuristic and beautiful.
- Use vibes from the post.
- Create a striking image.

## Core Scene Rules

The dynamic module must specify:

- one real or cinematic environment;
- one main information surface that holds the X content;
- where the author row, avatar, handle, source text or article title, Summary, and media appear;
- how long text is handled without inventing words;
- what secondary objects are generic and non-factual.

Avoid open-ended language like "some elements", "various decorations", "dynamic layout", or "abstract background". Name concrete objects.

## Text Rules

Use only:

- exact facts from `card-context.json`;
- `Summary` bullets created by the Article Summary Workflow;
- `Translation Aid` only when the user requested translation.

Do not invent comments, reactions, dates, metrics, UI labels, warnings, captions, jokes, endorsements, headlines, QR claims, or extra links.

For long posts:

- show an exact leading excerpt;
- optionally move exact secondary facts to a smaller card;
- do not summarize unless the user explicitly requested summary treatment.

For articles:

- use exact title as the anchor;
- use exact preview only if it fits;
- use `Summary` bullets as compact secondary article points;
- never include the full article body in the imagegen prompt.

## Avatar Rules

Do not restate verbal avatar appearance. The global Current Avatar Binding in the composed prompt controls identity fidelity.

The dynamic module may define only placement and surface:

- author row avatar;
- profile card avatar;
- small printed sticker;
- compact UI identity marker;
- circular mask on the source surface.

Keep it small, flat, protected, and UI-like unless the user explicitly asks for a profile-focused poster.

## Media Rules

Treat local media as strict visual references. Decide whether each visible media asset is:

- a main cover;
- a printed thumbnail;
- a side clipping;
- a background color cue;
- omitted because the layout is already dense.

If media contains faces, those faces are media content only and must not become the author avatar.

## Quality Bar

A good dynamic module is:

- content-specific;
- physically coherent;
- readable;
- visually fresh;
- strict about facts;
- short enough for imagegen to follow;
- compatible with the global avatar, media, Summary, Translation Aid, and final generation requirements.

Reject a dynamic concept if it:

- has no clear information surface;
- depends on unreadable tiny text;
- asks imagegen to render too many factual panels;
- creates fake institutional claims;
- uses a generic sci-fi screen, gradient, or abstract poster when a concrete scene would work better;
- turns the X content into decoration instead of the factual anchor.
