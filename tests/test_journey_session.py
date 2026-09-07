import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which('node'), 'Node.js required')
class JourneySessionTests(unittest.TestCase):
    def test_unstarted_invalid_and_legacy_saves(self):
        script = r'''
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createJourneySession,journeySaveKey,validJourneyRun} from './web/journey-session.mjs';
import {createCampaignProgress,createSavePayload,restoreSavePayload} from './web/campaign-state.mjs';
const level=JSON.parse(fs.readFileSync('web/data/levels/inner-sea-journey-v1.json','utf8'));
const fresh=createJourneySession(level);
const originalKey=journeySaveKey(level),separateKey=journeySaveKey(level,'trial-1');
assert.notEqual(originalKey,separateKey);
assert.notEqual(separateKey,journeySaveKey(level,'trial-2'));
assert.equal(validJourneyRun('bad/path'),'');
const saves=new Map([[originalKey,fresh.serialize()]]),original=saves.get(originalKey);
const trial=createJourneySession(level);trial.start();trial.applyMarks([level.regions[6].cells[0]],1);
saves.set(separateKey,trial.serialize());
assert.equal(saves.get(originalKey),original,'trial edits preserve original save');
assert.ok(createJourneySession(level,{saved:saves.get(originalKey)}).getState().values.every(v=>v===-1));
assert.equal(createJourneySession(level,{saved:fresh.serialize()}).getState().started,false);
for(const saved of ['{broken',null,JSON.stringify({version:1,mapKey:'other-map',board:{}})]) {
 const game=createJourneySession(level,{saved});
 assert.equal(game.getState().started,false);
 assert.ok(game.getState().guideActive);
 assert.ok(game.getState().values.every(v=>v===-1));
}
const old=JSON.parse(fs.readFileSync('web/data/levels/first-light.json','utf8'));
const values=Array(36).fill(-1);values[0]=1;
const legacyProgress=restoreSavePayload(old,createSavePayload(old,values,createCampaignProgress()));
const imported=createJourneySession(old,{legacyProgress});
assert.equal(imported.getState().values[0],1);
assert.ok(imported.getState().started);
assert.equal(createJourneySession(level,{skipGuide:true}).getState().guideActive,false);
'''
        result=subprocess.run([shutil.which('node'),'--input-type=module','-e',script],cwd=ROOT,capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_real_first_country_completion_survives_reload_and_unlocks_exploration(self):
        script = r'''
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createJourneySession} from './web/journey-session.mjs';
import {deriveDirectSolution} from './web/puzzle-logic.mjs';
const level = JSON.parse(fs.readFileSync('web/data/levels/inner-sea.json','utf8'));
level.onboarding = {regionId:6};
const game=createJourneySession(level);
game.start();
assert.equal(game.getState().activeRegionId,6);
assert.equal(game.selectRegion(0),false);
const solution=deriveDirectSolution(level);
for(const i of level.regions[6].cells) game.applyMarks([i],solution[i]);
assert.deepEqual(game.getState().campaign.completedRegionIds,[6]);
assert.deepEqual(game.pendingEvent(),{type:'fall',regionId:6});
const restored=createJourneySession(level,{saved:game.serialize()});
assert.deepEqual(restored.pendingEvent(),{type:'fall',regionId:6});
restored.acknowledgeEvent();
assert.equal(restored.selectRegion(0),true);
assert.equal(restored.pendingEvent(),null);
assert.ok(restored.getState().campaign.revealedRegionIds.includes(6));
assert.equal(restored.getState().values.length,400);
'''
        result=subprocess.run([shutil.which('node'),'--input-type=module','-e',script],cwd=ROOT,capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_full_journey_correction_history_and_ending(self):
        script = r'''
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createJourneySession} from './web/journey-session.mjs';
import {deriveDirectSolution} from './web/puzzle-logic.mjs';
const level=JSON.parse(fs.readFileSync('web/data/levels/inner-sea-journey-v1.json','utf8'));
const solution=deriveDirectSolution(level);
assert.ok(solution);
const game=createJourneySession(level);
game.start(); game.skipGuide();
const opening=level.regions.find(r=>r.id===6);
const a=opening.cells[0], b=opening.cells[1];
game.applyMarks([a],solution[a]); game.applyMarks([b],1-solution[b]);
assert.equal(game.clearErrors(),1);
assert.equal(game.getState().values[a],solution[a]);
assert.equal(game.getState().values[b],-1);
assert.ok(game.undo()); assert.equal(game.getState().values[b],1-solution[b]);
assert.ok(game.redo()); assert.equal(game.getState().values[b],-1);
for(const region of [opening,...level.regions.filter(r=>r.id!==6)]) {
 assert.ok(game.selectRegion(region.id));
 for(let guard=0;guard<768;guard++) {
   if(game.pendingEvent()) break;
   const hint=game.hint();
   assert.equal(hint.status,'ok',`hint stalled in ${region.id}`);
   assert.ok(hint.scopeCells.every(i=>level.regionMap[i]===region.id));
   assert.ok(game.applyMarks(hint.forcedCells,hint.value));
 }
 assert.deepEqual(game.pendingEvent(),{type:'fall',regionId:region.id});
 assert.equal(game.applyMarks([region.cells[0]],-1),false);
 game.acknowledgeEvent();
}
assert.deepEqual(game.getState().values,solution);
assert.deepEqual(game.pendingEvent(),{type:'banquet-ending'});
game.acknowledgeEvent();
assert.deepEqual(game.pendingEvent(),{type:'epilogue'});
game.acknowledgeEvent();
assert.equal(game.pendingEvent(),null);
assert.ok(game.getState().campaign.epilogueRevealed);
const restored=createJourneySession(level,{saved:game.serialize()});
assert.equal(restored.pendingEvent(),null);
assert.ok(restored.getState().campaign.epilogueRevealed);
// Undo/redo preserves acknowledged endings, while a new branch earns them again.
assert.ok(game.undo());
assert.equal(game.getState().campaign.completedRegionIds.length,6);
assert.ok(!game.getState().notes.includes('banquet:7'));
assert.ok(game.redo());
assert.equal(game.pendingEvent(),null);
assert.ok(game.undo());
const last=level.regions.find(r=>r.id===game.getState().activeRegionId);
for(const i of last.cells)game.applyMarks([i],solution[i]);
assert.equal(game.pendingEvent().type,'fall');
game.acknowledgeEvent();
assert.deepEqual(game.pendingEvent(),{type:'banquet-ending'});
'''
        result=subprocess.run([shutil.which('node'),'--input-type=module','-e',script],cwd=ROOT,capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
