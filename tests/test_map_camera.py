import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which('node'), 'Node.js required')
class MapCameraTests(unittest.TestCase):
    def test_hit_testing_zoom_anchor_and_edit_scale(self):
        script = r'''
import assert from 'node:assert/strict';
import { cellAtPoint, zoomAtPoint, canEditAtScale, fitMap, clampCamera } from './web/map-camera.mjs';
const level = {width: 32, height: 24};
const camera = {x: 10, y: 20, scale: 1};
assert.equal(cellAtPoint(level, camera, {x: 33, y: 43}), 0);
assert.equal(cellAtPoint(level, camera, {x: 77, y: 87}), 33);
assert.equal(cellAtPoint(level, camera, {x: 9, y: 43}), null);
assert.equal(cellAtPoint(level, camera, {x: 2000, y: 43}), null);
const zoomed = zoomAtPoint(camera, {x: 98, y: 108}, 2);
assert.equal(zoomed.x, -78);
assert.equal(zoomed.y, -68);
assert.equal(cellAtPoint(level, zoomed, {x: 100, y: 110}), 66);
assert.equal(canEditAtScale(0.5), false);
assert.equal(canEditAtScale(1), true);
const fit = fitMap(level, {width: 320, height: 420});
assert.ok(fit.scale * 32 * 44 <= 320);
assert.ok(fit.scale * 24 * 44 <= 420);
// Whole-map navigation must expose country labels even on a large display.
assert.equal(canEditAtScale(fitMap(level, {width: 1440, height: 1000}).scale), false);
assert.equal(canEditAtScale(fitMap(level, {width: 320, height: 420}, [0,1,32,33]).scale), true);
const small={width:6,height:6},view={width:1188,height:552};
const centered=fitMap(small,view,[4,5,10,11]);
assert.deepEqual(clampCamera(small,centered,view),centered,'a focused edge country stays centered even when the whole map is narrower than the viewport');
'''
        result = subprocess.run([shutil.which('node'), '--input-type=module', '-e', script], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_camera_motion_easing_interruption_and_reduced_motion(self):
        script = r"""
import assert from 'node:assert/strict';
import {createCameraMotion} from './web/camera-motion.mjs';
let camera={x:0,y:0,scale:1},time=0,id=0,finished=0;
const pending=new Map();
const motion=createCameraMotion({read:()=>camera,write:c=>camera=c,finish:()=>finished++,now:()=>time,
 requestFrame:fn=>{pending.set(++id,fn);return id;},cancelFrame:i=>pending.delete(i)});
const step=t=>{time=t;const callbacks=[...pending.values()];pending.clear();callbacks.forEach(fn=>fn(t));};
const target={x:100,y:-200,scale:2};
motion.move(target);assert.equal(camera.x,0);
step(260);assert.equal(camera.x,87.5);assert.equal(camera.scale,1.875);assert.equal(finished,0);
step(520);assert.deepEqual(camera,target);assert.equal(finished,1);
motion.move({x:0,y:0,scale:1});step(650);const interrupted={...camera};motion.cancel();step(1040);
assert.deepEqual(camera,interrupted);assert.equal(finished,1);assert.equal(pending.size,0);
motion.move(target);step(1170);const nextStart={...camera};motion.move({x:-100,y:50,scale:.5});
assert.deepEqual(camera,nextStart,'a new destination starts from the live position');step(1690);
assert.deepEqual(camera,{x:-100,y:50,scale:.5});
motion.move(target,{reducedMotion:true});assert.deepEqual(camera,target);assert.equal(pending.size,0);
"""
        result = subprocess.run([shutil.which('node'), '--input-type=module', '-e', script], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
