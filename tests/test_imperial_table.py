import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

@unittest.skipUnless(shutil.which('node'), 'Node.js is required')
class ImperialTableTests(unittest.TestCase):
    def run_js(self, body):
        script = '''import assert from 'node:assert/strict';
import {regions,center,regionAt,worldPoint,MAP} from './web/prototypes/imperial-table/map-data.mjs';
import {createMotion,isClick} from './web/prototypes/imperial-table/motion.mjs';
import {cameraDestination} from './web/prototypes/imperial-table/camera.mjs';
''' + body
        result = subprocess.run(['node', '--input-type=module', '--eval', script], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_shared_polygons_and_world_round_trip(self):
        self.run_js('''assert.equal(regions.length,7);
for(const r of regions){const [u,v]=center(r);assert.equal(regionAt(u,v).id,r.id);
const [x,y,z]=worldPoint(u,v);assert.equal(y,MAP.y);assert.equal(regionAt(x/MAP.width+.5,z/MAP.height+.5).id,r.id);}
for(const p of [[0,0],[1,1],[-1,.5],[.99,.5]])assert.equal(regionAt(...p),null);''')

    def test_click_threshold_and_multitouch(self):
        self.run_js('''assert.ok(isClick(0,false));assert.ok(isClick(6,false));
assert.ok(!isClick(6.01,false));assert.ok(!isClick(0,true));assert.ok(!isClick(70,false));''')

    def test_motion_endpoints_interruption_and_retarget(self):
        self.run_js('''const m=createMotion(),a=cameraDestination('banquet',null,1.6),b=cameraDestination('overview',null,1.6);
m.start(a,b,100,1400);assert.deepEqual(m.sample(100),a);const middle=m.sample(700);assert.notDeepEqual(middle,a);assert.notDeepEqual(middle,b);
m.cancel();assert.equal(m.sample(1500),null);assert.equal(m.active,false);
const c=cameraDestination('region','aspa',1.6);m.start(middle,c,710,700);assert.deepEqual(m.sample(710),middle);
const end=m.sample(1410);end.position.forEach((v,i)=>assert.ok(Math.abs(v-c.position[i])<1e-10));assert.equal(m.active,false);''')

    def test_camera_targets_and_table_clearance_at_all_sizes(self):
        self.run_js('''for(const [w,h] of [[1440,900],[1280,720],[390,844],[320,740]])for(const r of regions){
const p=cameraDestination('region',r.id,w/h);assert.deepEqual(p.target,worldPoint(...center(r)));
assert.ok(p.position[1]>MAP.y+7);assert.ok(p.position[2]>p.target[2]);
const m=createMotion();m.start(cameraDestination('banquet',null,w/h),p,0,1400);
for(let t=0;t<=1400;t+=20)assert.ok(m.sample(t).position[1]>MAP.y+7); }''')

    def test_prototype_has_no_business_or_storage_dependencies(self):
        for file in (ROOT / 'web/prototypes/imperial-table').glob('*.mjs'):
            text = file.read_text(encoding='utf-8')
            for forbidden in ('localStorage', 'sessionStorage', 'indexedDB', '../..', 'world-atlas', 'campaign-state'):
                self.assertNotIn(forbidden, text, str(file))

    def test_actual_board_snapshot_and_all_cell_pick_roundtrips(self):
        self.run_js('''import {readFileSync} from 'node:fs';
import {boardData} from './web/prototypes/imperial-table/board-data.mjs';
import {cellUV,cellAt} from './web/prototypes/imperial-table/board.mjs';
const original=JSON.parse(readFileSync('./web/data/levels/inner-sea-journey-v1.json','utf8'));
assert.equal(boardData.width,32);assert.equal(boardData.height,24);assert.deepEqual(boardData.regionMap,original.regionMap);
for(let i=0;i<7;i++)assert.deepEqual(boardData.regions[i].clues,original.regions[i].clues);
assert.equal(Object.keys(Object.assign({},...boardData.regions.map(r=>r.clues))).length,236);
for(let i=0;i<768;i++)assert.equal(cellAt(...cellUV(i)),i);
assert.equal(cellAt(.5,.1),null);assert.equal(cellAt(1,.5),null);''')

    def test_grid_reveal_and_isolated_mark_history(self):
        self.run_js('''import {boardOpacity,createMarks} from './web/prototypes/imperial-table/board.mjs';
assert.equal(boardOpacity(12),0);assert.equal(boardOpacity(36),1);assert.ok(boardOpacity(23)>.4&&boardOpacity(23)<.6);
const marks=createMarks();assert.ok(marks.paint(80,1));assert.ok(!marks.paint(80,1));assert.ok(marks.paint(80,0));assert.ok(marks.undo());assert.equal(marks.values[80],1);
assert.ok(marks.paint(80,-1));assert.equal(marks.values[80],-1);assert.ok(marks.undo());assert.equal(marks.values[80],1);
assert.ok(!marks.paint(null,1));assert.ok(!marks.paint(768,1));assert.ok(!marks.paint(80,9));
assert.equal(createMarks().values[80],-1);''')

    def test_local_model_dependencies_and_calm_fire(self):
        self.run_js('''import {GLTFLoader} from './web/prototypes/imperial-table/vendor/GLTFLoader.js';
import {flamePower} from './web/prototypes/imperial-table/fire.mjs';
assert.equal(typeof GLTFLoader,'function');
for(let seed=0;seed<5;seed++)for(let t=0;t<30;t+=.031){const p=flamePower(t,seed,false);assert.ok(p>=.88&&p<=1.12);assert.equal(flamePower(t,seed,true),1);}''')

    def test_scanned_models_are_self_contained(self):
        import json
        base = ROOT / 'web/prototypes/imperial-table/assets'
        for name in ('food_apple_01', 'food_pomegranate_01', 'croissant'):
            folder = base / name
            model = json.loads((folder / 'model.gltf').read_text(encoding='utf-8'))
            for resource in model.get('buffers', []) + model.get('images', []):
                uri = resource.get('uri')
                if uri:
                    self.assertNotIn('://', uri)
                    self.assertTrue((folder / uri).is_file(), uri)
                    self.assertGreater((folder / uri).stat().st_size, 100)
