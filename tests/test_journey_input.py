"""Exercise the public input adapter with pointer and keyboard event streams."""
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which('node'), 'Node.js required')
class JourneyInputTests(unittest.TestCase):
    def test_stroke_endpoint_space_pan_touch_and_keyboard(self):
        script = r'''
import assert from 'node:assert/strict';
import {installJourneyInput} from './web/journey-input.mjs';
class Surface {
  handlers=new Map();
  addEventListener(type,handler){this.handlers.set(type,handler);}
  fire(type,event={}){this.handlers.get(type)?.({target:this,preventDefault(){},button:0,pointerId:1,pointerType:'mouse',...event});}
  closest(){return null;}
  contains(target){return target===this || target===cell;}
  getBoundingClientRect(){return {left:0,top:0};}
  setPointerCapture(){}
}
globalThis.document=new Surface();globalThis.window=new Surface();
const viewport=new Surface(),toolbar=new Surface();
const cell={dataset:{index:'5'},closest(selector){return selector==='[data-index]'?this:null;}};
let camera={x:0,y:0,scale:1},tool='bright',values=Array(16).fill(-1),strokes=[],focused=null;
installJourneyInput(viewport,{ready:()=>true,level:()=>({width:4,height:4,regionMap:Array(16).fill(0)}),
 camera:()=>camera,setCamera:c=>camera=c,tool:()=>tool,setTool:t=>tool=t,values:()=>[...values],
 canEdit:()=>true,mark:(indices,value)=>{strokes.push(indices);for(const i of indices)values[i]=value;},
 select(){},preview(){},history(){},focus:i=>focused=i});
viewport.fire('pointerdown',{clientX:22,clientY:22});
assert.equal(focused,0,'pointer painting hands keyboard focus to the cell');
viewport.fire('pointerup',{clientX:154,clientY:22});
assert.deepEqual(strokes,[[0,1,2,3]],'release endpoint completes one whole stroke');
let prevented=false;
document.fire('keydown',{target:toolbar,key:' ',code:'Space',preventDefault(){prevented=true;}});
assert.equal(prevented,false,'Space keeps native button activation when no drag follows');
viewport.fire('pointerdown',{clientX:22,clientY:66});
viewport.fire('pointermove',{clientX:66,clientY:66});
viewport.fire('pointerup',{clientX:66,clientY:66});
assert.equal(strokes.length,1,'Space pans even after choosing a toolbar tool');
assert.equal(camera.x,44);
document.fire('keyup',{key:' ',code:'Space'});
camera={x:0,y:0,scale:1};
viewport.fire('pointerdown',{pointerType:'touch',clientX:22,clientY:66});
viewport.fire('pointermove',{pointerType:'touch',clientX:66,clientY:66});
viewport.fire('pointerup',{pointerType:'touch',clientX:66,clientY:66});
assert.equal(strokes.length,1,'touch drag never paints');
assert.equal(camera.x,44);
camera={x:0,y:0,scale:1};
viewport.fire('pointerdown',{pointerType:'touch',clientX:22,clientY:66});
viewport.fire('pointerdown',{pointerType:'touch',pointerId:2,clientX:66,clientY:66});
viewport.fire('pointermove',{pointerType:'touch',pointerId:2,clientX:110,clientY:66});
assert.equal(camera.scale,2);
viewport.fire('pointerup',{pointerType:'touch',pointerId:2,clientX:110,clientY:66});
viewport.fire('pointerup',{pointerType:'touch',clientX:22,clientY:66});
assert.equal(strokes.length,1,'pinch never paints');
document.fire('keydown',{target:cell,key:'2'});
assert.equal(tool,'dark');
assert.equal(values[5],-1,'choosing a tool must not alter the focused cell');
document.fire('keydown',{target:cell,key:'Enter'});
assert.equal(values[5],0,'Enter applies the selected tool');
for(const key of ['1','2','3','4']){
 const before=[...values],count=strokes.length;
 document.fire('keydown',{target:cell,key});
 assert.deepEqual(values,before);
 assert.equal(strokes.length,count,'tool selection must not add history');
}
document.fire('keydown',{target:cell,key:'3'});
document.fire('keydown',{target:cell,key:'0'});assert.equal(values[5],-1);
document.fire('keydown',{target:cell,key:'Home'});assert.equal(focused,4);
document.fire('keydown',{target:cell,key:'End',ctrlKey:true});assert.equal(focused,15);
'''
        result = subprocess.run([shutil.which('node'), '--input-type=module', '-e', script],
                                cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
