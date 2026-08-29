import shutil
import subprocess
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which("node"), "Node.js is required for board-history tests")
class BoardHistoryTests(unittest.TestCase):
    def run_node(self, script: str) -> None:
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_undo_and_redo_restore_cells_and_narrative_state_together(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import {
  canRedoBoardHistory,
  canUndoBoardHistory,
  cloneBoardSnapshot,
  commitBoardHistory,
  createBoardHistory,
  redoBoardHistory,
  undoBoardHistory,
} from "./web/board-history.mjs";

const emptyCampaign = {
  completedRegionIds: [],
  revealedRegionIds: [],
  pendingStoryRegionIds: [],
  epilogueRevealed: false,
};
const initial = { values: [-1, -1], campaign: emptyCampaign };
let history = createBoardHistory(initial, { limit: 3 });
assert.equal(canUndoBoardHistory(history), false);
assert.equal(canRedoBoardHistory(history), false);

const marked = { values: [1, -1], campaign: emptyCampaign };
history = commitBoardHistory(history, marked);
marked.values[0] = 0;
assert.deepEqual(history.present.values, [1, -1], "history must own its snapshots");

const sourceSnapshot = {
  values: [1, 0],
  campaign: {
    completedRegionIds: [0],
    revealedRegionIds: [0],
    pendingStoryRegionIds: [],
    epilogueRevealed: true,
  },
};
const detached = cloneBoardSnapshot(sourceSnapshot);
sourceSnapshot.values[0] = 0;
sourceSnapshot.campaign.completedRegionIds.push(9);
assert.deepEqual(detached.values, [1, 0]);
assert.deepEqual(detached.campaign.completedRegionIds, [0]);
detached.campaign.completedRegionIds.push(9);
assert.deepEqual(sourceSnapshot.campaign.completedRegionIds, [0, 9]);

history = commitBoardHistory(history, {
  values: [1, 0],
  campaign: {
    completedRegionIds: [0],
    revealedRegionIds: [],
    pendingStoryRegionIds: [0],
    epilogueRevealed: true,
  },
});
assert.equal(canUndoBoardHistory(history), true);

history = undoBoardHistory(history);
assert.deepEqual(history.present.values, [1, -1]);
assert.deepEqual(history.present.campaign.completedRegionIds, []);
assert.deepEqual(history.present.campaign.pendingStoryRegionIds, []);
assert.equal(canRedoBoardHistory(history), true);

history = redoBoardHistory(history);
assert.deepEqual(history.present.values, [1, 0]);
assert.deepEqual(history.present.campaign.completedRegionIds, [0]);
assert.deepEqual(history.present.campaign.pendingStoryRegionIds, [0]);
assert.equal(history.present.campaign.epilogueRevealed, true);
'''
        )
    def test_new_moves_clear_redo_and_metadata_replaces_the_current_snapshot(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import {
  canRedoBoardHistory,
  canUndoBoardHistory,
  commitBoardHistory,
  createBoardHistory,
  redoBoardHistory,
  replaceBoardHistoryPresent,
  undoBoardHistory,
} from "./web/board-history.mjs";

const campaign = {
  completedRegionIds: [],
  revealedRegionIds: [],
  pendingStoryRegionIds: [],
  epilogueRevealed: false,
};
let history = createBoardHistory({ values: [-1, -1], campaign }, { limit: 2 });
history = commitBoardHistory(history, { values: [1, -1], campaign });
history = commitBoardHistory(history, { values: [1, 0], campaign });
history = commitBoardHistory(history, {
  values: [0, 0],
  campaign: { ...campaign, completedRegionIds: [0], pendingStoryRegionIds: [0] },
});
assert.equal(history.past.length, 2);

history = replaceBoardHistoryPresent(history, {
  values: [0, 0],
  campaign: { ...campaign, completedRegionIds: [0], revealedRegionIds: [0] },
});
assert.equal(history.past.length, 2, "archiving a story is not another undo step");
assert.deepEqual(history.present.campaign.revealedRegionIds, [0]);
assert.deepEqual(history.present.campaign.pendingStoryRegionIds, []);

history = undoBoardHistory(history);
assert.deepEqual(history.present.values, [1, 0]);
history = redoBoardHistory(history);
assert.deepEqual(history.present.campaign.revealedRegionIds, [0]);

history = undoBoardHistory(history);
history = commitBoardHistory(history, { values: [-1, 0], campaign });
assert.equal(canRedoBoardHistory(history), false, "a new move must discard the old redo branch");
history = undoBoardHistory(history);
history = undoBoardHistory(history);
assert.equal(canUndoBoardHistory(history), false, "the configured history cap must be respected");

let defaultHistory = createBoardHistory({ values: [0], campaign });
for (let value = 1; value <= 101; value += 1) {
  defaultHistory = commitBoardHistory(defaultHistory, { values: [value], campaign });
}
assert.equal(defaultHistory.past.length, 100, "the default history cap must be 100");
for (let step = 0; step < 100; step += 1) {
  defaultHistory = undoBoardHistory(defaultHistory);
}
assert.deepEqual(defaultHistory.present.values, [1]);
assert.equal(canUndoBoardHistory(defaultHistory), false);
'''
        )


class BoardHistoryDomContractTests(unittest.TestCase):
    def test_page_exposes_localized_undo_and_redo_controls(self):
        html = (PROJECT_ROOT / "web" / "index.html").read_text(encoding="utf-8")

        self.assertIn('id="undoButton"', html)
        self.assertIn('id="redoButton"', html)
        self.assertIn('data-i18n="actions.undo"', html)
        self.assertIn('data-i18n="actions.redo"', html)
        self.assertIn('data-i18n-aria-label="history.label"', html)
        self.assertIn('aria-keyshortcuts="Control+Z Meta+Z"', html)
        self.assertIn(
            'aria-keyshortcuts="Control+Y Control+Shift+Z Meta+Shift+Z"',
            html,
        )
        self.assertIn("Ctrl/⌘ Z", html)
        self.assertIn("Ctrl Y · ⇧⌘ Z", html)
