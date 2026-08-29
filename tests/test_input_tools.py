import shutil
import subprocess
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which("node"), "Node.js is required for input-tool tests")
class InputToolTests(unittest.TestCase):
    def run_node(self, script: str) -> None:
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_selected_tool_controls_primary_input_without_breaking_legacy_dark_input(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import { BRIGHT, DARK, UNKNOWN } from "./web/puzzle-logic.mjs";
import {
  INPUT_TOOLS,
  markValueForTool,
  resolvePointerTool,
} from "./web/input-tools.mjs";

assert.equal(resolvePointerTool(INPUT_TOOLS.BRIGHT, { button: 0, shiftKey: false }), INPUT_TOOLS.BRIGHT);
assert.equal(resolvePointerTool(INPUT_TOOLS.DARK, { button: 0, shiftKey: false }), INPUT_TOOLS.DARK);
assert.equal(resolvePointerTool(INPUT_TOOLS.ERASE, { button: 0, shiftKey: false }), INPUT_TOOLS.ERASE);
assert.equal(resolvePointerTool(INPUT_TOOLS.BRIGHT, { button: 0, shiftKey: true }), INPUT_TOOLS.DARK);
assert.equal(resolvePointerTool(INPUT_TOOLS.BRIGHT, { button: 2, shiftKey: false }), INPUT_TOOLS.DARK);

assert.equal(markValueForTool(UNKNOWN, INPUT_TOOLS.BRIGHT), BRIGHT);
assert.equal(markValueForTool(BRIGHT, INPUT_TOOLS.BRIGHT), UNKNOWN);
assert.equal(markValueForTool(UNKNOWN, INPUT_TOOLS.DARK), DARK);
assert.equal(markValueForTool(DARK, INPUT_TOOLS.DARK), UNKNOWN);
assert.equal(markValueForTool(BRIGHT, INPUT_TOOLS.ERASE), UNKNOWN);
assert.equal(markValueForTool(UNKNOWN, INPUT_TOOLS.ERASE), UNKNOWN);
'''
        )
    def test_keyboard_moves_in_two_dimensions_and_can_choose_each_mark(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import {
  INPUT_TOOLS,
  gridTargetForKey,
  resolveKeyboardTool,
} from "./web/input-tools.mjs";

assert.equal(gridTargetForKey(5, "ArrowLeft", 4, 3), 4);
assert.equal(gridTargetForKey(5, "ArrowRight", 4, 3), 6);
assert.equal(gridTargetForKey(5, "ArrowUp", 4, 3), 1);
assert.equal(gridTargetForKey(5, "ArrowDown", 4, 3), 9);
assert.equal(gridTargetForKey(4, "ArrowLeft", 4, 3), 4);
assert.equal(gridTargetForKey(7, "ArrowRight", 4, 3), 7);
assert.equal(gridTargetForKey(1, "ArrowUp", 4, 3), 1);
assert.equal(gridTargetForKey(9, "ArrowDown", 4, 3), 9);
assert.equal(gridTargetForKey(6, "Home", 4, 3), 4);
assert.equal(gridTargetForKey(6, "End", 4, 3), 7);
assert.equal(gridTargetForKey(6, "Home", 4, 3, { ctrlKey: true }), 0);
assert.equal(gridTargetForKey(6, "End", 4, 3, { ctrlKey: true }), 11);
assert.equal(gridTargetForKey(6, "KeyQ", 4, 3), null);

assert.equal(resolveKeyboardTool(INPUT_TOOLS.DARK, "Enter"), INPUT_TOOLS.DARK);
assert.equal(resolveKeyboardTool(INPUT_TOOLS.ERASE, " "), INPUT_TOOLS.ERASE);
assert.equal(resolveKeyboardTool(INPUT_TOOLS.ERASE, "1"), INPUT_TOOLS.BRIGHT);
assert.equal(resolveKeyboardTool(INPUT_TOOLS.BRIGHT, "2"), INPUT_TOOLS.DARK);
assert.equal(resolveKeyboardTool(INPUT_TOOLS.BRIGHT, "3"), INPUT_TOOLS.ERASE);
assert.equal(resolveKeyboardTool(INPUT_TOOLS.BRIGHT, "Backspace"), INPUT_TOOLS.ERASE);
assert.equal(resolveKeyboardTool(INPUT_TOOLS.BRIGHT, "Delete"), INPUT_TOOLS.ERASE);
assert.equal(resolveKeyboardTool(INPUT_TOOLS.BRIGHT, "ArrowRight"), null);
'''
        )


class InputToolDomContractTests(unittest.TestCase):
    def test_board_exposes_three_localized_mark_tools(self):
        html = (PROJECT_ROOT / "web" / "index.html").read_text(encoding="utf-8")

        self.assertIn('id="markToolbar"', html)
        self.assertIn('role="group"', html)
        self.assertIn('data-i18n-aria-label="tools.label"', html)
        for tool, shortcut in (("bright", "1"), ("dark", "2"), ("erase", "3")):
            self.assertIn(f'data-tool="{tool}"', html)
            self.assertIn(f'aria-keyshortcuts="{shortcut}"', html)
            self.assertIn(f'data-i18n="tools.{tool}"', html)
