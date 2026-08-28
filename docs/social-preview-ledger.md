# Social preview design ledger

## Repository and evidence

- Repository: `onovich/King-Varos-Table`
- Visibility: public
- Default branch: `main`
- Evidence mode: `runtime-tested`
- Runtime check: local HTTP server opened in headless Chrome; the page returned HTTP 200, rendered 400 board cells and five region tabs including the all-regions tab, and produced no console or page errors.

Inspected evidence:

| Path | What it proves |
| --- | --- |
| `web/index.html` | Product name, visible rule text, controls and board layout |
| `web/styles.css` | Ink, paper, signal and four-region palette; print-like material language |
| `web/data/demo-level.json` | 20×20 board, four 100-cell regions, 0–9 clue range and public omission of the target solution |
| `web/puzzle-logic.mjs` | Region-clipped 3×3 neighborhoods and direct-clue hints |
| `varos_table/level.py` | Deterministic generation and direct-clue solvability gate |
| `varos_table/minizinc_check.py` | MiniZinc second-solution blocking check |
| `tests/` | Eighteen passing tests in the current local run |
| `docs/design/narrative-packaging.md` | Map-and-banquet premise and the role of national borders |

Claim boundaries:

- The current repository is a browser-playable prototype, not a finished game.
- The no-guess guarantee applies to the committed demo and the direct-clue rule set tested by the generator and browser logic.
- The banquet narrative and country-fall story cards are documented but not implemented in the runtime.
- No public hosted demo or open-source license is currently included.

## Promise, proof and exclusions

- Promise: solve a regional 3×3 counting puzzle without guessing and reconstruct King Varo's map.
- Proof:
  - a recognizable four-region numbered board;
  - clue values from 0 through 9;
  - uniqueness checked by MiniZinc.
- Exclude:
  - future story cards and finished campaign content;
  - unsupported player counts, platforms, performance or release claims;
  - technical architecture that is not part of the player's first impression.

## Source-material route

| Artifact | Role | Identity | Beauty | Readiness | Noise | Deficit |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Local runtime board | complete artifact | 3 | 2 | 1 | 2 | 1 |
| `web/styles.css` palette and paper texture | brand/material | 3 | 3 | 3 | 0 | 0 |
| Four-region board geometry | subject/glyph | 3 | 2 | 3 | 0 | 0 |
| Narrative map-and-table specification | weak reference | 2 | 1 | 1 | 0 | 2 |

- Keep: the ink-and-paper palette, dense numbered grid, four colored regions, thick national boundaries and orange hint accent.
- Remove: browser layout, control panels, long Chinese instructions, counters and incidental UI chrome.
- Repair: enlarge the board into a single legible product artifact and reserve a clean title field.
- Supplement: a plate-shaped field behind the map, grounded in the selected title and narrative specification.
- Interpretation level: 3, bounded reconstruction.
- Continuity model: isolated complete artifact.
- Aspect fit: the tall runtime page is not embedded. Its board, palette and topology are extracted and recomposed into a self-contained 500×450 map artifact, leaving no inert screenshot gutters.

Fragment ledger:

| Source region | Semantic unit | Boundary | Adjacency | Thumbnail verdict |
| --- | --- | --- | --- | --- |
| Runtime puzzle board | four-region clue grid | complete paper panel | isolated over a plate field | pass |
| Runtime title/palette | brand typography and colors | independent left copy field | separated from proof by space | pass |

## Composition

- Production route: code-native SVG.
- Copy region: `x=72..590`, product name, one-sentence task and three evidence labels.
- Product region: `x=650..1208`, a bounded map board over a plate-shaped field.
- Background material: project ink with the same restrained horizontal print texture used by the web prototype.

Line ledger:

| Element | Role | Bounds or endpoints | Evidence |
| --- | --- | --- | --- |
| Cell grid | board boundaries | clipped to the map board | current 20×20 board language |
| Heavy cross-boundaries | national/logic region boundaries | span the board at the four-region divisions | region-clipped clue mechanic |
| Plate rings | physical object boundary | closed circles behind the map | project title and narrative premise |
| Hint outlines | target and effective-scope boundaries | closed cells inside one 3×3 neighborhood | implemented direct-clue hint UI |

The subtle horizontal background marks are material texture inherited from `web/styles.css`, not connectors or data lines.

## Version and output

- Baseline: none.
- Candidate: `v1`.
- Identity anchors: product name, ink/paper palette, four-region board, clue digits and orange hint.
- Forbidden changes: invented artwork, unsupported release claims, a generic purple gradient, or replacing the board with decorative code imagery.
- Promotion verdict: promote. The corrected hint scope remains inside the board, and the title and product artifact remain legible in both light- and dark-surround 320×160 reviews.

Output targets:

- Editable source: `docs/social-preview.svg`
- Raster: `docs/social-preview.png`
- Review sheet: temporary validation artifact, not committed
- Raster result: 1280×640 PNG, 60,299 bytes
- Mechanical validation: pass
- Full-size visual review: pass
- 320×160 light-surround review: pass
- 320×160 dark-surround review: pass
- GitHub settings upload: not requested

Authorization record:

- README modified: yes, explicitly requested
- Preview assets committed to the repository: authorized as part of the requested repository cover and push
- GitHub social-preview settings upload: no; creation and repository push do not authorize changing that setting
