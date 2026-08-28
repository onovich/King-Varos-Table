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

    def test_epilogue_waits_for_every_country_story_and_archives_once(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import {
  archiveEpilogue,
  archiveStory,
  createCampaignProgress,
  isEpilogueReady,
} from "./web/campaign-state.mjs";

const level = {
  campaign: { epilogue: { title: "the map remains" } },
  regions: [{ id: 0 }, { id: 1 }],
};
let progress = {
  ...createCampaignProgress(),
  completedRegionIds: [0, 1],
  pendingStoryRegionIds: [0, 1],
};

assert.equal(isEpilogueReady(level, progress), false);
progress = archiveStory(progress, 0);
assert.equal(isEpilogueReady(level, progress), false);
progress = archiveStory(progress, 1);
assert.equal(isEpilogueReady(level, progress), true);

const archived = archiveEpilogue(level, progress);
assert.equal(archived.epilogueRevealed, true);
assert.equal(isEpilogueReady(level, archived), false);
assert.deepEqual(archiveEpilogue(level, archived), archived);
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

    def test_epilogue_save_requires_a_fully_archived_chapter(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import {
  createCampaignProgress,
  createSavePayload,
  restoreSavePayload,
} from "./web/campaign-state.mjs";

const level = {
  schemaVersion: 1,
  width: 2,
  height: 1,
  seed: 42,
  campaign: {
    chapterId: "inner-sea",
    epilogue: { title: "the map remains" },
  },
  regionMap: [0, 1],
  regions: [{ id: 0, clues: { 0: 1 } }, { id: 1, clues: { 1: 0 } }],
};
const finished = {
  ...createCampaignProgress(),
  completedRegionIds: [0, 1],
  revealedRegionIds: [0, 1],
  epilogueRevealed: true,
};
const payload = createSavePayload(level, [1, 0], finished);
assert.equal(
  restoreSavePayload(level, JSON.stringify(payload)).campaign.epilogueRevealed,
  true,
);

const incomplete = {
  ...payload,
  campaign: {
    ...payload.campaign,
    completedRegionIds: [0],
    revealedRegionIds: [0],
  },
};
assert.equal(restoreSavePayload(level, JSON.stringify(incomplete)), null);
const missingStoryState = {
  ...payload,
  campaign: {
    ...payload.campaign,
    revealedRegionIds: [0],
    pendingStoryRegionIds: [],
    epilogueRevealed: false,
  },
};
assert.equal(restoreSavePayload(level, JSON.stringify(missingStoryState)), null);
const wrongType = {
  ...payload,
  campaign: { ...payload.campaign, epilogueRevealed: "yes" },
};
assert.equal(restoreSavePayload(level, JSON.stringify(wrongType)), null);
'''
        )

    def test_epilogue_content_populates_the_visible_story_fields(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import { populateEpilogueDialog } from "./web/campaign-ui.mjs";

const level = {
  campaign: {
    epilogue: {
      eyebrow: "later archive",
      title: "the map remains",
      body: "the empire fell",
      survivingTrace: "seven rolls survived",
    },
  },
};
const elements = {
  eyebrow: { textContent: "" },
  title: { textContent: "" },
  body: { textContent: "" },
  trace: { textContent: "" },
};

assert.equal(populateEpilogueDialog(level, elements), true);
assert.equal(elements.eyebrow.textContent, "later archive");
assert.equal(elements.title.textContent, "the map remains");
assert.equal(elements.body.textContent, "the empire fell");
assert.equal(elements.trace.textContent, "seven rolls survived");
assert.equal(populateEpilogueDialog({ campaign: {} }, elements), false);
'''
        )

    def test_epilogue_joins_the_archive_only_after_it_has_been_revealed(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import { archiveEntries } from "./web/campaign-ui.mjs";

const level = {
  campaign: {
    epilogue: {
      archiveLabel: "later record",
      archiveSummary: "the map remains",
    },
  },
  regions: [
    {
      id: 0,
      name: "first country",
      country: { capitalOrFocusCity: "first city", fallCardTitle: "first fall" },
    },
  ],
};
const countryOnly = archiveEntries(level, {
  revealedRegionIds: [0],
  epilogueRevealed: false,
});
assert.deepEqual(countryOnly.map((entry) => entry.kind), ["country"]);

const completeArchive = archiveEntries(level, {
  revealedRegionIds: [0],
  epilogueRevealed: true,
});
assert.deepEqual(completeArchive.map((entry) => entry.kind), ["country", "epilogue"]);
assert.equal(completeArchive[1].title, "later record");
assert.equal(completeArchive[1].subtitle, "the map remains");
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
        self.assertIn('<dialog class="epilogue-dialog" id="epilogueDialog"', html)
        self.assertIn('aria-labelledby="epilogueTitle"', html)
        self.assertIn('id="epilogueDialogClose"', html)
        self.assertIn('id="epilogueDialogConfirm"', html)
        self.assertNotIn("innerHTML", html)
        self.assertIn("关闭后收入亡国档案", html)
        self.assertIn("关闭后收入地图档案", html)
        self.assertIn("历史记录正在展示", app)
