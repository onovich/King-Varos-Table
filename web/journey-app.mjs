import {createI18n,preferredLocale,persistLocale} from './i18n.mjs';
import {createJourneyText} from './journey-text.mjs';
import {createJourneySession,journeySaveKey,validJourneyRun} from './journey-session.mjs';
import {readAutoSave,writeAutoSave} from './journey-autosave.mjs';
import {createCameraMotion} from './camera-motion.mjs';
import {createJourneyBoard} from './journey-board.mjs';
import {installJourneyInput} from './journey-input.mjs';
import {createJourneyDialogs} from './journey-dialogs.mjs';
import {fitMap,clampCamera,zoomAtPoint,canEditAtScale,CELL_SIZE} from './map-camera.mjs';
import {findDirectClueHint,neighboursForCell,deriveDirectSolution} from './puzzle-logic.mjs';
import {saveKeyForLevel,restoreSavePayload} from './campaign-state.mjs';
import {levelEntries} from './level-book.mjs';

const NEW_LEVEL='inner-sea-journey-v1', el=id=>document.getElementById(id);
let storage;try{storage=window.localStorage;}catch{/* Privacy mode can deny even the getter. */}
const i18n=createI18n(preferredLocale(storage,navigator.languages)),t=createJourneyText(i18n),localize=v=>i18n.localize(v);
let level,session,board,manifest,camera,tool='bright',hint=null,message=null,currentNote=null,loadToken=0;
const migrationRun=validJourneyRun(new URL(location.href).searchParams.get('run'));
const viewport=el('mapViewport'), size=()=>({width:viewport.clientWidth,height:viewport.clientHeight});
const ready=()=>session && el('titleScreen').hidden && !document.querySelector('dialog[open]');
const dialogs=createJourneyDialogs({t,localize,level:()=>level,session:()=>session,onAcknowledge:acknowledge,
  onReadNote:id=>{session.readNote(id);save();render();}});
function storageWarning(){el('storageNotice').textContent=t('storageUnavailable');el('titleSaveNotice').textContent=t('storageUnavailable');}
function getSave(key){try{return storage?.getItem(key);}catch{storageWarning();return null;}}
function save(){if(!session?.getState().started || el('gameRoot').dataset.screen!=='play')return true;try{if(!storage)throw Error();writeAutoSave(storage,level.levelId,session.serialize());return true;}catch{storageWarning();return false;}}
function displayCamera(next){camera=next;board.camera(camera);session.setCamera(camera);}
const cameraMotion=createCameraMotion({read:()=>camera,write:displayCamera,finish:save});
function setCamera(next){cameraMotion.cancel();displayCamera(clampCamera(level,next,size()));save();}
function focusCountry(animate=false){
  const target=clampCamera(level,fitMap(level,size(),level.regions.find(r=>r.id===session.getState().activeRegionId).cells),size());
  if(animate)cameraMotion.move(target,{reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});else setCamera(target);
}
viewport.addEventListener('pointerdown',()=>cameraMotion.cancel(),{capture:true});
function overview(){setCamera(fitMap(level,size()));message={key:session.getState().campaign.epilogueRevealed?'allDone':'chooseCountry'};render();}
function selectCountry(id){
  const previous=session.getState().activeRegionId;
  if(!session.selectRegion(id)){message={key:'lockedCountry'};render();return;}
  hint=null;message=null;if(previous!==id || !canEditAtScale(camera.scale))focusCountry(true);render();save();
}
function translate(){
  document.documentElement.lang=i18n.locale;document.title=t('title');
  for(const node of document.querySelectorAll('[data-j]'))node.textContent=t(node.dataset.j);
  for(const [id,key] of [['mapViewport','mapLabel'],['board','mapLabel'],['zoomInButton','zoomIn'],['zoomOutButton','zoomOut'],['markToolbar','tools']])el(id).setAttribute('aria-label',t(key));
  document.querySelector('.reading-strip').setAttribute('aria-label',t('feedback'));
  document.querySelector('.assist-tools').setAttribute('aria-label',i18n.t('history.label'));
  for(const b of document.querySelectorAll('[data-locale]'))b.setAttribute('aria-pressed',String(b.dataset.locale===i18n.locale));
  if(session){el('startButton').textContent=t('newStart');el('resumeButton').hidden=!session.getState().started;render();}
}
function guide(){
  const state=session.getState();if(!state.guideActive)return null;
  const region=level.regions.find(r=>r.id===state.activeRegionId);
  const direct=session.hint();
  if(direct.status==='contradiction'){hint=direct;return {key:'guideRepair'};}
  for(const [key,predicate] of [['guideZero',(value)=>value===0],['guideFull',(value,index)=>value===neighboursForCell(level,index).length]]){
    const clues=Object.fromEntries(Object.entries(region.clues).filter(([index,value])=>predicate(value,Number(index))));
    const step=findDirectClueHint(level,{...region,clues},state.values);
    if(step.status==='ok'){if(!hint)hint=step;return {key};}
  }
  return {key:'guideBorder'};
}
function render(){
  if(!session)return;
  const state=session.getState(),region=level.regions.find(r=>r.id===state.activeRegionId);
  const lesson=guide();
  const completed=state.campaign.completedRegionIds.includes(region.id);
  el('countryTitle').textContent=localize(region.name);
  el('countryProgress').textContent=(completed?t('readOnly'):t('markedProgress',{count:region.cells.filter(i=>state.values[i]!==-1).length,total:region.cells.length}));
  for(const b of document.querySelectorAll('[data-tool]:not([data-tool="move"])'))b.disabled=completed;
  el('hintButton').disabled=completed;
  el('clearErrorsButton').disabled=state.campaign.completedRegionIds.length===level.regions.length;
  el('countryStoryButton').hidden=!state.campaign.revealedRegionIds.includes(region.id);
  el('landscapeButton').hidden=!(level.onboarding && region.id===state.openingRegionId && completed);
  el('mapProgress').textContent=t('progress',{count:state.campaign.completedRegionIds.length,total:level.regions.length});
  el('undoButton').disabled=!state.canUndo;el('redoButton').disabled=!state.canRedo;
  el('skipGuideButton').hidden=!state.guideActive;
  currentNote=state.notes.find(id=>!state.readNotes.includes(id)&&dialogs.note(id)) ?? null;
  const note=currentNote?dialogs.note(currentNote):null;
  el('noteKicker').textContent=t(completed?'complete':message?'instruction':lesson?.key==='guideBorder'?'independent':lesson?'guide':'travel');
  if(!completed && !message && !lesson && note)el('noteKicker').textContent=`${t('newNote')} · ${note.title}`;
  el('noteKicker').title=el('noteKicker').textContent;
  el('statusNote').textContent=completed?t('completedHelp'):message?t(message.key,message.params):lesson?t(lesson.key):note?.body ?? t(state.campaign.epilogueRevealed?'allDone':'chooseCountry');
  el('noteButton').disabled=false;
  el('noteButton').hidden=completed;
  board.render(state,hint);board.camera(camera);
}
function afterEdit(){hint=null;message=null;render();save();showPending();}
function showPending(){const event=session.pendingEvent();if(event && el('titleScreen').hidden)dialogs.story(event);}
function mark(indices,value){if(session.applyMarks(indices,value))afterEdit();}
function historyAction(action){if(session[action]())afterEdit();}
function acknowledge(event){
  session.acknowledgeEvent();hint=null;message={key:'chooseNext'};save();
  if(event.type==='practice'){
    const practice=levelEntries(manifest).filter(e=>e.difficulty==='tutorial');
    const next=practice[practice.findIndex(e=>e.id===level.levelId)+1];
    load(next?.id ?? NEW_LEVEL,true,true);return;
  }
  overview();render();showPending();
}
function begin(){
  const resuming=session.getState().started;
  session.start();el('titleScreen').hidden=true;el('gameRoot').dataset.screen='play';
  viewport.inert=false;
  if(resuming && session.getState().camera)setCamera(session.getState().camera);else focusCountry();
  render();save();showPending();
  if(!session.pendingEvent())viewport.focus();
}
async function fetchJson(source){const response=await fetch(source);if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();}
async function load(id=NEW_LEVEL,autoStart=false,fresh=false){
  cameraMotion.cancel();
  const token=++loadToken;if(fresh)save();
  const saved=fresh?null:readAutoSave(storage);
  el('titleScreen').hidden=false;el('gameRoot').dataset.screen='title';el('startButton').disabled=true;
  viewport.inert=true;el('resumeButton').disabled=true;
  el('startButton').textContent=t('loading');el('loadError').hidden=true;el('retryButton').hidden=true;
  for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();
  try{
    manifest??=await fetchJson('./data/campaign.json');
    const entry=levelEntries(manifest).find(e=>e.id===id);
    const loaded=await fetchJson(entry?.source ?? `./data/levels/${NEW_LEVEL}.json`);
    if(token!==loadToken)return;
    level=loaded;
    const migrating=!fresh && !saved;
    const legacyProgress=migrating?restoreSavePayload(level,getSave(saveKeyForLevel(level))):null;
    const payload=saved?.levelId===level.levelId?saved.payload:migrating?getSave(journeySaveKey(level,migrationRun)):null;
    session=createJourneySession(level,{saved:payload,legacyProgress,skipGuide:false});
    if(migrating && session.getState().started){try{writeAutoSave(storage,level.levelId,session.serialize());}catch{storageWarning();}}
    hint=null;message=null;
    board=createJourneyBoard(level,{board:el('board'),labels:el('countryLabels'),viewport,world:el('mapWorld'),t,localize,onCountry:selectCountry});
    camera=session.getState().camera??fitMap(level,size());setCamera(camera);
    el('startButton').disabled=false;el('resumeButton').disabled=false;setTool('bright');translate();
    const url=new URL(location.href);url.searchParams.set('level',level.levelId);url.searchParams.delete('country');url.searchParams.delete('mode');
    url.searchParams.delete('run');window.history.replaceState(null,'',url);
    if(autoStart)begin();
  }catch(error){
    if(token!==loadToken)return;
    el('loadError').textContent=t(location.protocol==='file:'?'localFile':'loadFailed');
    el('loadError').hidden=false;el('retryButton').hidden=false;console.error('Map loading failed',error);
  }
}
function setTool(next){tool=next;for(const b of document.querySelectorAll('[data-tool]'))b.setAttribute('aria-pressed',String(b.dataset.tool===tool));}
el('startButton').addEventListener('click',()=>load(NEW_LEVEL,true,true));
el('resumeButton').addEventListener('click',()=>{const saved=readAutoSave(storage);if(saved)load(saved.levelId,true);});
el('retryButton').addEventListener('click',()=>load(new URL(location.href).searchParams.get('level')??NEW_LEVEL));
el('menuButton').addEventListener('click',()=>dialogs.open('menuDialog'));
el('returnButton').addEventListener('click',()=>el('menuDialog').close());
function returnToTitle(){
  cameraMotion.cancel();
  save();for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();
  el('titleScreen').hidden=false;el('gameRoot').dataset.screen='title';viewport.inert=true;
  el('resumeButton').hidden=!readAutoSave(storage);el('startButton').focus();
}
el('titleReturnButton').addEventListener('click',returnToTitle);
el('exitButton').addEventListener('click',()=>{
  cameraMotion.cancel();
  ++loadToken;
  const saved=save();for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();
  if(!saved)el('exitScreen').querySelector('p:last-child').textContent=t('storageUnavailable');
  el('gameRoot').dataset.screen='exit';el('gameRoot').hidden=true;el('exitScreen').hidden=false;viewport.inert=true;
  el('exitHeading').focus();window.close();
});
el('overviewButton').addEventListener('click',overview);el('focusButton').addEventListener('click',()=>focusCountry(true));
for(const [id,factor] of [['zoomInButton',1.25],['zoomOutButton',.8]])el(id).addEventListener('click',()=>setCamera(zoomAtPoint(camera,{x:size().width/2,y:size().height/2},factor)));
for(const b of document.querySelectorAll('[data-tool]'))b.addEventListener('click',()=>setTool(b.dataset.tool));
el('undoButton').addEventListener('click',()=>historyAction('undo'));el('redoButton').addEventListener('click',()=>historyAction('redo'));
function revealHint(){
  hint=session.hint();
  message=['ok','contradiction'].includes(hint.status)?{key:hint.status==='ok'?'hintText':'conflictAt',params:{row:Math.floor(hint.clueIndex/level.width)+1,column:hint.clueIndex%level.width+1,value:hint.clueValue}}:{key:'noHint'};
  if(['ok','contradiction'].includes(hint.status)){
    const scale=Math.max(camera.scale,28/CELL_SIZE);
    const visible=hint.scopeCells.every(i=>{const x=(i%level.width+.5)*CELL_SIZE*scale+camera.x,y=(Math.floor(i/level.width)+.5)*CELL_SIZE*scale+camera.y;return x>24&&x<size().width-24&&y>24&&y<size().height-70;});
    if(!visible || scale!==camera.scale)setCamera({scale,x:size().width/2-(hint.clueIndex%level.width+.5)*CELL_SIZE*scale,y:size().height/2-(Math.floor(hint.clueIndex/level.width)+.5)*CELL_SIZE*scale});
  }else hint=null;
  render();
}
el('hintButton').addEventListener('click',revealHint);
el('countryStoryButton').addEventListener('click',()=>dialogs.story({type:'fall',regionId:session.getState().activeRegionId},true));
el('landscapeButton').addEventListener('click',()=>dialogs.landscape());
el('clearErrorsButton').addEventListener('click',()=>{const count=session.clearErrors();hint=null;message={key:'removed',params:{count}};render();save();});
el('skipGuideButton').addEventListener('click',()=>{session.skipGuide();hint=null;overview();save();});
el('noteButton').addEventListener('click',()=>{
  if(message){dialogs.read(el('noteKicker').textContent,el('statusNote').textContent);message=null;render();}
  else if(currentNote){const note=dialogs.note(currentNote);session.readNote(currentNote);dialogs.read(note.title,note.body);save();render();}
  else dialogs.archive();
});
el('archiveButton').addEventListener('click',()=>{if(session)dialogs.archive();});
el('helpButton').addEventListener('click',()=>dialogs.read(t('help'),t('helpBody')));
el('checkButton').addEventListener('click',()=>{
  if(!session)return;
  if(session.hint().status==='contradiction'){el('menuDialog').close();revealHint();return;}
  const values=session.getState().values,solution=deriveDirectSolution(level);
  message={key:values.some((v,i)=>v!==-1&&v!==solution[i])?'checkBad':'checkGood'};el('menuDialog').close();render();
});
el('levelBookButton').addEventListener('click',()=>{
  if(!manifest)return;el('levelBookChapters').replaceChildren();
  for(const entry of levelEntries(manifest)){
    const b=document.createElement('button');b.textContent=localize(entry.title);b.addEventListener('click',()=>load(entry.id,true,true));el('levelBookChapters').append(b);
  }dialogs.open('levelBookDialog');
});
for(const b of document.querySelectorAll('[data-locale]'))b.addEventListener('click',()=>{i18n.setLocale(b.dataset.locale);persistLocale(storage,i18n.locale);translate();});
installJourneyInput(viewport,{ready,level:()=>level,camera:()=>camera,setCamera,tool:()=>tool,setTool,values:()=>session.getState().values,
  canEdit:index=>session.canEdit(index),mark,select:selectCountry,preview:values=>{if(board)board.render(session.getState(),hint,values);},history:historyAction,
  focus:index=>{board.focus(index);const p={x:(index%level.width+.5)*CELL_SIZE*camera.scale+camera.x,y:(Math.floor(index/level.width)+.5)*CELL_SIZE*camera.scale+camera.y};
    if(p.x<24||p.x>size().width-24||p.y<24||p.y>size().height-24)setCamera({...camera,x:camera.x+size().width/2-p.x,y:camera.y+size().height/2-p.y});}});
let previousSize=size();
new ResizeObserver(()=>{
  const nextSize=size();
  if(board)setCamera({...camera,x:camera.x+(nextSize.width-previousSize.width)/2,y:camera.y+(nextSize.height-previousSize.height)/2});
  previousSize=nextSize;
}).observe(viewport);
window.addEventListener('pagehide',save);
translate();
const requested=new URL(location.href).searchParams.get('level');
load(readAutoSave(storage)?.levelId??requested??NEW_LEVEL);
