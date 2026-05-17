---
name: matt-pic-grab-image
description: Find and cache license-safe images by keyword or at random for covers, social posts, article illustrations, screenshots, backgrounds, and design assets. Use when Codex needs a high-resolution image URL plus a local saved file with preserved source, creator, license, and risk metadata; default to strict CC0/public-domain sources and use Pexels/Pixabay only when the user explicitly asks for modern stock-photo aesthetics or relaxed stock licensing.
---

# Matt Pic Grab Image

## Core Rule

Use `strict_cc0` by default. Never describe Pexels, Pixabay, or Unsplash as CC0. Use `stock_beauty` only when the user explicitly accepts platform stock licenses for better modern aesthetics.

Read `references/source-policy.md` when you need provider-specific license details, need to explain a risk flag, or are extending the script.

## Quick Start

Run the bundled script with Bun, resolving `scripts/grab-image.ts` relative to this `SKILL.md`. In this repository, use:

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts --query "mountain landscape" --mode strict_cc0 --orientation landscape --count 1
```

For Chinese keywords, pass the original query and add an English fallback when useful:

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts --query "山水" --fallback-query "mountain landscape" --mode strict_cc0 --orientation landscape
```

For random image selection:

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts --random --mode strict_cc0 --orientation landscape
```

For modern stock-photo aesthetics after the user accepts relaxed licensing:

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts --query "workspace" --mode stock_beauty --provider pexels,pixabay --orientation landscape
```

## Workflow

1. Decide the mode:
   - Use `strict_cc0` for "版权安全", "免费商用", "无需署名", "可二改", "CC0", covers, public posts, decks, and reusable background assets.
   - Use `stock_beauty` only for explicit requests like "Pexels style", "modern stock photo", or "审美优先".
2. Normalize the query:
   - Preserve the user's keyword.
   - If the query is Chinese, add one concise English `--fallback-query` from your own translation.
   - If no keyword is given, use `--random`.
3. Run `scripts/grab-image.ts`.
4. Parse the JSON response. If `ok` is false, retry once with a broader fallback query or a different provider order.
5. Return the useful fields to the user: image URL, local path, source URL, license, creator, and any risk flags.

## Script Options

Common options:

- `--query "text"`: Keyword search.
- `--fallback-query "text"`: Repeatable fallback query, especially for Chinese input.
- `--random`: Select from safe broad subjects when no keyword is needed.
- `--mode strict_cc0|stock_beauty`: Default `strict_cc0`.
- `--provider openverse,met,smithsonian,pexels,pixabay`: Override provider order.
- `--orientation landscape|portrait|square|any`: Default `landscape`.
- `--count 1..10`: Default `1`.
- `--cache-dir PATH`: Default `$MATT_PIC_GRAB_CACHE_DIR`, `$PIC_GRAB_CACHE_DIR`, or `~/.cache/matt-pic-grab-image`.
- `--no-download`: Return URLs and metadata without saving the image.
- `--seed VALUE`: Make random choices repeatable.

Optional environment variables:

- `OPENVERSE_CLIENT_ID` and `OPENVERSE_CLIENT_SECRET`: Raise Openverse limits.
- `SMITHSONIAN_API_KEY`: Enable Smithsonian Open Access.
- `PEXELS_API_KEY`: Enable Pexels in `stock_beauty`.
- `PIXABAY_API_KEY`: Enable Pixabay in `stock_beauty`.

## Output Handling

The script writes JSON to stdout:

```json
{
  "ok": true,
  "mode": "strict_cc0",
  "results": [
    {
      "provider": "openverse",
      "image_url": "https://...",
      "source_url": "https://...",
      "license": "CC0",
      "local_path": "/Users/.../.cache/matt-pic-grab-image/images/openverse/...",
      "metadata_path": "/Users/.../.cache/matt-pic-grab-image/meta/openverse-id.json",
      "risk_flags": []
    }
  ]
}
```

When answering the user, keep it practical:

```text
找到一张 strict CC0 图：
URL: ...
本地: ...
来源: ...
授权: CC0 / Public Domain
风险提示: ...
```

If risk flags mention people, logos, brands, trademarks, or Openverse aggregation, briefly note that the source trail is preserved and high-stakes commercial usage should verify the source page.

## Failure Recovery

- If Bun is missing, tell the user Bun is required for this Skill's script.
- If Openverse hits rate limits, retry with `--provider met`, use a narrower query, or ask the user to set Openverse credentials for heavier usage.
- If strict mode returns weak images, retry with a broader visual fallback such as `landscape`, `botanical illustration`, `public domain art`, `texture`, or `architecture`.
- If the user asks for Pexels/Pixabay results without keys configured, tell them which environment variable is missing and offer strict CC0 alternatives.
