import shutil
import subprocess
import unittest
from pathlib import Path


@unittest.skipUnless(shutil.which("node"), "Node.js is required for browser hint tests")
class BrowserHintEngineTests(unittest.TestCase):
    def test_hint_replays_current_board_and_exposes_its_proof(self):
        script = r'''
import assert from "node:assert/strict";
import fs from "node:fs";
import { DARK, UNKNOWN, findNextHint } from "./web/puzzle-logic.mjs";

const level = JSON.parse(fs.readFileSync("./web/data/demo-level.json", "utf8"));
const values = Array(level.width * level.height).fill(UNKNOWN);
const screenshotMarks = [
  152, 153, 154,
  160, 161, 172, 173, 174,
  180, 181, 192, 193, 194,
  201, 202, 203, 210, 211,
  221, 222, 223, 230, 231,
];
for (const index of screenshotMarks) values[index] = DARK;

const region = level.regions.find((candidate) => candidate.id === 0);
const hint = findNextHint(level, region, values);
assert.equal(hint.status, "ok");
assert.equal(hint.cell, 147);
assert.equal(hint.value, DARK);
assert.deepEqual(hint.forcedCells, [147, 148, 149]);
assert.deepEqual(hint.sourceClueIndices, [168, 188]);
assert.deepEqual(hint.prerequisiteCells, []);
assert.equal(hint.derivation.left.clueIndex, 188);
assert.equal(hint.derivation.left.remaining, 4);
assert.equal(hint.derivation.right.clueIndex, 168);
assert.equal(hint.derivation.right.remaining, 4);
assert.equal(hint.derivation.subset.clueIndex, 188);
assert.equal(hint.derivation.superset.clueIndex, 168);

values[147] = DARK;
const nextHint = findNextHint(level, region, values);
assert.equal(nextHint.status, "ok");
assert.equal(nextHint.cell, 148);
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
import fs from "node:fs";
import { DARK, UNKNOWN, findNextHint } from "./web/puzzle-logic.mjs";
import { buildHintProof } from "./web/hint-proof.mjs";

const level = JSON.parse(fs.readFileSync("./web/data/demo-level.json", "utf8"));
const values = Array(level.width * level.height).fill(UNKNOWN);
for (const index of [160, 161, 180, 181]) values[index] = DARK;
const clues = Array(level.width * level.height).fill(null);
for (const region of level.regions) {
  for (const [rawIndex, clue] of Object.entries(region.clues)) clues[Number(rawIndex)] = clue;
}

const region = level.regions.find((candidate) => candidate.id === 0);
const hint = findNextHint(level, region, values);
const proof = buildHintProof(level, clues, values, hint);
assert.equal(proof.kind, "subset-difference");
assert.equal(proof.valid, true);
assert.equal(proof.target.index, 147);
assert.equal(proof.target.value, DARK);
assert.deepEqual(proof.superset.cells, [147, 148, 149, 167, 168, 169, 187, 188, 189]);
assert.deepEqual(proof.subset.cells, [167, 168, 169, 187, 188, 189]);
assert.deepEqual(proof.sharedCells, [167, 168, 169, 187, 188, 189]);
assert.deepEqual(proof.differenceCells, [147, 148, 149]);
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
import fs from "node:fs";
import { DARK, UNKNOWN, findNextHint } from "./web/puzzle-logic.mjs";
import { buildHintProof } from "./web/hint-proof.mjs";

const level = JSON.parse(fs.readFileSync("./web/data/demo-level.json", "utf8"));
const values = Array(level.width * level.height).fill(UNKNOWN);
const screenshotMarks = [
  160, 161, 180, 181,
  201, 202, 203, 210, 211,
  221, 222, 223, 230, 231,
];
for (const index of screenshotMarks) values[index] = DARK;
const clues = Array(level.width * level.height).fill(null);
for (const region of level.regions) {
  for (const [rawIndex, clue] of Object.entries(region.clues)) clues[Number(rawIndex)] = clue;
}

const region = level.regions.find((candidate) => candidate.name === "谷仓南坡");
const hint = findNextHint(level, region, values);
const proof = buildHintProof(level, clues, values, hint);
assert.equal(hint.cell, 206);
assert.equal(hint.value, 1);
assert.equal(proof.valid, true);
assert.deepEqual(proof.superset.unknownCells, [204, 205, 206, 224, 225, 226]);
assert.deepEqual(proof.subset.unknownCells, [204, 205, 224, 225]);
assert.ok(proof.subset.unknownCells.every((index) => proof.superset.unknownCells.includes(index)));
assert.equal(proof.subset.cells.length, 6);
assert.equal(proof.subset.knownDark, 2);
assert.equal(proof.superset.cells.length, 6);
assert.equal(proof.superset.knownDark, 0);
assert.deepEqual(proof.differenceCells, [206, 226]);
assert.deepEqual(proof.forcedCells, [206, 226]);
assert.deepEqual(proof.playerKnownBrightCells, []);
assert.deepEqual(proof.playerKnownDarkCells, [203, 223]);
assert.equal(proof.differenceTotal, proof.superset.remaining - proof.subset.remaining);
assert.equal(proof.differenceTotal, 2);
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
import fs from "node:fs";
import { DARK, UNKNOWN, findNextHint } from "./web/puzzle-logic.mjs";
import { buildHintProof } from "./web/hint-proof.mjs";

const level = JSON.parse(fs.readFileSync("./web/data/demo-level.json", "utf8"));
const values = Array(level.width * level.height).fill(UNKNOWN);
for (const index of [201, 202, 203, 221, 222, 223]) values[index] = DARK;
const clues = Array(level.width * level.height).fill(null);
for (const region of level.regions) {
  for (const [rawIndex, clue] of Object.entries(region.clues)) clues[Number(rawIndex)] = clue;
}

const region = level.regions.find((candidate) => candidate.name === "谷仓南坡");
const hint = findNextHint(level, region, values);
const brokenHint = {
  ...hint,
  derivation: { ...hint.derivation, differenceTotal: 1 },
};
const proof = buildHintProof(level, clues, values, brokenHint);
assert.equal(proof.valid, false);
assert.equal(proof.kind, "invalid");
assert.match(proof.error, /大集合剩余数减去小集合剩余数/);
'''
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=Path(__file__).resolve().parents[1],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)
