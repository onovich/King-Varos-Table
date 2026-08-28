# King Varo's Table

[简体中文](README.zh-CN.md)

A browser-playable prototype for a no-guess 3×3 neighborhood counting puzzle, set on the divided map of King Varo's short-lived empire.

![King Varo's Table social preview](docs/social-preview.png)

## About

Every clue counts the bright cells in a centered area of up to 3×3 cells, including the clue cell itself. A thick regional border clips that area: cells across the border never count. Mark every cell bright or dark to reconstruct the map.

The committed demo is a 20×20 board divided into seven irregular, self-contained countries, with clue values from 0 through 9 and a solution path that can be completed using visible single-clue deductions. MiniZinc independently checks that each country has no second solution.

The first chapter's narrative loop is playable: completing a country advances one royal banquet, opens a separate card about that country's fall, permanently changes the map, and adds the record to a rereadable archive. After all seven fall records have been read, a one-time epilogue reveals how quickly Varo's empire disappeared while the map survived as evidence. Board and story progress are restored from a versioned local save. The wider direction is specified in the [narrative packaging document](docs/design/narrative-packaging.md).

## How to play

| Action | Control |
| --- | --- |
| Mark a cell bright | Left click or focus the cell and press Enter |
| Mark a cell dark | Right click or Shift+click |
| Return a marked cell to unknown | Repeat the same bright or dark action |
| Request a necessary step | Select **给我一个必然步骤** |
| Check the current board | Select **检查当前推理** |
| Remove every incorrect mark | Select **清除错误答案** |
| Clear the board | Select **重新开局** |
| Reread country stories and the unlocked epilogue | Select **查看亡国档案** or **查看完整地图档案** |

The hint button works from the player's current board. It strongly outlines one actionable clue and weakly outlines that clue's region-clipped neighborhood; it does not silently switch to a more advanced two-clue deduction.

The current interface is in Simplified Chinese. Touch-specific controls have not been implemented.

## Implemented

- Seven connected, irregular countries on one 400-cell board.
- Region-clipped 3×3 clues covering the complete 0–9 range.
- A direct-clue solver shared by level acceptance and browser hint behavior.
- A stricter MiniZinc check that blocks the generated target and searches for a second solution.
- Player-state contradiction checks, focused hints, region filtering, reset and wrong-answer cleanup.
- Country completion, banquet milestones, one-time fall cards, a post–seventh-country epilogue, a rereadable archive and versioned local progress.
- Public level data that contains regions and clues but omits the target solution.
- Internal subset-difference analysis retained for research without being presented as a basic hint.

## Run locally

Requirements:

- Python 3;
- Node.js with npm for the repository scripts and JavaScript-backed tests;
- MiniZinc with the Gecode solver when generating or fully validating a level.

No npm dependencies are declared. From the repository root:

```powershell
npm start
```

Then open <http://localhost:4173/>.

Run the test suite:

```powershell
npm test
```

Regenerate the committed demo level:

```powershell
npm run generate
```

Generation overwrites `web/data/demo-level.json` and requires MiniZinc to prove uniqueness. A timeout or unknown solver result is treated as failure.

This repository was runtime-tested with Python 3.14.3, Node.js 24.13.1, npm 11.8.0, MiniZinc 2.9.7 and Gecode 6.3.0. Other version combinations have not yet been checked.

## Project structure

```text
varos_table/   Python generation, solving and MiniZinc bridge
models/        MiniZinc uniqueness model
web/           Static browser prototype and public demo level
tests/         Python tests plus Node-driven browser-logic tests
tools/         Level-generation command line entry point
docs/          Current design rules, repository notes and preview assets
research/      Source-based gameplay, lineage and naming research
```

See the complete [repository layout](docs/development/repository-layout.md), the [hint-system guardrails](docs/design/hint-system.md), and the [gameplay lineage research](research/proverbs/gameplay-lineage-2026-08-28.md).

## Status

The puzzle engine, fixed seven-country demo, deterministic basic hint path, wrong-answer cleanup, MiniZinc uniqueness verification and complete first-chapter narrative loop are implemented and covered by 26 local tests. Finished art, production story content and a multi-chapter campaign remain to be built.

This is a local prototype, not a finished release, and there is currently no hosted public demo.

## License

No open-source license is currently included in this repository. Source availability does not grant permission to reuse, modify or redistribute the code or game content.
