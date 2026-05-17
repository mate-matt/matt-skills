# Matt Skills

Personal open-source Codex skills and skill-backed tools by Matt.

The first published skill is `matt-pic-grab-image`: a practical image-grabbing skill that searches license-safe image sources, downloads the chosen image locally, and preserves source/license metadata for later reuse.

## Repository Layout

```text
matt-skills/
  skills/
    matt-pic-grab-image/      # Current published Codex Skill
      SKILL.md
      scripts/grab-image.ts
      references/source-policy.md
      agents/openai.yaml
  package.json                # Convenience scripts for local testing
  .env.example                # Optional API keys
```

Future CLI tools can live under `packages/` without changing the skill layout.

## Skill: matt-pic-grab-image

Use this skill when you need a high-resolution image URL plus a local cached file for covers, social posts, article illustrations, screenshots, backgrounds, and design assets.

Default mode is `strict_cc0`, which only accepts provider metadata that indicates CC0 or public domain.

Current providers:

- Openverse, filtered to `license=cc0`
- The Met Open Access, filtered to `isPublicDomain=true`
- Smithsonian Open Access, optional and requires `SMITHSONIAN_API_KEY`
- Pexels/Pixabay in explicit `stock_beauty` mode only, never mislabeled as CC0

## Install As A Codex Skill

Clone the repo, then symlink the skill into your Codex skills directory:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s "$PWD/skills/matt-pic-grab-image" "${CODEX_HOME:-$HOME/.codex}/skills/matt-pic-grab-image"
```

After that, invoke it in Codex:

```text
Use $matt-pic-grab-image to find a CC0 mountain landscape cover image.
```

Chinese prompt example:

```text
使用 $matt-pic-grab-image 给我一张“山水”主题图片，要求免费商用、无需署名、可二改。
```

## Run The Script Directly

Requires Bun.

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts --query "history painting" --mode strict_cc0 --orientation landscape --count 1
```

Random image:

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts --random --mode strict_cc0 --orientation landscape
```

Chinese keyword with English fallback:

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts --query "山水" --fallback-query "Chinese landscape painting" --mode strict_cc0 --provider met,openverse --orientation landscape
```

Convenience scripts:

```bash
bun run pic:help
bun run pic:random
bun run pic:shanshui
bun run pic:history
```

## Output

The script prints JSON and saves image/metadata files under `~/.cache/matt-pic-grab-image` by default.

```json
{
  "ok": true,
  "mode": "strict_cc0",
  "results": [
    {
      "provider": "met",
      "title": "Landscape",
      "image_url": "https://images.metmuseum.org/...",
      "source_url": "https://www.metmuseum.org/art/collection/search/...",
      "license": "CC0 / Public Domain",
      "local_path": "/Users/me/.cache/matt-pic-grab-image/images/met/...",
      "metadata_path": "/Users/me/.cache/matt-pic-grab-image/meta/met-id.json",
      "risk_flags": []
    }
  ]
}
```

## Optional Environment Variables

Copy `.env.example` if you want to manage keys locally.

```bash
cp .env.example .env
```

Supported variables:

- `OPENVERSE_CLIENT_ID` and `OPENVERSE_CLIENT_SECRET`: raise Openverse limits.
- `SMITHSONIAN_API_KEY`: enable Smithsonian Open Access.
- `PEXELS_API_KEY`: enable Pexels for `stock_beauty`.
- `PIXABAY_API_KEY`: enable Pixabay for `stock_beauty`.
- `MATT_PIC_GRAB_CACHE_DIR`: override the cache directory.

## License Posture

The repository code is MIT licensed.

Image results are not licensed by this repository. `matt-pic-grab-image` preserves each image's provider, source page, license URL, and risk flags. `strict_cc0` is the safest default, but CC0/public-domain metadata does not clear every possible non-copyright issue such as trademarks, privacy, publicity rights, private property, or modern artworks.

## Validate

Run the repository's zero-dependency validator:

```bash
bun run validate:pic-skill
```

If you have Codex's built-in `skill-creator` validator and PyYAML available:

```bash
bun run validate:pic-skill:official
```

Smoke test:

```bash
bun run pic:shanshui
```
