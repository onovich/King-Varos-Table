import shutil
import subprocess
import unittest
from pathlib import Path


@unittest.skipUnless(shutil.which("node"), "Node.js is required for campaign-state tests")
class CampaignStateTests(unittest.TestCase):
    def run_node(self, script: str) -> None:
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=Path(__file__).resolve().parents[1],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_country_completion_queues_its_story_only_once(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import {
  archiveStory,
  createCampaignProgress,
  isCampaignCompatibleWithBoard,
  nextPendingStory,
  reconcileCampaignProgress,
} from "./web/campaign-state.mjs";

let progress = createCampaignProgress();
let result = reconcileCampaignProgress(progress, [6]);
assert.deepEqual(result.newlyCompletedRegionIds, [6]);
assert.deepEqual(result.progress.completedRegionIds, [6]);
assert.deepEqual(result.progress.pendingStoryRegionIds, [6]);

assert.equal(nextPendingStory(result.progress), 6);
assert.deepEqual(result.progress.pendingStoryRegionIds, [6]);

const archived = archiveStory(result.progress, 6);
assert.deepEqual(archived.revealedRegionIds, [6]);
assert.deepEqual(archived.pendingStoryRegionIds, []);

result = reconcileCampaignProgress(archived, [6]);
assert.deepEqual(result.newlyCompletedRegionIds, []);
assert.deepEqual(result.progress.pendingStoryRegionIds, []);

result = reconcileCampaignProgress(result.progress, [1, 6]);
assert.deepEqual(result.newlyCompletedRegionIds, [1]);
assert.deepEqual(result.progress.completedRegionIds, [6, 1]);
assert.deepEqual(result.progress.pendingStoryRegionIds, [1]);

result = reconcileCampaignProgress(result.progress, [1]);
assert.deepEqual(result.progress.completedRegionIds, [6, 1]);
assert.deepEqual(result.progress.revealedRegionIds, [6]);
assert.deepEqual(result.progress.pendingStoryRegionIds, [1]);
assert.equal(isCampaignCompatibleWithBoard(result.progress, [1]), false);
assert.equal(isCampaignCompatibleWithBoard(result.progress, [6, 1]), true);
'''
        )

    def test_banquet_timeline_depends_only_on_completed_country_count(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import { currentBanquetBeat } from "./web/campaign-state.mjs";

const level = {
  campaign: {
    banquetTimeline: [
      { completedCountries: 0, title: "arrival" },
      { completedCountries: 1, title: "first course" },
      { completedCountries: 3, title: "appetite rising" },
      { completedCountries: 7, title: "dawn" },
    ],
  },
};

assert.equal(currentBanquetBeat(level, 0).title, "arrival");
assert.equal(currentBanquetBeat(level, 2).title, "first course");
assert.equal(currentBanquetBeat(level, 3).title, "appetite rising");
assert.equal(currentBanquetBeat(level, 7).title, "dawn");
'''
        )

    def test_versioned_save_round_trip_rejects_mismatched_or_corrupt_data(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import {
  createCampaignProgress,
  createSavePayload,
  restoreSavePayload,
  saveKeyForLevel,
} from "./web/campaign-state.mjs";

const level = {
  schemaVersion: 1,
  width: 3,
  height: 1,
  seed: 42,
  campaign: { chapterId: "inner-sea" },
  regionMap: [0, 0, 1],
  regions: [{ id: 0, clues: { 0: 1 } }, { id: 1, clues: { 2: 0 } }],
};
const progress = {
  ...createCampaignProgress(),
  completedRegionIds: [1],
  revealedRegionIds: [1],
};
const payload = createSavePayload(level, [1, 0, -1], progress);
const restored = restoreSavePayload(level, JSON.stringify(payload));

assert.deepEqual(restored.values, [1, 0, -1]);
assert.deepEqual(restored.campaign.completedRegionIds, [1]);
assert.deepEqual(restored.campaign.revealedRegionIds, [1]);
assert.match(saveKeyForLevel(level), /inner-sea:42:/);

assert.equal(
  restoreSavePayload({ ...level, seed: 43 }, JSON.stringify(payload)),
  null,
);
const changedClues = {
  ...level,
  regions: [{ id: 0, clues: { 0: 2 } }, level.regions[1]],
};
assert.equal(restoreSavePayload(changedClues, JSON.stringify(payload)), null);
const changedCountry = {
  ...level,
  regions: [
    { ...level.regions[0], country: { fallCardBody: "revised" } },
    level.regions[1],
  ],
};
assert.equal(restoreSavePayload(changedCountry, JSON.stringify(payload)), null);
const changedBanquet = {
  ...level,
  campaign: {
    ...level.campaign,
    banquetTimeline: [{ completedCountries: 0, title: "revised" }],
  },
};
assert.equal(restoreSavePayload(changedBanquet, JSON.stringify(payload)), null);
assert.equal(
  restoreSavePayload(level, JSON.stringify({ ...payload, schemaVersion: 999 })),
  null,
);
assert.equal(
  restoreSavePayload(level, JSON.stringify({ ...payload, values: [1, 7, -1] })),
  null,
);
assert.equal(restoreSavePayload(level, "{not-json"), null);
'''
        )


class CampaignDomContractTests(unittest.TestCase):
    def test_story_dialog_archive_and_banquet_panel_are_fixed_in_the_page(self):
        project_root = Path(__file__).resolve().parents[1]
        html = (project_root / "web" / "index.html").read_text(encoding="utf-8")
        app = (project_root / "web" / "app.js").read_text(encoding="utf-8")

        self.assertIn('id="banquetPanel"', html)
        self.assertIn('id="archiveButton"', html)
        self.assertIn('id="archiveButton" type="button" aria-haspopup="dialog" disabled', html)
        self.assertIn('id="archiveButtonLabel">地图档案尚未整理', html)
        self.assertIn('<dialog class="story-dialog" id="fallDialog"', html)
        self.assertIn('<dialog class="archive-dialog" id="archiveDialog"', html)
        self.assertNotIn("innerHTML", html)
        self.assertIn("关闭后收入亡国档案", html)
        self.assertIn("历史记录正在展示", app)
