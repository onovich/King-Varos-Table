import json
import shutil
import subprocess
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = PROJECT_ROOT / "web" / "data" / "campaign.json"


@unittest.skipUnless(shutil.which("node"), "Node.js is required for level-book tests")
class LevelBookStateTests(unittest.TestCase):
    def run_node(self, script: str) -> None:
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_levels_unlock_in_manifest_order_and_progress_round_trips(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  completeLevel,
  createLevelBookProgress,
  createLevelBookSave,
  firstPlayableLevelId,
  isLevelUnlocked,
  levelEntries,
  restoreLevelBookProgress,
  selectLevel,
  validateManifest,
} from "./web/level-book.mjs";

const manifest = validateManifest(JSON.parse(fs.readFileSync("./web/data/campaign.json", "utf8")));
const ids = levelEntries(manifest).map((entry) => entry.id);
assert.deepEqual(ids, ["first-light", "within-the-border", "three-small-realms", "inner-sea"]);

let progress = createLevelBookProgress(manifest);
assert.equal(firstPlayableLevelId(manifest, progress), "first-light");
assert.equal(isLevelUnlocked(manifest, progress, "first-light"), true);
assert.equal(isLevelUnlocked(manifest, progress, "within-the-border"), false);
assert.deepEqual(selectLevel(manifest, progress, "inner-sea"), progress);

let completion = completeLevel(manifest, progress, "first-light");
assert.equal(completion.newlyCompleted, true);
assert.equal(completion.nextLevelId, "within-the-border");
progress = completion.progress;
assert.equal(isLevelUnlocked(manifest, progress, "within-the-border"), true);
assert.equal(isLevelUnlocked(manifest, progress, "three-small-realms"), false);
assert.equal(firstPlayableLevelId(manifest, progress), "within-the-border");

completion = completeLevel(manifest, progress, "three-small-realms");
assert.equal(completion.newlyCompleted, false);
assert.equal(completion.nextLevelId, null);

progress = selectLevel(manifest, progress, "within-the-border");
const serialized = JSON.stringify(createLevelBookSave(manifest, progress));
assert.deepEqual(restoreLevelBookProgress(manifest, serialized), progress);
assert.equal(restoreLevelBookProgress(manifest, "{bad-json"), null);
assert.equal(
  restoreLevelBookProgress(manifest, JSON.stringify({ ...JSON.parse(serialized), bookId: "other" })),
  null,
);
const tampered = restoreLevelBookProgress(manifest, JSON.stringify({
  ...JSON.parse(serialized),
  completedLevelIds: ["three-small-realms"],
  lastLevelId: "three-small-realms",
}));
assert.deepEqual(tampered.completedLevelIds, []);
assert.equal(firstPlayableLevelId(manifest, tampered), "first-light");
'''
        )

    def test_every_committed_level_is_directly_solvable_in_the_browser_engine(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import fs from "node:fs";
import { levelEntries } from "./web/level-book.mjs";
import { deriveDirectSolution } from "./web/puzzle-logic.mjs";

const manifest = JSON.parse(fs.readFileSync("./web/data/campaign.json", "utf8"));
for (const entry of levelEntries(manifest)) {
  const relativePath = `./web/${entry.source.replace(/^\.\//, "")}`;
  const level = JSON.parse(fs.readFileSync(relativePath, "utf8"));
  const solution = deriveDirectSolution(level);
  assert.ok(solution, `${entry.id} stalled in the browser direct solver`);
  assert.equal(solution.length, entry.width * entry.height);
}
'''
        )

    def test_manifest_requires_a_generated_difficulty_label(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import fs from "node:fs";
import { levelEntries, validateManifest } from "./web/level-book.mjs";

const manifest = JSON.parse(fs.readFileSync("./web/data/campaign.json", "utf8"));
assert.deepEqual(
  levelEntries(validateManifest(manifest)).map((entry) => entry.difficulty),
  ["tutorial", "tutorial", "tutorial", "standard"],
);

const invalid = structuredClone(manifest);
invalid.chapters[1].levels[0].difficulty = "legendary";
assert.throws(() => validateManifest(invalid), /difficulty/);

const missing = structuredClone(manifest);
delete missing.chapters[0].levels[0].difficulty;
assert.throws(() => validateManifest(missing), /difficulty/);
'''
        )


class LevelBookDataContractTests(unittest.TestCase):
    def test_manifest_sources_are_local_bilingual_public_levels(self):
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        self.assertEqual(manifest["schemaVersion"], 1)
        self.assertEqual(set(manifest["title"]), {"zh-CN", "en"})

        entries = [
            entry
            for chapter in manifest["chapters"]
            for entry in chapter["levels"]
        ]
        self.assertEqual(len(entries), 4)
        for chapter in manifest["chapters"]:
            self.assertEqual(set(chapter["title"]), {"zh-CN", "en"})
            self.assertEqual(set(chapter["description"]), {"zh-CN", "en"})
        for entry in entries:
            self.assertNotIn("..", entry["source"])
            source = PROJECT_ROOT / "web" / entry["source"].removeprefix("./")
            payload = json.loads(source.read_text(encoding="utf-8"))
            self.assertEqual(payload["levelId"], entry["id"])
            self.assertEqual(payload["width"], entry["width"])
            self.assertEqual(payload["height"], entry["height"])
            self.assertEqual(len(payload["regions"]), entry["regionCount"])
            self.assertEqual(payload["difficulty"]["label"], entry["difficulty"])
            self.assertIn(payload["difficulty"]["reasoningLevel"], {"basic", "advanced"})
            self.assertIn(payload["difficulty"]["effort"], {"short", "medium", "long"})
            self.assertGreater(payload["difficulty"]["deductionSteps"], 0)
            self.assertNotIn("solution", payload)
            self.assertTrue(all(region["metrics"]["uniqueVerified"] for region in payload["regions"]))

    def test_level_book_and_completion_dialogs_are_fixed_in_the_page(self):
        html = (PROJECT_ROOT / "web" / "index.html").read_text(encoding="utf-8")
        app = (PROJECT_ROOT / "web" / "app.js").read_text(encoding="utf-8")
        self.assertIn('id="levelBookButton"', html)
        self.assertIn('id="levelBookDialog"', html)
        self.assertIn('id="completionDialog"', html)
        self.assertIn('id="lessonPanel"', html)
        self.assertIn('fetch("./data/campaign.json"', app)
        self.assertIn("recordLevelCompletion(initialAnalysis)", app)
