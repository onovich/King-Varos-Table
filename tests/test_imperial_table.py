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
assert.equal(Object.keys(Object.assign({},...boardData.regions.map(r=>r.clues))).length,Object.keys(Object.assign({},...original.regions.map(r=>r.clues))).length);
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
for(let seed=0;seed<5;seed++)for(let t=0;t<30;t+=.031){const p=flamePower(t,seed,false);assert.ok(p>=.72&&p<=1.28);assert.equal(flamePower(t,seed,true),1);}''')

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

    def test_blender_glbs_load_with_real_loader_at_tabletop_scale(self):
        self.run_js('''import {readFileSync} from 'node:fs';
import {GLTFLoader} from './web/prototypes/imperial-table/vendor/GLTFLoader.js';
import {Box3,Vector3} from './web/prototypes/imperial-table/vendor/three.module.min.js';
for(const name of ['charger','goblet','napkin']){
 const bytes=readFileSync(`./web/prototypes/imperial-table/assets/blender-tableware/${name}.glb`);
 assert.ok(bytes.length<600000);assert.equal(bytes.toString('ascii',0,4),'glTF');
 const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const box=new Box3().setFromObject(asset.scene),size=box.getSize(new Vector3());
 assert.ok(size.x>0&&size.x<2.2&&size.y>0&&size.y<1.1&&size.z>0&&size.z<2.2);
 assert.ok(box.min.y>-.03&&box.min.y<.1);
 asset.scene.traverse(o=>{if(o.isMesh){assert.ok(o.geometry.attributes.normal);for(const n of o.geometry.attributes.normal.array)assert.ok(Number.isFinite(n));}});
}''')

    def test_hall_drapery_is_local_and_stays_behind_the_table(self):
        self.run_js('''import {readFileSync} from 'node:fs';
import {GLTFLoader} from './web/prototypes/imperial-table/vendor/GLTFLoader.js';
import {Box3,Vector3} from './web/prototypes/imperial-table/vendor/three.module.min.js';
const bytes=readFileSync('./web/prototypes/imperial-table/assets/blender-hall/drapery.glb');
assert.ok(bytes.length<1000000);
const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const box=new Box3().setFromObject(asset.scene);
assert.ok(box.max.z < -15);assert.ok(box.min.y>1);assert.ok(box.max.y<15);
assert.ok(box.min.x>-5&&box.max.x<5);
assert.equal(asset.scene.children.length,4);
''')

    def test_roof_fades_before_overview_camera_can_be_occluded(self):
        self.run_js('''import {ceilingOpacity} from './web/prototypes/imperial-table/hall-detail.mjs';
assert.equal(ceilingOpacity(13.5),1);assert.equal(ceilingOpacity(18.5),0);
assert.ok(ceilingOpacity(16.5)>.4&&ceilingOpacity(16.5)<.6);
for(const aspect of [1440/900,1280/720,390/844,320/740]){
 const p=cameraDestination('overview',null,aspect);assert.equal(ceilingOpacity(p.position[1]),0);
}
''')

    def test_hdr_retains_dynamic_range_and_has_bounded_resolution(self):
        self.run_js('''import {readFileSync} from 'node:fs';
import {HDRLoader} from './web/prototypes/imperial-table/vendor/HDRLoader.js';
import {FloatType} from './web/prototypes/imperial-table/vendor/three.module.min.js';
const bytes=readFileSync('./web/prototypes/imperial-table/assets/baked-lighting/imperial-room-1k.hdr');
const hdr=new HDRLoader().setDataType(FloatType).parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
assert.equal(hdr.width,1024);assert.equal(hdr.height,512);assert.ok(bytes.length<2000000);
let maximum=0;for(let i=0;i<hdr.data.length;i+=4)for(let c=0;c<3;c++){const v=hdr.data[i+c];assert.ok(Number.isFinite(v)&&v>=0);maximum=Math.max(maximum,v);}
assert.ok(maximum>2&&maximum<100);
''')

    def test_baked_table_uv_matches_world_positions_and_assets_are_local(self):
        self.run_js('''import {readFileSync} from 'node:fs';
import {TABLE_BAKE,tableBakeUV,HDR_Y_ROTATION} from './web/prototypes/imperial-table/lighting.mjs';
import {Vector3,Matrix4} from './web/prototypes/imperial-table/vendor/three.module.min.js';
const probeDirection=new Vector3(0,0,-1).applyMatrix4(new Matrix4().makeRotationY(-HDR_Y_ROTATION));
assert.ok(Math.abs(probeDirection.x-1)<1e-9&&Math.abs(probeDirection.z)<1e-9);
assert.deepEqual(tableBakeUV(-6,-9.5),[0,0]);assert.deepEqual(tableBakeUV(6,9.5),[1,1]);
assert.deepEqual(tableBakeUV(0,0),[.5,.5]);assert.ok(TABLE_BAKE.y>2.975&&TABLE_BAKE.y<3.01);
for(const [x,z] of [[-4.75,-5.8],[4.75,0],[2.5,7.8]]){
 const [u,v]=tableBakeUV(x,z);assert.ok(Math.abs((u-.5)*12-x)<1e-9);assert.ok(Math.abs((v-.5)*19-z)<1e-9);
}
for(const name of ['table-ao','table-indirect']){
 const bytes=readFileSync(`./web/prototypes/imperial-table/assets/baked-lighting/${name}.webp`);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.ok(bytes.length<600000);
}
''')

    def test_visible_fire_motion_and_shared_chair_asset(self):
        self.run_js("""import {readFileSync} from 'node:fs';
import {Scene,Box3,Vector3} from './web/prototypes/imperial-table/vendor/three.module.min.js';
import {GLTFLoader} from './web/prototypes/imperial-table/vendor/GLTFLoader.js';
import {createFire,flameShape,flamePower} from './web/prototypes/imperial-table/fire.mjs';
const fire=createFire(new Scene(),2,3,0),base=fire.flame.position.clone(),lightBase=fire.light.position.clone();
let low=2,high=0,distinct=false;
for(let t=0;t<10;t+=.03){fire.update(t*1000,false);const s=flameShape(t,0,false);low=Math.min(low,s.height);high=Math.max(high,s.height);assert.ok(fire.flame.position.equals(base));assert.ok(fire.light.position.distanceTo(lightBase)<.2);assert.ok(Math.abs(fire.light.intensity-72*flamePower(t,0,false))<1e-10);distinct ||= Math.abs(flamePower(t,0,false)-flamePower(t,1,false))>.1;}
assert.ok(high-low>.3);assert.ok(distinct);fire.update(1300,true);assert.equal(fire.flame.scale.y,1);assert.equal(fire.flame.material.uniforms.bend.value,0);assert.equal(fire.light.intensity,72);
const bytes=readFileSync('./web/prototypes/imperial-table/assets/blender-furniture/imperial-chair.glb');assert.ok(bytes.length<700000);
const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const size=new Box3().setFromObject(scene).getSize(new Vector3());assert.ok(size.y>3.8&&size.y<4.8);assert.ok(size.x>1.5&&size.x<2.5);
let meshes=0;scene.traverse(o=>{if(o.isMesh)meshes++;});assert.equal(meshes,3);
const copy=scene.clone(true);assert.equal(copy.children[0].geometry,scene.children[0].geometry);
""")

    def test_atlas_alignment_lit_board_and_candle_clearance(self):
        self.run_js("""import {BOARD,CANDLES,candleSurface,chartV,paperRelief} from './web/prototypes/imperial-table/atlas-layout.mjs';
import {createBoard,cellUV,cellAt} from './web/prototypes/imperial-table/board.mjs';
import {boardData} from './web/prototypes/imperial-table/board-data.mjs';
import {Scene} from './web/prototypes/imperial-table/vendor/three.module.min.js';
assert.ok(Math.abs(MAP.width*BOARD.width/32-MAP.height*BOARD.height/24)<.001);
for(let i=0;i<768;i++){const uv=cellUV(i);assert.equal(cellAt(...uv),i);assert.equal(regions.indexOf(regionAt(...uv)),boardData.regionMap[i]);}
assert.ok(Math.abs(chartV(BOARD.v)-.21)<1e-9);assert.ok(Math.abs(chartV(BOARD.v+BOARD.height)-.78)<1e-9);assert.equal(chartV(0),0);assert.equal(chartV(1),1);
for(const [x,z] of CANDLES.slice(0,4)){assert.equal(candleSurface(x,z,MAP),MAP.y);assert.ok(Math.abs(z)-.37>MAP.height*BOARD.height/2);for(let a=0;a<6.3;a+=.2)assert.equal(paperRelief(x+Math.cos(a)*.37,z+Math.sin(a)*.37,MAP),0);}
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)})})};
const board=createBoard(new Scene());assert.ok(board.mesh.material.isMeshStandardMaterial);assert.ok(board.mesh.receiveShadow);assert.equal(board.mesh.material.emissive.getHex(),0);assert.ok(board.mesh.material.roughness>.8);
""")

    def test_smooth_camera_retarget_and_frame_independence(self):
        self.run_js("""import {createSmoothCamera} from './web/prototypes/imperial-table/smooth-camera.mjs';
const start={position:[0,12,4],target:[0,3,0]},goal={position:[2,6,2],target:[2,3,0]};
const a=createSmoothCamera(start),b=createSmoothCamera(start);a.set(goal);b.set(goal);assert.deepEqual(a.current,start);
for(let i=0;i<60;i++)a.step(1/60);for(let i=0;i<30;i++)b.step(1/30);
a.current.position.forEach((v,i)=>assert.ok(Math.abs(v-b.current.position[i])<1e-9));
const before=a.current;a.set({position:[-2,10,3],target:[-2,3,0]});assert.deepEqual(a.current,before);const next=a.step(1/60);assert.ok(next.position[0]<before.position[0]&&next.position[0]>-2);
for(let i=0;i<180;i++)a.step(1/60);assert.ok(Math.abs(a.current.position[0]+2)<1e-4);
""")

    def test_production_board_session_and_perspective_picking(self):
        self.run_js("""import {readFileSync} from 'node:fs';
import {Scene,PerspectiveCamera,Vector3,Vector2,Raycaster,Plane} from './web/prototypes/imperial-table/vendor/three.module.min.js';
import {createBoard} from './web/prototypes/imperial-table/board.mjs';
import {createJourneySession} from './web/journey-session.mjs';
import {journeyCameraPose,worldCell} from './web/journey-three-camera.mjs';
import {fitMap} from './web/map-camera.mjs';
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)})})};
const level=JSON.parse(readFileSync('./web/data/levels/inner-sea-journey-v1.json','utf8'));
const game=createJourneySession(level);game.start();const board=createBoard(new Scene(),level);const cell=level.regions.find(r=>r.id===game.getState().activeRegionId).cells[0];
assert.ok(game.applyMarks([cell],1));board.render(game.getState(),game.hint());assert.equal(board.values[cell],1);
assert.ok(game.undo());board.render(game.getState());assert.equal(board.values[cell],-1);game.redo();
const restored=createJourneySession(level,{saved:game.serialize()});board.render(restored.getState());assert.equal(board.values[cell],1);
for(const [width,height] of [[1440,900],[390,844],[320,740]]){
 const pose=journeyCameraPose(level,fitMap(level,{width,height}),{width,height},board.unit,MAP.y),camera=new PerspectiveCamera(35,width/height,.1,100);
 camera.position.fromArray(pose.position);camera.lookAt(new Vector3(...pose.target));camera.updateMatrixWorld();
 const ray=new Raycaster(),plane=new Plane(new Vector3(0,1,0),-(MAP.y+.012));
 for(let i=0;i<768;i++){const world=new Vector3((i%32+.5-16)*board.unit,MAP.y+.012,(Math.floor(i/32)+.5-12)*board.unit),screen=world.clone().project(camera);ray.setFromCamera(new Vector2(screen.x,screen.y),camera);const hit=ray.ray.intersectPlane(plane,new Vector3());assert.equal(worldCell(level,board.unit,hit.x,hit.z),i);}
}
board.dispose();
""")
