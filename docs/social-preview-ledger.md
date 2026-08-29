# Social preview design ledger

## Repository and evidence

- Repository: `onovich/King-Varos-Table`
- Visibility: public
- Default branch: `main`
- Evidence mode: `runtime-tested`
- Runtime check: local HTTP server opened in the in-app browser; the level book, three tutorial leaves, 400-cell formal map and bilingual UI rendered without console errors.

Inspected evidence:

| Path | What it proves |
| --- | --- |
| `web/index.html` | Product name, visible rule text, controls and board layout |
| `web/styles.css` | Ink, paper, signal and seven-region palette; print-like material language |
| `web/data/levels/inner-sea.json` | 20×20 board, seven irregular regions, 0–9 clue range and public omission of the target solution |
| `web/puzzle-logic.mjs` | Region-clipped 3×3 neighborhoods and direct-clue hints |
| `varos_table/level.py` | Deterministic generation and direct-clue solvability gate |
| `varos_table/minizinc_check.py` | MiniZinc second-solution blocking check |
| `tests/` | Thirty-six passing tests in the current local run |
| `docs/design/narrative-packaging.md` | Map-and-banquet premise and the role of national borders |

Claim boundaries:

- The current repository is a browser-playable prototype, not a finished game.
- The no-guess guarantee applies to all four committed boards and the direct-clue rule set tested by the generator and browser logic.
- The `v3` cover board uses the same seven-region geometry as the committed formal map. Its cover-specific set of 139 visible clues was recomputed with the production region-clipped neighborhood function; the playable map currently publishes 137 pruned clues. Both sets direct-solve and return no second MiniZinc solution per region.
- The level book, tutorial progression, banquet narrative and country-fall story cards are implemented in the runtime.
- No public hosted demo or open-source license is currently included.

## Promise, proof and exclusions

- Promise: solve a regional 3×3 counting puzzle without guessing and reconstruct King Varo's map.
- Proof:
  - a recognizable multi-country numbered board bounded by one rectangular folio;
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
| Region-clipped board geometry | subject/glyph | 3 | 2 | 3 | 0 | 0 |
| Narrative map-and-table specification | weak reference | 2 | 1 | 1 | 0 | 2 |

- Keep: the ink-and-paper palette, dense numbered grid, colored regions, thick national boundaries and orange hint accent.
- Remove: browser layout, control panels, long Chinese instructions, counters and incidental UI chrome.
- Repair: enlarge the board into a single legible product artifact and reserve a clean title field.
- Supplement: a plate-shaped field behind the map, grounded in the selected title and narrative specification.
- Interpretation level: 3, bounded reconstruction.
- Continuity model: isolated complete artifact.
- Aspect fit: the tall runtime page is not embedded. Its board, palette and topology are extracted and recomposed into a self-contained square map artifact, leaving no inert screenshot gutters.

Fragment ledger:

| Source region | Semantic unit | Boundary | Adjacency | Thumbnail verdict |
| --- | --- | --- | --- | --- |
| Runtime puzzle board | region-clipped clue grid | complete paper panel | isolated over a plate field | pass |
| Runtime title/palette | brand typography and colors | independent left copy field | separated from proof by space | pass |

## Composition

- Production route: code-native SVG.
- Copy region: `x=72..590`, product name, one-sentence task and three evidence labels.
- Product region: `x=650..1208`, a bounded map board over a plate-shaped field.
- Background material: project ink with the same restrained horizontal print texture used by the web prototype.

Line ledger:

| Element | Role | Bounds or endpoints | Evidence |
| --- | --- | --- | --- |
| Cell grid | 20 columns × 20 rows, each exactly 20×20 px | `x=742..1142`, `y=112..512`; explicit lines every 20 px | committed 20×20 demo geometry |
| Irregular internal boundaries | national/logic region boundaries | stepped paths on cell edges, clipped by the outer 400×400 rectangle | narrative countries and region-clipped clue mechanic |
| Plate rings | physical object boundary | closed circles behind the map | project title and narrative premise |
| Hint outlines | target and effective-scope boundaries | exact 60×60 scope around one exact 20×20 cell | implemented direct-clue hint UI |

The subtle horizontal background marks are material texture inherited from `web/styles.css`, not connectors or data lines.

## Version and output

- Baseline: `v2`; it fixed the false 10×8 proof by using an unrotated, exact 20×20 board, but its four rectangular quadrants still read as a dashboard layout rather than a historical map.
- Candidate: `v3`; preserve the exact grid and rectangular folio while repartitioning its interior into seven connected, irregular realms generated on cell boundaries.
- Identity anchors: product name, ink/paper palette, multi-country board, clue digits and orange hint.
- Protected strengths: exact 20×20 geometry, large rectangular crop, readable title, plate-and-paper material, restrained palette and mechanically valid direct-clue highlight.
- Allowed changes: internal region count, region silhouettes, region colors, visible clue placement and the selected hint cell.
- Forbidden changes: rotating or warping the board; moving any internal boundary off the 20 px lattice; allowing a region fill outside the outer rectangle; showing clue values that were not recomputed for the new borders; invented artwork or unsupported release claims; generic restyling that replaces the board with decoration.
- Promotion verdict: promote. Compared with `v2`, the candidate adds a readable kingdom-map silhouette without changing the exact outer frame or any cell dimensions. All seven regions are connected, the irregular borders remain on cell edges, and the candidate passes the full-size and both thumbnail reviews without weakening title or product-proof legibility.

Output targets:

- Editable source: `docs/social-preview.svg`
- Raster: `docs/social-preview.png`
- Review sheet: temporary validation artifact, not committed
- Raster result: 1280×640 PNG, 37,150 bytes
- Mechanical validation: pass (400×400 clip; 20×20 exact grid; seven connected regions containing 69, 50, 56, 67, 70, 55 and 33 cells; 139 recomputed visible clues; direct-solved and MiniZinc-unique per region; UTF-8 clean; no rotation)
- Full-size visual review: pass
- 320×160 light-surround review: pass
- 320×160 dark-surround review: pass
- GitHub settings upload: not requested

Authorization record:

- README modified: yes, explicitly requested
- Preview assets committed to the repository: authorized as part of the requested repository cover and push
- GitHub social-preview settings upload: no; creation and repository push do not authorize changing that setting
