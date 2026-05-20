# Source Policy

Use this reference when choosing providers, explaining license posture, or extending `scripts/grab-image.ts`.

## Provider Modes

### `strict_cc0`

Use by default when the user asks for copyright-safe, free commercial, no-attribution, editable images.

- **Openverse**: Query only `license=cc0`. Treat it as a metadata aggregator, not a legal warranty. Return `source_url`, `license_url`, and the Openverse attribution/license snapshot.
- **The Met Open Access**: Accept only API records where `isPublicDomain` is true and `primaryImage` exists. The Met says Open Access images and data are unrestricted under CC0/public domain.
- **Smithsonian Open Access**: Optional because it requires `SMITHSONIAN_API_KEY`. Accept only records whose metadata indicates CC0 and contains an image URL.

Strict mode should still warn that CC0 covers copyright only. Recognizable people, logos, private property, trademarks, and modern artworks may require separate rights clearance.

## `stock_beauty`

Use only when the user explicitly prioritizes modern stock-photo aesthetics over CC0-only sourcing.

- **Pexels**: Requires `PEXELS_API_KEY`. Use `Pexels License`, not CC0. It is free for personal/commercial use, attribution is not required by the license, and modification is allowed, but standalone resale, wallpaper/stock replication, implied endorsement, trademarks, and offensive depictions of identifiable people are restricted.
- **Pixabay**: Requires `PIXABAY_API_KEY`. Use `Pixabay Content License`, not CC0. It allows free use, no attribution, and modification, but standalone resale and trademark/people/misleading-use issues remain restricted.
- **Unsplash**: Do not use by default in this skill. Unsplash is not CC0, and official API display use has attribution/link obligations. Add it only if a user explicitly asks and accepts the attribution rules.

## Output Requirements

Every result should include:

- `provider`
- `provider_id`
- `title`
- `creator`
- `image_url`
- `source_url`
- `license`
- `license_url`
- `local_path` when downloaded
- `metadata_path`
- `risk_flags`

Do not describe platform stock results as CC0. Do not claim "zero legal risk"; say the script verified license metadata and preserved the source trail.

## Operational Notes

- Prefer cached local files when present.
- Keep metadata JSON next to cached images so later articles/decks can cite the exact source trail.
- Use `--fallback-query` for Chinese prompts when Codex can provide an English translation.
- For heavier Openverse usage, set `OPENVERSE_CLIENT_ID` and `OPENVERSE_CLIENT_SECRET`; anonymous Openverse access has low daily limits.
