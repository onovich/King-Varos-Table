# Continuous journey / 连续地图整改

Approved: 2026-09-07. Implementation baseline: `c1363a2`.

## Confirmed experience

- One continuous, zoomable 32×24 map; seven contiguous countries, all 768 cells covered. Pel Island is the 48-cell opening country; the other six countries have 80–160 cells each.
- Begin/continue → optional guided first country → first fall card → free exploration → seventh fall → banquet ending → epilogue → map/archive revisiting.
- Teaching is embedded in real play; skip always unlocks free exploration. Legacy tutorial leaves become optional practice, never a prerequisite for the new campaign.
- Opening language discusses food and places, not conquest. Banquet chronology follows completed-country count; country food text must not hardcode serving order. One narrative voice, no sentence-level puns.
- Country arrival and first half-correct milestone unlock non-blocking, rereadable short narration. First completion opens one modal story card. Queued events survive refresh; rereading never advances progress.
- Desktop: tools for bright/dark/erase/move; Space+drag/middle drag pans, wheel zooms, right-click marks dark. Touch: tap marks, drag pans, pinch zooms; no touch drag painting. Below 28 CSS px per cell, country selection only. Only the explicitly selected country can be edited.
- Game fills the viewport. Map first; compact header, tools and fixed feedback region. No permanent rule/statistics/story columns. Technical details and full rules belong in menus. Clear errors remains a fixed button and clears wrong marks across the loaded map.
- Existing direct-clue hint, color-only cell marks, no-layout-shift, full-board correction, atomic undo/story and hidden-answer contracts remain mandatory.
- Existing bilingual sealed-atlas visual direction, smooth ink/paper surfaces, shared-grid-edge borders. No generated decorative rules or duplicated prototype geometry.
- All new UI, narration, tutorial, dialogs and accessible labels support zh-CN/en using the existing locale preference.
- Version new map/save separately. Preserve old four-board content and storage; old `?level=` links remain accessible through the same shell. Existing tutorial graduates can skip opening guidance.

## Agreed testing seams

1. Public generated level data: geometry, area, density, direct solving, MiniZinc uniqueness and protected teaching clues.
2. Public session operations: start, select, mark/stroke, hint, correction, history, event acknowledgment, serialization/restoration.
3. Browser-visible controls and flows: opening through first fall, next-country entry, legacy continuation, ending, bilingual/keyboard/touch/viewport checks.

## Delivery boundary

Do not overwrite the deployed stable game until the integrated replacement is tested. No extra countries/chapters, new deduction rules, accounts or cloud saves. Preserve unrelated working-tree art/reference files. Record implementation results and known limitations below; do not mark untested behavior verified.

## Implementation record

- Local implementation and core flow validation completed on 2026-09-07. Current public release remains the previous 20×20 campaign; this replacement has not been published.
- 68 automated tests passed, including strict uniqueness checks on the seven shipped countries. The browser completed all 768 cells through current visible clues and reached the banquet ending, epilogue and 7/7 map.
- See [validation evidence and device limits](../development/continuous-journey-validation.md). Physical touch/pinch and screen-reader software still need device-level validation.


## Superseding title/save decision — 2026-09-08

The user replaced the separate-save requirement above: the title offers New journey, Remember the past (only when saved), and End it all. New journey overwrites the single automatic save and always starts the skippable opening guide. Resume loads that one save without a selector. Legacy practice content remains selectable but uses the same overwriting save. Existing original journey data is migrated on first load (an explicit old run URL migrates that run); obsolete per-map/run saves are retired after a successful write. The title scene uses a receding banquet table, seven empty plates and a faded chart. Exit attempts window.close; restricted browsers show an inert farewell scene with a close-tab instruction.
