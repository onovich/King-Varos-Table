# Repository layout

This document records the public repository structure for **King Varo's Table**. Machine-specific Codex configuration and the private prototype handoff remain local and are ignored by Git.

## Naming map

| Use | Name |
| --- | --- |
| Product | `King Varo's Table` |
| Chinese display name | `瓦罗王的餐桌` |
| GitHub repository | `onovich/King-Varos-Table` |
| Python package | `varos_table` |
| npm command package | `varos-table` |

## Public tree

```text
King-Varos-Table/
├─ .github/
│  └─ workflows/
│     └─ test.yml
├─ docs/
│  ├─ design/
│  │  ├─ hint-system.md
│  │  ├─ naming-history.md
│  │  └─ narrative-packaging.md
│  ├─ development/
│  │  ├─ first-fall-vertical-slice.md
│  │  ├─ prologue-and-level-book.md
│  │  ├─ touch-and-keyboard-controls.md
│  │  ├─ undo-redo-history.md
│  │  └─ repository-layout.md
│  ├─ ideas/
│  │  └─ layered-land-puzzle.md
│  ├─ social-preview-ledger.md
│  ├─ social-preview.png
│  └─ social-preview.svg
├─ models/
│  └─ region_unique.mzn
├─ research/
│  ├─ comparative/
│  └─ proverbs/
├─ tests/
│  ├─ test_core.py
│  ├─ test_campaign_state.py
│  ├─ test_board_history.py
│  ├─ test_i18n.py
│  ├─ test_input_tools.py
│  ├─ test_level_book.py
│  └─ test_web_hint.py
├─ tools/
│  ├─ generate_campaign.py
│  └─ generate_level.py
├─ varos_table/
│  ├─ __init__.py
│  ├─ content.py
│  ├─ level.py
│  ├─ minizinc_check.py
│  ├─ solver.py
│  └─ tutorials.py
├─ web/
│  ├─ data/
│  │  ├─ campaign.json
│  │  └─ levels/
│  │     ├─ first-light.json
│  │     ├─ inner-sea.json
│  │     ├─ three-small-realms.json
│  │     └─ within-the-border.json
│  ├─ app.js
│  ├─ board-history.mjs
│  ├─ campaign-state.mjs
│  ├─ campaign-ui.mjs
│  ├─ hint-proof.mjs
│  ├─ i18n.mjs
│  ├─ input-tools.mjs
│  ├─ index.html
│  ├─ level-book-ui.mjs
│  ├─ level-book.mjs
│  ├─ puzzle-logic.mjs
│  └─ styles.css
├─ .gitignore
├─ package.json
├─ README.md
└─ README.zh-CN.md
```

## Directory responsibilities

- `varos_table/` owns formal-map and tutorial generation, localized chapter content, deterministic solving and the MiniZinc bridge. It stays at repository root so the verified commands work without an installation step.
- `web/` is the browser-playable campaign slice. Its i18n module owns English and Simplified Chinese interface text; `input-tools.mjs` owns pointer and keyboard input semantics; `board-history.mjs` owns immutable board-and-story snapshots; `level-book.mjs` owns unlock/save rules; `level-book-ui.mjs` only renders the catalog. Public level JSON contains bilingual content, regions and clues but not target solutions.
- `web/data/campaign.json` is the small level-book manifest. Each file under `web/data/levels/` remains independently loadable and independently saved.
- `models/` contains exact constraint models used by the generator.
- `tests/` covers Python domain logic plus JavaScript hint, input, campaign-state, level-book and localization behavior through Node subprocesses.
- `docs/design/` contains current product decisions and guardrails. These documents override older naming or theme hypotheses in `research/`.
- `docs/development/` records executable milestones and repository operations; `docs/ideas/` parks deliberately out-of-scope concepts without adding them to the current product contract.
- `research/` keeps source-based investigation and historical comparisons separate from current specifications.
- `docs/social-preview.*` is the editable and rendered GitHub preview pair; the ledger records evidence and validation.

## Public and local boundaries

- `.codex/` is ignored because its workflow configuration contains machine-specific paths.
- `PROVERBS_HANDOFF.md` is ignored because it contains private task and migration context. Publicly useful lineage research already lives under `research/`.
- Python bytecode, virtual environments, Node dependencies and debug level exports remain ignored.
- No open-source license is currently included. Source visibility on GitHub does not grant reuse rights.

## Verified repository commands

```powershell
npm start
npm test
npm run generate
npm run generate:map
```

`npm run generate` rebuilds the manifest and all four boards; `npm run generate:map` rebuilds only the formal Inner Sea map. Both generation commands require MiniZinc with the Gecode solver. `npm test` can run without MiniZinc, but it skips the MiniZinc integration check; full verification uses MiniZinc. Normal gameplay does not require installing the Python package.
