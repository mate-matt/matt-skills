# fxbrief Examples

This directory keeps generated examples beside the `fxbrief` package source so CLI behavior can be inspected without searching through temporary output folders.

## X Article Example

Source:

```text
https://x.com/mate_mattt/status/2055981719225081920
```

Files:

- `x-article-2055981719225081920/markdown/article.md`: X Article Markdown export.
- `x-article-2055981719225081920/markdown/assets/`: local cover and inline article media.
- `x-article-2055981719225081920/markdown/metadata.json`: normalized article metadata.
- `x-article-2055981719225081920/markdown/raw.fxembed.json`: raw FxEmbed response for debugging.
- `x-article-2055981719225081920/article-shot/article-long.png`: full article long screenshot.
- `x-article-2055981719225081920/article-shot/article-01.png` through `article-04.png`: 1800 CSS-pixel slice exports for social platforms.

Regenerate:

```bash
fxbrief article-md "https://x.com/mate_mattt/status/2055981719225081920" \
  --out examples/fxbrief/x-article-2055981719225081920/markdown

fxbrief article-shot "https://x.com/mate_mattt/status/2055981719225081920" \
  --style article-x \
  --width 540 \
  --scale 2 \
  --slice-height 1800 \
  --out examples/fxbrief/x-article-2055981719225081920/article-shot
```
