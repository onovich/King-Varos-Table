# Continuous journey validation

Date: 2026-09-07. Baseline: `c1363a2`. Local, unpublished replacement of the entry page; the public previous edition has not been deployed over.

## Scope and preservation

The approved [continuous journey](../design/continuous-journey.md) uses one 32×24 / 768-cell map with seven connected countries. Pel Island is the 48-cell opening. Its guidance can be skipped; otherwise reading its first fall unlocks free exploration. Arrival and halfway notes, seven fall records, the banquet ending and historical epilogue share the same game shell.

The working tree was transferred from `D:/WebProjects/LearnProverbs` to the Codex worktree. All 75 source changed/untracked files were compared: no missing files or content differences; tracked files differed only in LF/CRLF normalization. Existing prototype assets and the user's dormant `web/app.js` / `web/styles.css` edits remain preserved. The former HTML is archived in `docs/ui-concepts/pre-journey-index.html`. Four legacy level JSON files remain unchanged.

The new save namespace is separate from legacy board saves. Valid legacy saves can be imported into the shared shell. Practice is optional; the third practice returns to the new map and resumes its existing progress.

## Automated checks

- `python -m unittest discover -s tests`: 68 passed with MiniZinc/Gecode available; no skips.
- Actual shipped journey JSON: 32×24 geometry, country coverage/counts, 0–9 clue range, balanced bright/dark solutions, direct solvability, opening zero/full/border teaching clues, and no public answer fields.
- Seven independent MiniZinc second-solution checks against that shipped JSON all proved uniqueness. The map was not regenerated for these checks.
- Session tests: first fall reload, full seven-country completion, whole-board correction, undo/redo, ending reload, malformed/unstarted saves, legacy import, guide skip, and undo-final-completion followed by a new branch.
- Input adapter event tests: release endpoint interpolation, one stroke per commit, Space pan after toolbar focus, touch pan, pinch, and keyboard number/Home/End behavior. These are event-level tests, not physical-device gesture tests.
- `node --check` passed for all journey modules, the camera and shared board-history module.
- Difficulty catalog check passed for all five boards; journey has 236 visible clues, 218 basic direct deductions and zero advanced deductions.

## Browser verification

Codex in-app browser against the current worktree only. Initial port 4174 exposed cached modules; final verification used a dedicated no-store HTTP service on `127.0.0.1:4175` with an absolute directory binding. Production data and the original 4173 service were not cleared or changed.

- Fresh opening shows the zero-clue lesson and strong/soft hint scopes.
- A real mouse drag painted four adjacent cells; one undo restored all four, with no viewport scroll drift.
- Skip guidance permits choosing another country; first-fall acknowledgment also unlocks all seven labels.
- All 768 cells completed through visible DOM hints and keyboard input. Only displayed clue values and scoped current marks were used to infer each next move; no hidden session API or answer injection.
- First fall survived refresh before reading. Seven fall records included fixed chronology, restored-image explanation and surviving trace.
- Final fall → banquet ending → epilogue → 7/7 map worked. Refresh while the banquet ending was pending restored the exact event.
- English/Chinese menu switching and English practice operation worked.
- All three legacy practices completed through visible hints; first and second advanced automatically, and the third returned to the existing 7/7 new-map save without resetting it.
- Native Space activation of the menu button works after the pan-modifier fix; the final browser console contained no warnings or errors.
- 320, 768, 1024 and 1440 pixel widths: no document horizontal overflow; all fixed tools and reading buttons remained in the viewport. 320-pixel overview was visually inspected. At 1440×1000, Whole map correctly exposed all country labels.

## Review and fixes

Two independent read-only reviews covered standards and the approved spec. Shared atomic-history finding was fixed by including progression-dependent notes and ending state in board snapshots. Ordinary redo keeps acknowledged events closed; a new completion branch earns its ending again.

### Standards

Three original findings (atomic narrative history, release endpoint, keyboard compatibility) and one follow-up finding (native Space button activation) were fixed. The original three were independently rechecked; the follow-up has both an input regression assertion and browser menu activation evidence.

### Spec

Three findings (atomic narrative history, Space pan after toolbar focus, missing restored-image explanation) were fixed and independently rechecked. No additional substantive regression or scope creep was reported.

Other fixes: final pointer release refresh; Space pan independent of toolbar focus; restored numeric marking and Home/End navigation; localized map-reveal explanation on fall cards; immediate persistence when reading archive notes; transient feedback can be dismissed by reading it; large-display overview remains below the editing threshold; unstarted saves retain their state; resuming an empty map preserves its camera.

## Remaining device limits

Physical touch/pinch, pen hardware and screen-reader software were not available in this browser interface. Touch arbitration is covered by event tests; native device behavior needs a separate device pass. This is not a claim of full cross-browser or accessibility certification. Publication requires separate authorization.

## 2026-09-08 — Blind-playtest follow-up

Implemented the accepted feedback from `blind-playtest-20260907.md`:

- Completed countries explicitly show read-only state, disable paint/hint tools, and open stories only through Country record. Selecting the country no longer opens a modal.
- Restart creates a separate run key and preserves the original save. Menu actions return to the original or continue the latest separate run; trial practice completion does not alter original level-book graduation.
- The header reports marked cells for the active country, with a separate-playthrough label where applicable. This count does not claim correctness.
- Mouse selection transfers keyboard focus to the cell, including after toolbar use. Added a regression assertion.
- Country focus is no longer forcibly centered against the whole board on small maps. Visible hints preserve the camera; resizing retains the viewed center. Added the edge-country fit regression.
- Tutorial text explicitly transitions from zero/full examples to independent deduction. Contradictions identify a clue and its scope without revealing the wrong cell or filling answers.
- Opening text connects the dishes to their origins. Pel Island has a completed coast-chart sample generated from its marked grid, available in its fall card and through Restored coast. Other countries retain their existing art treatment.

Validation: 68 unittest cases pass with MiniZinc on PATH. Browser checks on port 4175 verified original 7/7 → separate 0/48 → two mouse/keyboard marks → original 7/7 → separate 2/48, plus reload persistence. Clicking a completed country left zero dialogs open; its explicit coast button opened the sample. Hint followed by coordinate click, Right and Return focused the adjacent cell and marked it. A deliberate bright mark on a zero produced one conflict clue and four scoped cells, then undo restored the mark. Visible hint kept the transform identical. Chinese/English 320-pixel layouts showed no horizontal document overflow; resizing kept the current map center after the fix. Physical touch remains unverified.

Local changes only; no commit, push or deployment performed.
## 2026-09-08 — Round-two fixes

- Numeric keys 1–4 now select tools and return without changing the focused cell or adding history. Enter applies the tool. The public input regression failed before the fix and passed afterwards.
- Dialog opening focuses the heading and resets scroll to the top. Tab still reaches the story continuation. Browser checks on desktop and 320×740 verified storyTitle focus, scrollTop=0 and visible title; no horizontal overflow.
- Notes distinguish Food & origins / Local life and banquet titles, with unread badges and source titles in the fixed reading strip. Reading marks the entry read.
- Note details and archived country stories return to their list; lists and help opened from the menu return to the menu. Both explicit back buttons and Escape were checked through real UI. No puzzle progress is changed by navigation.
- The full-count lesson introduces mouse drag painting and whole-stroke undo, while preserving touch tap instructions.
- Unfinished country labels offer short existing motif hooks on wide screens. Compact screens prioritize readable country names and progress. Neighboring-country numbers are quieter in focused views. The Pel chart adds an empty timber landing while retaining the earned grid silhouette; this remains a single-country visual sample, not a full art pass.

Validation: 68 unittest cases passed with MiniZinc available. Browser verified 1/2/3/4 leave progress and the focus-cell value unchanged, while Enter marks; note detail → list, archived story → list, list → menu and help Escape → menu; read badges update; English help/back label; original completed save remains separate from the trial. Physical touch remains outside this verification. No commit, push or deployment.

## Title and single-autosave replacement — 2026-09-08

Implemented the user's newer single-slot requirement, superseding previous separate-trial behavior. A new autosave module writes the replacement before removing obsolete journey/map save keys; quota failures preserve the previous data. Two added tests cover replacement, migration cleanup, invalid saves, failed writes, resuming skipped guidance and restarting fresh guidance. 70 tests passed with MiniZinc.

Browser validation on fresh origin 4187: no-save title omits Remember the past; New journey opens 0/48 with Skip guidance; marking one cell and skipping survives title return and refresh; Remember the past restores 1/48 with guidance skipped; New journey then resets to 0/48 with guidance active. No slot selector or original/trial controls remain. 320×740 title and desktop Chinese/English visuals inspected. Exit stopped the game and displayed the farewell scene; the in-app browser did not permit self-closing. On source 4175 the existing 7/7 original was migrated and resumed successfully, then returned to title without beginning a new game. No push or deployment.

## Country camera easing — 2026-09-08

Selecting a country and pressing Focus now interpolate the live x/y/scale camera over 520ms using cubic ease-out. Input hit testing reads the same camera as rendering. Pointer-down, direct pan/zoom, resizing, loading and leaving the game cancel pending motion; reduced-motion preference uses an immediate transition. Frames update session camera without synchronous storage writes each frame; the completed motion persists normally.

71 tests pass. Added deterministic animation coverage for the midpoint easing value, exact endpoint, cancellation, replacement from the live position, and reduced motion. Browser confirmed an intermediate transform followed by the intended final country fit, preserved 7/7 progress and no console warnings/errors.