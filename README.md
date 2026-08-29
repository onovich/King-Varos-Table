# King Varo's Table

[简体中文](README.zh-CN.md)

A browser-based, no-guess logic puzzle about restoring the divided map of King Varo's short-lived empire. Read each number inside its national borders, complete the map, and uncover what the royal banquet was recording.

![King Varo's Table social preview](docs/social-preview.png)

## How to play

Each number counts the bright cells in a centered area of up to 3×3 cells, including the numbered cell itself. Thick country borders clip that area, so adjacent cells across a border never count. Mark every cell bright or dark to reconstruct each country.

The built-in level book starts with three short tutorial leaves, then unlocks the 20×20 map of the Seven Kingdoms of the Inner Sea. Completing a country on the formal map advances the banquet and reveals a record of its fall; completing all seven reveals a historical epilogue.

## Controls

| Action | Control |
| --- | --- |
| Mark a cell bright | Left click, or focus the cell and press Enter |
| Mark a cell dark | Right click or Shift+click |
| Return a cell to unknown | Repeat its current bright or dark action |
| Request a necessary step | Select `Show a certain step` |
| Check or clean the board | Select `Check my reasoning` or `Remove wrong marks` |
| Change levels | Open `Level Book` |
| Restart or reread stories | Select `Start over` or the map archive button |

## Language

The interface, dynamic hints, accessibility labels, tutorials, banquet, country records, and epilogue are available in English and Simplified Chinese. The first visit follows the browser's preferred language and falls back to English. A manual `中` / `EN` choice is stored locally without resetting puzzle progress.

## Features

- Four committed boards: three progressive tutorials and one seven-country formal map.
- Region-clipped clue values from 0 to 9, with every region directly solvable from visible clues.
- MiniZinc verification that no committed region admits a second solution.
- Hints derived from the player's current board, contradiction reporting, region filtering, and wrong-mark cleanup.
- Per-level local saves, sequential unlocks, banquet milestones, one-time fall records, a chapter epilogue, and a rereadable archive.
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

Regenerate the level book and all committed boards:

```powershell
npm run generate
```

This rewrites `web/data/campaign.json` and `web/data/levels/*.json`. Generation fails if MiniZinc cannot prove every region unique. Use `npm run generate:map` to rebuild only the formal Inner Sea map.

## Documentation

- [Narrative packaging](docs/design/narrative-packaging.md)
- [Hint-system guardrails](docs/design/hint-system.md)
- [Prologue and level-book architecture](docs/development/prologue-and-level-book.md)
- [Gameplay lineage research](research/proverbs/gameplay-lineage-2026-08-28.md)
- [Repository layout](docs/development/repository-layout.md)

## Status

Version `0.4.0` is a locally playable campaign slice. This update was runtime-tested in English and Simplified Chinese at desktop, 768px, and 320px widths; the complete tutorial-to-formal-map unlock flow produced no browser console errors. All 36 automated tests pass.

There is no hosted public demo. Additional chapters, final art, production balancing, and complete keyboard-only and touch controls remain to be built.

## License

No open-source license is currently included in this repository. Source availability does not grant permission to reuse, modify, or redistribute the code or game content.
