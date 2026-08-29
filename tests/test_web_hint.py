import shutil
import subprocess
import unittest
from pathlib import Path


class HintLayoutTests(unittest.TestCase):
    def test_hint_does_not_render_an_expanding_summary_panel(self):
        project_root = Path(__file__).resolve().parents[1]
        html = (project_root / "web" / "index.html").read_text(encoding="utf-8")
        script = (project_root / "web" / "app.js").read_text(encoding="utf-8")
        styles = (project_root / "web" / "styles.css").read_text(encoding="utf-8")

        self.assertNotIn("boardHintSummary", html)
        self.assertNotIn("boardHintSummary", script)
        self.assertNotIn(".board-hint-summary", styles)

    def test_error_cleanup_is_a_permanent_control_not_a_board_overlay(self):
        project_root = Path(__file__).resolve().parents[1]
        html = (project_root / "web" / "index.html").read_text(encoding="utf-8")
        script = (project_root / "web" / "app.js").read_text(encoding="utf-8")

        self.assertIn('id="clearErrorsButton"', html)
        self.assertIn('refs.clearErrorsButton.addEventListener("click", clearErrors)', script)


@unittest.skipUnless(shutil.which("node"), "Node.js is required for browser hint tests")
class BrowserHintEngineTests(unittest.TestCase):
    def test_error_cleanup_removes_only_wrong_marks_against_the_derived_solution(self):
        script = r'''
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  BRIGHT,
  DARK,
  UNKNOWN,
  clearIncorrectValues,
  deriveDirectSolution,
} from "./web/puzzle-logic.mjs";

const level = JSON.parse(fs.readFileSync("./web/data/levels/inner-sea.json", "utf8"));
const derivedSolution = deriveDirectSolution(level);
assert.ok(derivedSolution);
assert.equal(derivedSolution.length, 400);
assert.ok(derivedSolution.every((value) => value === BRIGHT || value === DARK));

const playerValues = [BRIGHT, DARK, UNKNOWN, DARK];
const knownSolution = [BRIGHT, BRIGHT, DARK, DARK];
const cleanup = clearIncorrectValues(playerValues, knownSolution);
assert.deepEqual(cleanup.values, [BRIGHT, UNKNOWN, UNKNOWN, DARK]);
assert.deepEqual(cleanup.removedIndices, [1]);
assert.deepEqual(playerValues, [BRIGHT, DARK, UNKNOWN, DARK]);
'''
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=Path(__file__).resolve().parents[1],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_demo_level_is_solvable_using_only_direct_clue_hints(self):
        script = r'''
import assert from "node:assert/strict";
import fs from "node:fs";
import { UNKNOWN, findDirectClueHint } from "./web/puzzle-logic.mjs";

const level = JSON.parse(fs.readFileSync("./web/data/levels/inner-sea.json", "utf8"));
const values = Array(level.width * level.height).fill(UNKNOWN);

while (true) {
  const candidates = level.regions
    .map((region) => ({ region, hint: findDirectClueHint(level, region, values) }))
    .filter(({ hint }) => hint.status === "ok")
    .sort((left, right) => {
      if (left.hint.dependsOnPlayerMarks !== right.hint.dependsOnPlayerMarks) {
        return left.hint.dependsOnPlayerMarks ? -1 : 1;
      }
      if (left.hint.forcedCells.length !== right.hint.forcedCells.length) {
        return left.hint.forcedCells.length - right.hint.forcedCells.length;
      }
      return left.region.id - right.region.id;
    });
  const hint = candidates[0]?.hint;
  if (!hint) break;
  for (const index of hint.forcedCells) values[index] = hint.value;
}

const solved = values.filter((value) => value !== UNKNOWN).length;
assert.equal(solved, values.length, `direct hints stalled at ${solved}/${values.length}`);
'''
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=Path(__file__).resolve().parents[1],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_direct_hint_targets_the_clue_and_its_region_clipped_scope(self):
        script = r'''
import assert from "node:assert/strict";
import { DARK, UNKNOWN, findDirectClueHint } from "./web/puzzle-logic.mjs";

const level = {
  width: 3,
  height: 3,
  regionMap: [0, 0, 1, 0, 0, 1, 1, 1, 1],
};
const region = {
  id: 0,
  cells: [0, 1, 3, 4],
  clues: { 0: 0 },
};
const values = Array(9).fill(UNKNOWN);
values[1] = DARK;

const hint = findDirectClueHint(level, region, values);
assert.equal(hint.status, "ok");
assert.equal(hint.kind, "direct-clue");
assert.equal(hint.clueIndex, 0);
assert.equal(hint.cell, 0);
assert.deepEqual(hint.scopeCells, [0, 1, 3, 4]);
assert.deepEqual(hint.unknownCells, [0, 3, 4]);
assert.deepEqual(hint.forcedCells, [0, 3, 4]);
assert.equal(hint.value, DARK);
assert.equal(hint.knownBright, 0);
assert.equal(hint.knownDark, 1);
assert.equal(hint.remaining, 0);
assert.equal(hint.dependsOnPlayerMarks, true);
'''
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=Path(__file__).resolve().parents[1],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_direct_hint_can_cover_all_nine_cells_and_never_upgrades_to_a_difference(self):
        script = r'''
import assert from "node:assert/strict";
import { BRIGHT, DARK, UNKNOWN, findDirectClueHint } from "./web/puzzle-logic.mjs";

const fullLevel = {
  width: 3,
  height: 3,
  regionMap: Array(9).fill(0),
};
const fullRegion = {
  id: 0,
  cells: Array.from({ length: 9 }, (_, index) => index),
  clues: { 4: 9 },
};
const fullHint = findDirectClueHint(fullLevel, fullRegion, Array(9).fill(UNKNOWN));
assert.equal(fullHint.status, "ok");
assert.equal(fullHint.clueIndex, 4);
assert.equal(fullHint.cell, 4);
assert.deepEqual(fullHint.scopeCells, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
assert.deepEqual(fullHint.forcedCells, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
assert.equal(fullHint.value, BRIGHT);
assert.equal(fullHint.clipped, false);

const stalledLevel = {
  width: 3,
  height: 3,
  regionMap: Array(9).fill(0),
};
const stalledRegion = {
  id: 0,
  cells: Array.from({ length: 9 }, (_, index) => index),
  clues: { 4: 4 },
};
const stalled = findDirectClueHint(stalledLevel, stalledRegion, Array(9).fill(UNKNOWN));
assert.equal(stalled.status, "stalled");
assert.equal(stalled.cell, null);
assert.equal(stalled.kind, "direct-clue");
'''
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=Path(__file__).resolve().parents[1],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_hint_replays_current_board_and_exposes_its_proof(self):
        script = r'''
import assert from "node:assert/strict";
import { DARK, UNKNOWN, findNextHint } from "./web/puzzle-logic.mjs";

const level = { width: 3, height: 3, regionMap: Array(9).fill(0) };
const region = {
  id: 0,
  cells: Array.from({ length: 9 }, (_, index) => index),
  clues: { 0: 2, 1: 2 },
};
const values = Array(9).fill(UNKNOWN);
const hint = findNextHint(level, region, values);
assert.equal(hint.status, "ok");
assert.equal(hint.cell, 2);
assert.equal(hint.value, DARK);
assert.deepEqual(hint.forcedCells, [2, 5]);
assert.deepEqual(hint.sourceClueIndices, [0, 1]);
assert.deepEqual(hint.prerequisiteCells, []);
assert.equal(hint.derivation.left.clueIndex, 0);
assert.equal(hint.derivation.left.remaining, 2);
assert.equal(hint.derivation.right.clueIndex, 1);
assert.equal(hint.derivation.right.remaining, 2);
assert.equal(hint.derivation.subset.clueIndex, 0);
assert.equal(hint.derivation.superset.clueIndex, 1);

values[2] = DARK;
const nextHint = findNextHint(level, region, values);
assert.equal(nextHint.status, "ok");
assert.equal(nextHint.cell, 5);
assert.equal(nextHint.value, DARK);
'''
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=Path(__file__).resolve().parents[1],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_hint_proof_explicitly_shows_the_two_overlapping_windows(self):
        script = r'''
import assert from "node:assert/strict";
import { DARK, UNKNOWN, findNextHint } from "./web/puzzle-logic.mjs";
import { buildHintProof } from "./web/hint-proof.mjs";

const level = { width: 3, height: 3, regionMap: Array(9).fill(0) };
const region = {
  id: 0,
  cells: Array.from({ length: 9 }, (_, index) => index),
  clues: { 0: 2, 1: 2 },
};
const values = Array(9).fill(UNKNOWN);
const clues = [2, 2, null, null, null, null, null, null, null];
const hint = findNextHint(level, region, values);
const proof = buildHintProof(level, clues, values, hint);
assert.equal(proof.kind, "subset-difference");
assert.equal(proof.valid, true);
assert.equal(proof.target.index, 2);
assert.equal(proof.target.value, DARK);
assert.deepEqual(proof.superset.cells, [0, 1, 2, 3, 4, 5]);
assert.deepEqual(proof.subset.cells, [0, 1, 3, 4]);
assert.deepEqual(proof.sharedCells, [0, 1, 3, 4]);
assert.deepEqual(proof.differenceCells, [2, 5]);
assert.equal(proof.differenceTotal, 0);
assert.equal(proof.differenceTotal, proof.superset.remaining - proof.subset.remaining);
assert.deepEqual(proof.playerKnownCells, []);
assert.equal(proof.dependsOnPlayerMarks, false);
'''
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=Path(__file__).resolve().parents[1],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_hint_proof_orders_residual_sets_before_showing_subtraction(self):
        script = r'''
import assert from "node:assert/strict";
import { DARK, UNKNOWN, findNextHint } from "./web/puzzle-logic.mjs";
import { buildHintProof } from "./web/hint-proof.mjs";

const level = { width: 3, height: 3, regionMap: Array(9).fill(0) };
const region = {
  id: 0,
  cells: Array.from({ length: 9 }, (_, index) => index),
  clues: { 0: 2, 1: 2 },
};
const values = Array(9).fill(UNKNOWN);
values[0] = DARK;
const clues = [2, 2, null, null, null, null, null, null, null];
const hint = findNextHint(level, region, values);
const proof = buildHintProof(level, clues, values, hint);
assert.equal(hint.cell, 2);
assert.equal(hint.value, DARK);
assert.equal(proof.valid, true);
assert.deepEqual(proof.superset.unknownCells, [1, 2, 3, 4, 5]);
assert.deepEqual(proof.subset.unknownCells, [1, 3, 4]);
assert.ok(proof.subset.unknownCells.every((index) => proof.superset.unknownCells.includes(index)));
assert.equal(proof.subset.cells.length, 4);
assert.equal(proof.subset.knownDark, 1);
assert.equal(proof.superset.cells.length, 6);
assert.equal(proof.superset.knownDark, 1);
assert.deepEqual(proof.differenceCells, [2, 5]);
assert.deepEqual(proof.forcedCells, [2, 5]);
assert.deepEqual(proof.playerKnownBrightCells, []);
assert.deepEqual(proof.playerKnownDarkCells, [0]);
assert.equal(proof.differenceTotal, proof.superset.remaining - proof.subset.remaining);
assert.equal(proof.differenceTotal, 0);
'''
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=Path(__file__).resolve().parents[1],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_hint_proof_rejects_an_invalid_subtraction_instead_of_displaying_it(self):
        script = r'''
import assert from "node:assert/strict";
import { UNKNOWN, findNextHint } from "./web/puzzle-logic.mjs";
import { buildHintProof } from "./web/hint-proof.mjs";

const level = { width: 3, height: 3, regionMap: Array(9).fill(0) };
const region = {
  id: 0,
  cells: Array.from({ length: 9 }, (_, index) => index),
  clues: { 0: 2, 1: 2 },
};
const values = Array(9).fill(UNKNOWN);
const clues = [2, 2, null, null, null, null, null, null, null];
const hint = findNextHint(level, region, values);
const brokenHint = {
  ...hint,
  derivation: { ...hint.derivation, differenceTotal: 1 },
};
const proof = buildHintProof(level, clues, values, brokenHint);
assert.equal(proof.valid, false);
assert.equal(proof.kind, "invalid");
assert.equal(proof.errorKey, "proof.error.differenceTotalMismatch");
'''
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=Path(__file__).resolve().parents[1],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)
