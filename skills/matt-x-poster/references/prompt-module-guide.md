# Prompt Module Guide

Each prompt module in `prompts/` should describe one reusable visual structure. Keep modules strict enough that imagegen can produce a consistent composition, but leave surface-level variation available.

## Required Sections

- `Canvas`: aspect ratio, camera, resolution feel, and palette.
- `Core Scene`: exact spatial composition and what data appears where.
- `Text And Data Fidelity`: rules for rendering exact X content.
- `UI Realism`: how to use reference assets structurally.
- `Negative Constraints`: things imagegen must not invent or copy.

## Data Rules

- Use only `card-context.json` as the factual content source.
- Use screenshot images only from `assets/reference-screenshots/`, and use HTML only from `assets/fxbrief-reference/` or `assets/static-reference/`.
- Treat all bundled references as layout references only.
- Do not include reference screenshot text in final prompts.
- Treat profile, post, article, media, and quote data as separate content blocks so future modules can rearrange them without losing provenance.
