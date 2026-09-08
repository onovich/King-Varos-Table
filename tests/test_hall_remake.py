import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class HallRemakeTests(unittest.TestCase):
    def js(self, body):
        result = subprocess.run(['node', '--input-type=module', '--eval', "import assert from 'node:assert/strict';\n"+body], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_configuration_roundtrip_and_atomic_rejection(self):
        self.js('''import {validateLighting,shadowBudget,crossingGust} from './web/journey-light-editor.mjs';
const defaults={version:1,sources:[{id:'candle-1',enabled:true,color:'#ffccaa',intensity:72,x:0,y:4,z:0},{id:'environment',enabled:true,intensity:.24}]};
assert.deepEqual(validateLighting(JSON.parse(JSON.stringify(defaults)),defaults),defaults);
const reordered=structuredClone(defaults);reordered.sources.reverse();assert.deepEqual(validateLighting(reordered,defaults),defaults);
for(const change of [c=>c.version=2,c=>c.sources[0].intensity=-1,c=>c.sources[0].x=NaN,c=>c.sources[0].enabled='yes',c=>c.sources[0].color='red',c=>c.sources[0].id='missing',c=>c.sources.push(c.sources[0])]){const bad=structuredClone(defaults);change(bad);assert.throws(()=>validateLighting(bad,defaults));}
assert.equal(defaults.sources[0].intensity,72);
assert.deepEqual(shadowBudget(1440),{count:2,size:512,hz:15});assert.deepEqual(shadowBudget(390),{count:1,size:256,hz:10});
const center={x:50,y:50};assert.equal(crossingGust({x:50,y:50,time:1},{x:50,y:50,time:17},center),0);
assert.ok(crossingGust({x:0,y:50,time:1},{x:100,y:50,time:60},center)>0);
assert.ok(crossingGust({x:100,y:50,time:1},{x:0,y:50,time:60},center)<0);
assert.equal(crossingGust({x:0,y:100,time:1},{x:100,y:100,time:60},center),0);''')

    def test_real_model_plate_cup_clearance_and_throne(self):
        self.js('''import {readFileSync} from 'node:fs';import {GLTFLoader} from './web/prototypes/imperial-table/vendor/GLTFLoader.js';import {Box3,Vector3} from './web/prototypes/imperial-table/vendor/three.module.min.js';import {SEATS,setting} from './web/prototypes/imperial-table/seat-layout.mjs';
async function model(path){const b=readFileSync(path);return (await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;}
const plate=await model('./web/prototypes/imperial-table/assets/blender-tableware/charger.glb'),cup=await model('./web/prototypes/imperial-table/assets/blender-tableware/goblet.glb');
const plateSize=new Box3().setFromObject(plate).getSize(new Vector3()),cupSize=new Box3().setFromObject(cup).getSize(new Vector3());
for(const [x,z] of SEATS){const s=setting(x,z);plate.position.set(x,3.01,z);cup.position.set(s.cup[0],3.02,s.cup[1]);const a=new Box3().setFromObject(plate),b=new Box3().setFromObject(cup);const dx=Math.max(0,a.min.x-b.max.x,b.min.x-a.max.x),dz=Math.max(0,a.min.z-b.max.z,b.min.z-a.max.z);assert.ok(Math.hypot(dx,dz)>=Math.max(plateSize.x,plateSize.z)*.08);assert.ok(a.max.x< -3.31||a.min.x>3.31||a.max.z< -2.49||a.min.z>2.49);}
const chair=await model('./web/prototypes/imperial-table/assets/blender-furniture/imperial-chair.glb'),throne=await model('./web/prototypes/imperial-table/assets/blender-furniture/imperial-throne.glb');
const a=new Box3().setFromObject(chair).getSize(new Vector3()),b=new Box3().setFromObject(throne).getSize(new Vector3());assert.ok(b.y>a.y);assert.ok(b.x>a.x);assert.ok(a.y>4.5&&a.y<4.7);assert.ok(a.x>2.35&&a.x<2.5);assert.ok(b.y>5.7&&b.y<5.9);assert.ok(b.x>2.8&&b.x<3.0);assert.ok(a.z>2.1&&a.z<2.3);''')

    def test_mask_membership_fade_and_hysteresis(self):
        self.js('''import {MeshStandardMaterial} from './web/prototypes/imperial-table/vendor/three.module.min.js';import {createRegionFocus,focusState,regionBounds} from './web/prototypes/imperial-table/region-focus.mjs';
const data={width:3,height:2,regionMap:[0,0,1,0,1,1],regions:[{id:0,cells:[0,1,3]},{id:1,cells:[2,4,5]}]};const map={material:new MeshStandardMaterial()},board={unit:1,mesh:{material:new MeshStandardMaterial()}};
const f=createRegionFocus(map,board,data),shader={uniforms:{},vertexShader:'#include <worldpos_vertex>',fragmentShader:'#include <colorspace_fragment>'};map.material.onBeforeCompile(shader);
f.set(0,true);f.update(.125);assert.equal(shader.uniforms.focusAmount.value,.5);f.update(.125);assert.equal(shader.uniforms.focusAmount.value,1);
assert.deepEqual(Array.from(shader.uniforms.regionMask.value.image.data).filter((_,i)=>i%4===0),[255,255,0,255,0,0]);
f.set(1,true);assert.equal(shader.uniforms.regionProgress.value,0);f.update(.25);assert.equal(shader.uniforms.regionProgress.value,1);
f.set(1,false);f.update(.25);assert.equal(shader.uniforms.focusAmount.value,0);
assert.equal(focusState(false,27),false);assert.equal(focusState(true,27),true);assert.equal(focusState(true,24),false);assert.equal(focusState(false,29),true);assert.equal(focusState(false,25,320),true);assert.equal(focusState(true,21,320),true);assert.equal(focusState(true,19,320),false);
assert.deepEqual(regionBounds(data,0),{minX:0,maxX:2,minY:0,maxY:2,x:1,y:1});f.dispose();''')

    def test_gust_moves_light_and_updates_shadow(self):
        self.js('''import {Scene} from './web/prototypes/imperial-table/vendor/three.module.min.js';import {createFire} from './web/prototypes/imperial-table/fire.mjs';
const f=createFire(new Scene(),0,0,0);f.light.castShadow=true;f.update(1000,false);const p=f.light.position.clone();f.gust(.12);f.update(1016,false);assert.ok(f.light.position.distanceTo(p)>.05);f.light.shadow.needsUpdate=false;f.update(1200,false);assert.ok(f.light.shadow.needsUpdate);f.update(2000,true);assert.ok(f.light.position.equals(f.origin));assert.equal(f.light.intensity,72);''')

    def test_candle_parts_share_component_and_support_plane(self):
        self.js("""import {Scene,MeshStandardMaterial,Box3} from './web/prototypes/imperial-table/vendor/three.module.min.js';import {createCandle} from './web/prototypes/imperial-table/candle.mjs';import {CANDLES,candleSurface} from './web/prototypes/imperial-table/atlas-layout.mjs';import {MAP} from './web/prototypes/imperial-table/map-data.mjs';
const scene=new Scene(),m=new MeshStandardMaterial(),mats={bronze:m,gold:m,ivory:m,dark:m};
CANDLES.forEach(([x,z],i)=>{const f=createCandle(scene,mats,x,z,i,MAP);assert.equal(f.light.parent,f.group);assert.equal(f.flame.parent,f.group);assert.equal(f.group.children.length,11);const foot=new Box3().setFromObject(f.group.getObjectByName('foot')),wax=new Box3().setFromObject(f.group.getObjectByName('wax')),lip=new Box3().setFromObject(f.group.getObjectByName('wax-lip'));assert.ok(Math.abs(foot.min.y-candleSurface(x,z,MAP))<1e-6);assert.ok(Math.abs(lip.getCenter(wax.min.clone()).y-wax.max.y)<.02);assert.ok(Math.abs(f.flame.position.x-x)<1e-6);assert.ok(Math.abs(f.flame.position.z-z)<1e-6);});assert.equal(scene.children.length,5);
""")

    def test_single_presiding_seat_at_table(self):
        self.js("""import {readFileSync} from 'node:fs';import {Scene,Box3,Vector3} from './web/prototypes/imperial-table/vendor/three.module.min.js';import {GLTFLoader} from './web/prototypes/imperial-table/vendor/GLTFLoader.js';import {addFurniture} from './web/prototypes/imperial-table/furniture.mjs';import {SEATS} from './web/prototypes/imperial-table/seat-layout.mjs';
const original=GLTFLoader.prototype.loadAsync;
GLTFLoader.prototype.loadAsync=async function(url){const b=readFileSync(new URL(url));return this.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
try{const scene=new Scene();await addFurniture(scene,SEATS);assert.equal(scene.children.length,7);assert.equal(scene.children.filter(x=>x.name==='banquet-chair').length,6);const head=scene.children.filter(x=>x.name==='imperial-throne');assert.equal(head.length,1);assert.equal(head[0].position.y,0);assert.ok(head[0].position.z> -11&&head[0].position.z< -10);const bounds=new Box3().setFromObject(head[0]);assert.ok(bounds.max.z< -9.5);const sides=scene.children.filter(x=>x.name==='banquet-chair');assert.equal(sides[0].children[0].geometry,sides[1].children[0].geometry);}finally{GLTFLoader.prototype.loadAsync=original;}
""")

    def test_seated_envelope_and_exported_cushions(self):
        self.js("""import {readFileSync} from 'node:fs';import {GLTFLoader} from './web/prototypes/imperial-table/vendor/GLTFLoader.js';import {Box3,Vector3} from './web/prototypes/imperial-table/vendor/three.module.min.js';
const cm=75/2.975;
for(const [file,width] of [['imperial-chair.glb',2.00],['imperial-throne.glb',2.32]]){
 const bytes=readFileSync('./web/prototypes/imperial-table/assets/blender-furniture/'+file);const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');scene.updateMatrixWorld(true);const cushion=new Box3();
 scene.traverse(o=>{if(!o.isMesh||o.material.name!=='Oxblood upholstery')return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(v.y>1.65&&v.y<2.0)cushion.expandByPoint(v);}});
 const size=cushion.getSize(new Vector3());assert.ok(Math.abs(size.x-width)<.03);assert.ok(Math.abs(size.z-1.88)<.03);assert.ok(Math.abs(cushion.max.y-1.925)<.02);
 // Estimated clothed thigh envelope: 14 cm above the cushion, plus 3 cm clearance.
 assert.ok((2.64-cushion.max.y)*cm>17);assert.ok(cushion.max.y+14/cm+3/cm<2.64);
}
""")
