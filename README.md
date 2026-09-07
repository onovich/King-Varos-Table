# King Varo's Table

[简体中文](README.zh-CN.md)

A browser-based, no-guess logic puzzle about restoring the divided map of King Varo's short-lived empire. Read each number inside its national borders, complete the map, and uncover what the royal banquet was recording.

[Public game — previous edition](https://game.onovich.com/King-Varos-Table/). The continuous journey in this working tree has not been published.

![King Varo's Table social preview](docs/social-preview.png)

## How to play

Each number counts the bright cells in a centered area of up to 3×3 cells, including the numbered cell itself. Thick country borders clip that area, so adjacent cells across a border never count. Mark every cell bright or dark to reconstruct each country.

The local entry opens one continuous 32×24 map. Its 48-cell Pel Island teaches the rules during real play; read its first fall record to unlock free country choice, or skip guidance. Complete all seven countries to reach the banquet ending and historical epilogue. Three older practice leaves and the original 20×20 map remain optional in the menu, sharing one automatic save. New journey replaces it and always starts the skippable guide; Remember the past resumes it and is hidden without a save.

## Controls

| Action | Control |
| --- | --- |
| Choose a tool | Select `Bright`, `Dark`, `Erase`, or `Move`; keys 1–4 only select the tool |
| Apply the current tool | Click, tap, or Enter |
| Paint continuously | With a mouse or pen, hold and drag; the whole stroke is one undo step |
| Mark dark directly | Right-click or Shift+click |
| Return a cell to unknown | Select `Erase`, press Delete/Backspace/0, or repeat its current bright/dark action |
| Move around the board | Arrow keys; Home/End for a row, Ctrl/Command+Home/End for the whole board |
| Undo or redo | Select `Undo` / `Redo`; or press Ctrl/Command+Z and Ctrl+Y or Ctrl/Command+Shift+Z |
| Pan and zoom | Space+drag, middle drag, or `Move`; mouse wheel to zoom; touch drag/pinch |
| Select a country | Select its whole-map label; marking is enabled at 28 CSS pixels per cell or above |
| Request a necessary step | Select `Hint` |
| Check or clean the board | Menu → `Check this map`, or fixed `Clear errors` across the loaded map |
| Change levels or reread stories | Menu → `Practice & previous edition` or `Collected notes` |

## Language

The interface, dynamic hints, accessibility labels, tutorials, banquet, country records, and epilogue are available in English and Simplified Chinese. The first visit follows the browser's preferred language and falls back to English. A manual `中` / `EN` choice is stored locally without resetting puzzle progress.

## Features

- Five local boards: one continuous journey, three optional tutorials, and the previous seven-country map.
- Seven authored country motifs turn each formal-map solution into local geography, architecture, or an archival object rather than random texture.
- Region-clipped clue values from 0 to 9, with every region directly solvable from visible clues.
- MiniZinc verification that no committed region admits a second solution.
- Trace-based difficulty profiles that separate basic versus advanced reasoning from short, medium, or long workload.
- Hints derived from the player's current board, contradiction reporting, region filtering, and wrong-mark cleanup.
- Touch-ready bright, dark, and erase tools plus two-dimensional keyboard navigation.
- Gap-free mouse and pen drag painting, with one history entry per stroke.
- Session undo/redo that restores cell marks and country-story state together, including moves across a country's completion.
- One overwriting local autosave; banquet milestones, one-time fall records, a chapter epilogue, and a rereadable archive.
- Public level JSON contains bilingual content, map geometry, and clues, but omits target solutions.

## Development

Requirements:

- Python 3.10+;
- Node.js with npm;
- MiniZinc with the Gecode solver for generation and strict uniqueness checks.

Run the local game:

```powershell
npm start
```

Then open <http://localhost:4173/>.

Run the test suite:

```powershell
npm test
```

Regenerate the legacy level book and four legacy boards:

```powershell
npm run generate
```

This rewrites the legacy level files and catalog while preserving its continuous-journey entry. Generation fails if MiniZinc cannot prove every region unique. Use `npm run generate:map` to rebuild only the old Inner Sea map. Generate the continuous map separately with `python tools/generate_journey.py`.

Inspect generated level and region difficulty metrics:

```powershell
npm run report:difficulty
```

## Documentation

- [Continuous journey specification](docs/design/continuous-journey.md)
- [Continuous journey validation](docs/development/continuous-journey-validation.md)
- [Narrative packaging](docs/design/narrative-packaging.md)
- [Hint-system guardrails](docs/design/hint-system.md)
- [Prologue and level-book architecture](docs/development/prologue-and-level-book.md)
- [Difficulty-grading contract](docs/development/difficulty-grading.md)
- [Chapter-one content and motif contract](docs/development/chapter-one-content.md)
- [Touch and keyboard controls](docs/development/touch-and-keyboard-controls.md)
- [Drag-painting contract](docs/development/drag-painting.md)
- [Undo/redo history contract](docs/development/undo-redo-history.md)
- [Gameplay lineage research](research/proverbs/gameplay-lineage-2026-08-28.md)
- [Repository layout](docs/development/repository-layout.md)

## Status

Version `0.9.0` turns the Seven Kingdoms from random solution texture into seven authored map motifs. Each fall record now identifies the restored image and its fixed place in the conquest chronology, while generation still enforces balanced light/dark cells, direct no-guess solving, and MiniZinc uniqueness.

The public game remains the previous edition. The local continuous journey is an unpublished replacement; see its validation record for tested flows and device limits. Additional chapters, final art, and production balancing are outside this change.


## License

No open-source license is currently included in this repository. Source availability does not grant permission to reuse, modify, or redistribute the code or game content.
