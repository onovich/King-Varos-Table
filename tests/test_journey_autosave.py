import shutil
import subprocess
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

@unittest.skipUnless(shutil.which('node'), 'Node required')
class AutoSaveTests(unittest.TestCase):
    def test_single_save_replacement_migration_and_failed_write(self):
        script=r"""
import assert from 'node:assert/strict';
import {AUTO_SAVE_KEY,readAutoSave,writeAutoSave} from './web/journey-autosave.mjs';
const entries=new Map([['king-varos-table:journey:v1:old','old'],['king-varos-table:save:v3:old','old'],['locale','zh-CN']]);
const storage={get length(){return entries.size},key:i=>[...entries.keys()][i],getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v),removeItem:k=>entries.delete(k)};
assert.equal(readAutoSave(storage),null);
const payload=n=>JSON.stringify({version:1,started:true,board:{values:[n]}});
writeAutoSave(storage,'first',payload(1));
assert.deepEqual([...entries.keys()].sort(),[AUTO_SAVE_KEY,'locale'].sort());
writeAutoSave(storage,'second',payload(0));
assert.equal(entries.size,2);assert.equal(readAutoSave(storage).levelId,'second');
const before=entries.get(AUTO_SAVE_KEY);
assert.throws(()=>writeAutoSave({...storage,setItem(){throw Error('quota')}},'third',payload(1)));
assert.equal(entries.get(AUTO_SAVE_KEY),before);
entries.set(AUTO_SAVE_KEY,'broken');assert.equal(readAutoSave(storage),null);
entries.set(AUTO_SAVE_KEY,JSON.stringify({version:1,levelId:'x',payload:JSON.stringify({version:1,started:false,board:{}})}));
assert.equal(readAutoSave(storage),null);
"""
        result=subprocess.run(['node','--input-type=module','-e',script],cwd=ROOT,capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_new_journey_restarts_guide_and_overwrites_progress(self):
        script=r"""
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createJourneySession} from './web/journey-session.mjs';
import {writeAutoSave,readAutoSave} from './web/journey-autosave.mjs';
const level=JSON.parse(fs.readFileSync('./web/data/levels/inner-sea-journey-v1.json','utf8'));
const m=new Map(),storage={get length(){return m.size},key:i=>[...m.keys()][i],getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
const old=createJourneySession(level);old.start();old.skipGuide();old.applyMarks([level.regions.find(r=>r.id===old.getState().openingRegionId).cells[0]],1);
writeAutoSave(storage,level.levelId,old.serialize());
const resumed=createJourneySession(level,{saved:readAutoSave(storage).payload});
assert.deepEqual(resumed.getState().values,old.getState().values);assert.equal(resumed.getState().guideActive,false);
const fresh=createJourneySession(level,{skipGuide:false});fresh.start();writeAutoSave(storage,level.levelId,fresh.serialize());
assert.equal(fresh.getState().guideActive,true);assert(fresh.getState().values.every(v=>v===-1));
const latest=createJourneySession(level,{saved:readAutoSave(storage).payload});assert.equal(latest.getState().guideActive,true);assert(latest.getState().values.every(v=>v===-1));assert.equal(m.size,1);
"""
        result=subprocess.run(['node','--input-type=module','-e',script],cwd=ROOT,capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
