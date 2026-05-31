# Matt X Poster

`matt-x-poster` turns a real X/Twitter profile, post, or X Article URL into a cinematic poster prompt for image generation. It fetches source data through FxEmbed, keeps the factual content in `card-context.json`, composes a style-specific prompt, and preserves the current author avatar through a final avatar-only pass.

## Quick Start

Invoke the skill from Codex with an X URL and a style:

```text
$matt-x-poster --style sunlit-sail-signal https://x.com/user/status/123
```

The skill runs two deterministic helpers internally:

```bash
bun run skills/matt-x-poster/scripts/x-card-data.ts prepare "<x-url-or-handle>" --out output/matt-x-poster/<slug>

bun run skills/matt-x-poster/scripts/compose-prompt.ts \
  --context output/matt-x-poster/<slug>/card-context.json \
  --style <style-name> \
  --out output/matt-x-poster/<slug>/final-prompt.md
```

After the first image is generated, the skill runs a fixed Avatar Finalization Pass when a local X avatar exists and the style renders an author/profile avatar. That pass replaces only the circular avatar area with the current X avatar reference and keeps the rest of the poster unchanged.

## Gallery

These are example outputs generated from public X content. They are documentation assets only; source X content and third-party media are not licensed by this repository.

| Style | Example |
| --- | --- |
| `--style lunar-flag-signal` | <img src="assets/lunar-flag-signal.png" alt="Lunar flag signal poster example" width="520"> |
| `--style seaside-plein-air-wave` | <img src="assets/seaside-plein-air-wave.png" alt="Seaside plein air wave poster example" width="360"> |
| `--style museum-archive-case` | <img src="assets/museum-archive-case.png" alt="Museum archive case poster example" width="520"> |
| `--style takeout-receipt-counter` | <img src="assets/takeout-receipt-counter.png" alt="Takeout receipt counter poster example" width="420"> |
| `--style profile-portal-3d` | <img src="assets/profile-portal-3d.png" alt="Profile portal 3D poster example" width="520"> |

## Style Table

Fixed styles correspond to files in `skills/matt-x-poster/prompts/`.

| Use This Flag | Prompt File | Best For |
| --- | --- | --- |
| `--style profile-portal-3d` | `profile-portal-3d.md` | 3D X profile/post portal, floating glass cards, cinematic creator cards. |
| `--style creator-signal-stage` | `creator-signal-stage.md` | Keynote, studio, cafe, or display-board launch scenes. |
| `--style seaside-plein-air-wave` | `seaside-plein-air-wave.md` | Beach easel scenes, painterly coastal realism, ocean-wave content echoes. |
| `--style sunlit-sail-signal` | `sunlit-sail-signal.md` | Sunny ocean sailing scenes with X content printed on sailcloth. |
| `--style editorial-citation-desk` | `editorial-citation-desk.md` | Editorial desks, open books, source cards, citation/reference visuals. |
| `--style street-poster-wheatpaste` | `street-poster-wheatpaste.md` | Urban wheatpaste posters, public-wall energy, venue-poster textures. |
| `--style museum-archive-case` | `museum-archive-case.md` | Museum vitrines, archive cases, preserved digital source artifacts. |
| `--style creator-field-notes` | `creator-field-notes.md` | Research desks, notebooks, source study, field-note creator dossiers. |
| `--style cinematic-contact-sheet` | `cinematic-contact-sheet.md` | Film strips, darkroom contact sheets, selected-frame editorial review. |
| `--style designer-pinboard` | `designer-pinboard.md` | Moodboards, cork/fabric boards, identity systems, palette studies. |
| `--style skin-script-body-art` | `skin-script-body-art.md` | Tasteful body-art typography and fashion/editorial portrait compositions. |
| `--style bathroom-mirror-sticky-note` | `bathroom-mirror-sticky-note.md` | Bathroom mirror scenes, sticky notes, morning-reminder comedy. |
| `--style fridge-door-magnet` | `fridge-door-magnet.md` | Kitchen/fridge scenes, magnets, grocery-list or family-calendar humor. |
| `--style elevator-notice-board` | `elevator-notice-board.md` | Elevator/lobby notice boards, public-building bulletins, official-looking flyers. |
| `--style laundromat-machine-note` | `laundromat-machine-note.md` | Laundromat errands, washer/dryer notes, folding-table printouts. |
| `--style takeout-receipt-counter` | `takeout-receipt-counter.md` | Cafe/takeout counters, receipts, pickup slips, paper-bag labels. |
| `--style grand-opera-chorus` | `grand-opera-chorus.md` | Opera-house staging, libretto/program cards, dramatic high-culture comedy. |
| `--style lunar-flag-signal` | `lunar-flag-signal.md` | Lunar EVA scenes with X content printed on a planted moon flag. |

Runtime styles are created per run:

| Use This Flag | Runtime File | Best For |
| --- | --- | --- |
| `--style dynamic` | `output/matt-x-poster/<slug>/dynamic-style.md` | One-off content-specific visual structures. |
| `--style film-dynamic` | `output/matt-x-poster/<slug>/film-dynamic-style.md` | Classic-cinema scene mechanisms without copying protected frames or actors. |
