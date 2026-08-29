# King Varo's Table

[简体中文](README.zh-CN.md)

A browser-based logic puzzle about restoring the divided map of King Varo's short-lived empire. The included chapter is designed to be solved without guessing.

![King Varo's Table social preview](docs/social-preview.png)

## Gameplay

Each number counts the bright cells in a centered area of up to 3×3 cells, including the numbered cell itself. Thick country borders clip that area, so cells across a border never count. Mark every cell bright or dark to reconstruct the map.

The current 20×20 chapter contains seven irregular countries. Completing a country advances the royal banquet and reveals a record of its fall; completing the chapter unlocks a historical epilogue.

## Controls

| Action | Control |
| --- | --- |
| Mark a cell bright | Left click, or focus the cell and press Enter |
| Mark a cell dark | Right click or Shift+click |
| Return a cell to unknown | Repeat its current bright or dark action |
| Request a necessary step | Select `Show a certain step` |
| Check or clean the board | Select `Check my reasoning` or `Remove wrong marks` |
| Restart or reread stories | Select `Start over` or the map archive button |

## Language

The complete interface, dynamic hints, accessibility labels, banquet text, country records, and epilogue are available in English and Simplified Chinese.

On the first visit, the game follows the browser's preferred language and falls back to English when neither language is present. The language switcher in the upper-right corner stores a manual choice locally and uses it on later visits. Changing language does not reset board or story progress.

## Features

- Seven connected, irregular countries with region-clipped clues covering 0–9.
- A visible single-clue deduction path, plus MiniZinc verification that each country has no second solution.
- Hints calculated from the player's current board, contradiction reporting, country filtering, and wrong-answer cleanup.
- Banquet milestones, one-time fall records, a chapter epilogue, a rereadable archive, and versioned local saves.
- Public level data contains the map, bilingual narrative, and clues but omits the target solution.

## Development

Requirements:

- Python 3;
- Node.js with npm;
- MiniZinc with the Gecode solver for level generation and full uniqueness checks.

Run the local prototype:

```powershell
npm start
```

Then open <http://localhost:4173/>.

Run the test suite:

```powershell
npm test
```

Regenerate the committed level:

```powershell
npm run generate
```

Generation overwrites `web/data/demo-level.json` and fails unless MiniZinc proves every country unique.

## Documentation

- [Narrative packaging](docs/design/narrative-packaging.md)
- [Hint-system guardrails](docs/design/hint-system.md)
- [Gameplay lineage research](research/proverbs/gameplay-lineage-2026-08-28.md)
- [Repository layout](docs/development/repository-layout.md)

## Status

Version `0.3.0` is a locally playable prototype with one seven-country chapter. English and Simplified Chinese were runtime-tested in the browser during the current localization pass. The interface currently targets desktop pointer input; Enter can mark bright cells, but complete keyboard-only and touch controls are not implemented. There is no hosted public demo.

All 31 automated tests passed during this update. Finished art, production story content, and a multi-chapter campaign remain to be built.

## License

No open-source license is currently included in this repository. Source availability does not grant permission to reuse, modify, or redistribute the code or game content.
