import shutil
import subprocess
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which("node"), "Node.js is required for paint-stroke tests")
class PaintStrokeTests(unittest.TestCase):
    def run_node(self, script: str) -> None:
        result = subprocess.run(
            [shutil.which("node"), "--input-type=module", "--eval", script],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)

    def test_a_stroke_uses_one_target_and_visits_each_editable_cell_once(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import { INPUT_TOOLS } from "./web/input-tools.mjs";
import { BRIGHT, DARK, UNKNOWN } from "./web/puzzle-logic.mjs";
import {
  createPaintStroke,
  extendPaintStroke,
} from "./web/paint-stroke.mjs";

const original = [UNKNOWN, UNKNOWN, BRIGHT, DARK];
let values = original;
let stroke = createPaintStroke(values[0], INPUT_TOOLS.BRIGHT);
assert.equal(stroke.targetValue, BRIGHT);

({ stroke, values } = extendPaintStroke(stroke, values, 0));
({ stroke, values } = extendPaintStroke(stroke, values, 1));
({ stroke, values } = extendPaintStroke(stroke, values, 0));
({ stroke, values } = extendPaintStroke(stroke, values, 2));
({ stroke, values } = extendPaintStroke(stroke, values, 3, { editable: false }));

assert.deepEqual(values, [BRIGHT, BRIGHT, BRIGHT, DARK]);
assert.deepEqual(original, [UNKNOWN, UNKNOWN, BRIGHT, DARK]);
assert.deepEqual(stroke.changedIndices, [0, 1]);
assert.deepEqual([...stroke.visitedIndices], [0, 1, 2, 3]);

values = [BRIGHT, DARK];
stroke = createPaintStroke(values[0], INPUT_TOOLS.BRIGHT);
assert.equal(stroke.targetValue, UNKNOWN);
({ stroke, values } = extendPaintStroke(stroke, values, 0));
({ stroke, values } = extendPaintStroke(stroke, values, 1));
assert.deepEqual(values, [UNKNOWN, UNKNOWN]);
assert.deepEqual(stroke.changedIndices, [0, 1]);
'''
        )

    def test_grid_line_fills_cells_between_sparse_pointer_samples(self):
        self.run_node(
            r'''
import assert from "node:assert/strict";
import { gridLineIndices } from "./web/paint-stroke.mjs";

assert.deepEqual(gridLineIndices(0, 3, 4), [0, 1, 2, 3]);
assert.deepEqual(gridLineIndices(0, 12, 4), [0, 4, 8, 12]);
assert.deepEqual(gridLineIndices(0, 15, 4), [0, 5, 10, 15]);
assert.deepEqual(gridLineIndices(15, 0, 4), [15, 10, 5, 0]);
assert.deepEqual(gridLineIndices(6, 6, 4), [6]);
'''
        )


class PaintStrokeDomContractTests(unittest.TestCase):
    def test_board_wires_pointer_strokes_without_replacing_touch_taps(self):
        app = (PROJECT_ROOT / "web" / "app.js").read_text(encoding="utf-8")

        self.assertIn('from "./paint-stroke.mjs"', app)
        for event_name in ("pointerdown", "pointermove", "pointerup", "pointercancel"):
            self.assertIn(f'addEventListener("{event_name}"', app)
        self.assertIn('pointerType === "touch"', app)
        self.assertIn('classList.add("is-painting")', app)
        self.assertIn('classList.remove("is-painting")', app)

    def test_pointerup_flushes_its_final_cell_before_committing(self):
        app = (PROJECT_ROOT / "web" / "app.js").read_text(encoding="utf-8")
        finish_start = app.index("function finishPaintStroke(event) {")
        finish_end = app.index("\nfunction finishBoardEdit", finish_start)
        finish_body = app[finish_start:finish_end]

        flush = 'if (event.type === "pointerup") continuePaintStroke(event);'
        self.assertIn(flush, finish_body)
        self.assertLess(finish_body.index(flush), finish_body.index("const completedStroke"))
