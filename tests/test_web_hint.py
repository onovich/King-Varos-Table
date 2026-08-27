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
assert.equal(proof.target.index, 147);
assert.equal(proof.target.value, DARK);
assert.deepEqual(proof.larger.cells, [147, 148, 149, 167, 168, 169, 187, 188, 189]);
assert.deepEqual(proof.smaller.cells, [167, 168, 169, 187, 188, 189]);
assert.deepEqual(proof.sharedCells, [167, 168, 169, 187, 188, 189]);
assert.deepEqual(proof.differenceCells, [147, 148, 149]);
assert.equal(proof.differenceTotal, 0);
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
