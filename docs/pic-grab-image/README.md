# Pic Grab Image Guide

[English](README.md) | [简体中文](README.zh-CN.md)

`matt-pic-grab-image` helps Codex find and cache images with a clear source trail. It is useful for covers, article illustrations, social posts, screenshots, backgrounds, and design references.

The default mode is conservative: prefer CC0 / Public Domain sources and preserve source, creator, license, local path, metadata path, and risk flags.

## Requirements

The bundled script runs with Bun:

```bash
bun --version
```

Install the Codex skill:

```text
$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-pic-grab-image
```

Restart Codex after installing a skill.

## Main Modes

| Mode | When To Use |
| --- | --- |
| `strict_cc0` | Default. Use for commercial publishing, reusable covers, public posts, decks, and anything asking for CC0 / Public Domain / no attribution. |
| `stock_beauty` | Use only when the user explicitly accepts platform stock licenses for more modern Pexels/Pixabay-style aesthetics. |

The skill does not describe Pexels, Pixabay, or Unsplash as CC0.

## Example Cases

| Example |
| --- |
| Use `$matt-pic-grab-image` to find a CC0 history painting for an article cover. |
| <img src="../assets/example-history-socrates.webp" alt="Public-domain history painting example" width="420"> |

Direct script command:

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts \
  --query "history painting" \
  --mode strict_cc0 \
  --orientation landscape \
  --count 1
```

Chinese query with fallback:

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts \
  --query "山水" \
  --fallback-query "Chinese landscape painting" \
  --mode strict_cc0 \
  --orientation landscape \
  --count 1
```

| Example |
| --- |
| Use `$matt-pic-grab-image` to find a commercial-safe shanshui image that can be reused and edited. |
| <img src="../assets/example-shanshui-landscape.jpg" alt="Public-domain shanshui landscape example" width="420"> |

Random safe image:

```bash
bun run skills/matt-pic-grab-image/scripts/grab-image.ts \
  --random \
  --mode strict_cc0 \
  --orientation landscape
```

## Output

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
      "creator": "Unknown",
      "local_path": "/Users/.../.cache/matt-pic-grab-image/images/openverse/...",
      "metadata_path": "/Users/.../.cache/matt-pic-grab-image/meta/openverse-id.json",
      "risk_flags": []
    }
  ]
}
```

When reporting results, include the local file path, source URL, license, creator, and any risk flags.

## Useful Options

- `--query "text"`: keyword search.
- `--fallback-query "text"`: repeatable fallback query, useful for Chinese input.
- `--random`: select from safe broad subjects.
- `--mode strict_cc0|stock_beauty`: default `strict_cc0`.
- `--provider openverse,met,smithsonian,pexels,pixabay`: override provider order.
- `--orientation landscape|portrait|square|any`: default `landscape`.
- `--count 1..10`: default `1`.
- `--cache-dir PATH`: default `$MATT_PIC_GRAB_CACHE_DIR`, `$PIC_GRAB_CACHE_DIR`, or `~/.cache/matt-pic-grab-image`.
- `--no-download`: return URLs and metadata without saving the image.
- `--seed VALUE`: make random choices repeatable.

## Optional API Keys

- `OPENVERSE_CLIENT_ID` and `OPENVERSE_CLIENT_SECRET`: raise Openverse limits.
- `SMITHSONIAN_API_KEY`: enable Smithsonian Open Access.
- `PEXELS_API_KEY`: enable Pexels in `stock_beauty`.
- `PIXABAY_API_KEY`: enable Pixabay in `stock_beauty`.

## Source Policy

Read [`source-policy.md`](../../skills/matt-pic-grab-image/references/source-policy.md) for provider-specific details and risk handling.

For high-stakes commercial usage, review the preserved source page even when the returned license looks permissive.
