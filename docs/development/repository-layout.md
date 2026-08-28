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
│  │  └─ repository-layout.md
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
│  └─ test_web_hint.py
├─ tools/
│  └─ generate_level.py
├─ varos_table/
│  ├─ __init__.py
│  ├─ level.py
│  ├─ minizinc_check.py
│  └─ solver.py
├─ web/
│  ├─ data/
│  │  └─ demo-level.json
│  ├─ app.js
│  ├─ hint-proof.mjs
│  ├─ index.html
│  ├─ puzzle-logic.mjs
│  └─ styles.css
├─ .gitignore
├─ package.json
├─ README.md
└─ README.zh-CN.md
```

## Directory responsibilities

- `varos_table/` owns level generation, deterministic solving and the MiniZinc bridge. It stays at repository root so the verified commands work without an installation step.
- `web/` is the browser-playable prototype. Its public level JSON contains regions and clues, but not the target solution.
- `models/` contains exact constraint models used by the generator.
- `tests/` covers Python domain logic and JavaScript hint behavior through Node subprocesses.
- `docs/design/` contains current product decisions and guardrails. These documents override older naming or theme hypotheses in `research/`.
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
```

`npm run generate` requires MiniZinc with the Gecode solver. Normal gameplay and the committed test suite do not require installing the Python package.

