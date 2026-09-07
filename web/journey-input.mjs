import {cellAtPoint, canEditAtScale, zoomAtPoint} from './map-camera.mjs';
import {gridLineIndices} from './paint-stroke.mjs';
import {gridTargetForKey,resolveKeyboardTool,markValueForTool} from './input-tools.mjs';

/** Gesture arbitration: touch movement never paints; mouse strokes commit once. */
export function installJourneyInput(viewport, api) {
  const pointers = new Map();
  let gesture = null, space = false, spacePanned = false, lastPointerCommit = -Infinity;
  const point = event => { const r = viewport.getBoundingClientRect(); return {x:event.clientX-r.left,y:event.clientY-r.top}; };
  const hit = p => cellAtPoint(api.level(),api.camera(),p);
  const distance = ([a,b]) => Math.hypot(a.x-b.x,a.y-b.y);
  const center = ([a,b]) => ({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
  const cancel = () => { pointers.clear(); gesture=null; api.preview(null); };
  function target(index,event) {
    const value = event.button===2 || event.shiftKey ? 0 : ({bright:1,dark:0,erase:-1})[api.tool()];
    return api.values()[index] === value ? -1 : value;
  }
  function extend(index) {
    if (index===null || !gesture || gesture.kind!=='paint') return;
    for (const i of gridLineIndices(gesture.last,index,api.level().width)) if (api.canEdit(i)) gesture.cells.add(i);
    gesture.last=index;
    const preview=api.values(); for (const i of gesture.cells) preview[i]=gesture.value; api.preview(preview);
  }
  viewport.addEventListener('contextmenu',e=>e.preventDefault());
  viewport.addEventListener('pointerdown',event=>{
    if (event.target.closest('button') || !api.ready()) return;
    const p=point(event); pointers.set(event.pointerId,p); viewport.setPointerCapture(event.pointerId);
    if (pointers.size===2) { api.preview(null); gesture={kind:'pinch'}; return; }
    const index=hit(p);
    if (event.pointerType==='touch') gesture={kind:'tap',start:p,last:p,index,value:index===null ? -1 : target(index,event)};
    else if (space || event.button===1 || api.tool()==='move') { gesture={kind:'pan',last:p};if(space)spacePanned=true; }
    else if (index!==null && canEditAtScale(api.camera().scale) && api.canEdit(index)) {
      api.focus(index);
      gesture={kind:'paint',cells:new Set(),value:target(index,event),last:index}; extend(index); event.preventDefault();
    } else gesture={kind:'select',index};
  });
  viewport.addEventListener('pointermove',event=>{
    if (!pointers.has(event.pointerId) || !gesture) return;
    const previous=[...pointers.values()],p=point(event); pointers.set(event.pointerId,p);
    if (pointers.size>=2) {
      const next=[...pointers.values()], a=center(previous),b=center(next);
      const camera=zoomAtPoint(api.camera(),a,distance(next)/Math.max(1,distance(previous)));
      api.setCamera({...camera,x:camera.x+b.x-a.x,y:camera.y+b.y-a.y}); return;
    }
    if (gesture.kind==='tap' && Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>7) gesture.kind='pan';
    if (gesture.kind==='pan') {
      const camera=api.camera(); api.setCamera({...camera,x:camera.x+p.x-gesture.last.x,y:camera.y+p.y-gesture.last.y}); gesture.last=p;
    } else if (gesture.kind==='paint') extend(hit(p));
  });
  viewport.addEventListener('pointerup',event=>{
    if (!pointers.has(event.pointerId)) return;
    if(gesture?.kind==='paint')extend(hit(point(event)));
    pointers.delete(event.pointerId);
    const done=gesture;
    lastPointerCommit=performance.now();
    if (done?.kind==='pinch') { if (!pointers.size) cancel(); return; }
    gesture=null; api.preview(null);
    if (done?.kind==='paint') api.mark([...done.cells],done.value);
    else if (done?.kind==='tap' || done?.kind==='select') {
      if (done.index!==null) {
        api.focus(done.index);
        if (done.kind==='tap' && api.tool()!=='move' && canEditAtScale(api.camera().scale) && api.canEdit(done.index)) api.mark([done.index],done.value);
        else api.select(api.level().regionMap[done.index]);
      }
    }
  });
  viewport.addEventListener('click',event=>{
    // Accessibility activation may dispatch click without a pointer sequence.
    if(!api.ready() || event.target.closest('button') || performance.now()-lastPointerCommit<300)return;
    const cell=event.target.closest('[data-index]');if(!cell)return;
    const index=Number(cell.dataset.index);
    api.focus(index);
    if(canEditAtScale(api.camera().scale) && api.canEdit(index) && api.tool()!=='move')api.mark([index],target(index,event));
    else api.select(api.level().regionMap[index]);
  });
  viewport.addEventListener('pointercancel',cancel);
  viewport.addEventListener('lostpointercapture',event=>{ if (pointers.has(event.pointerId)) cancel(); });
  viewport.addEventListener('wheel',event=>{
    if (!api.ready() || event.target.closest('button')) return;
    event.preventDefault(); api.setCamera(zoomAtPoint(api.camera(),point(event),Math.exp(-event.deltaY*.0015)));
  },{passive:false});
  window.addEventListener('blur',()=>{space=false;spacePanned=false;cancel();});
  document.addEventListener('keydown',event=>{
    if (!api.ready() || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (event.code==='Space') {
      if(!space)spacePanned=false;space=true;
      if(viewport.contains(event.target) || spacePanned)event.preventDefault();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && ['z','y'].includes(event.key.toLowerCase())) {
      event.preventDefault(); api.history(event.key.toLowerCase()==='y' || event.shiftKey ? 'redo':'undo'); return;
    }
    if (/^[1-4]$/.test(event.key)) {
      if(event.ctrlKey || event.metaKey || event.altKey)return;
      event.preventDefault();api.setTool(['bright','dark','erase','move'][Number(event.key)-1]);return;
    }
    const index=Number(event.target.closest('[data-index]')?.dataset.index);
    if (!Number.isInteger(index)) return;
    const level=api.level(),next=gridTargetForKey(index,event.key,level.width,level.height,event);
    const keyboardTool=resolveKeyboardTool(api.tool(),event.key);
    if (next!==null) {
      event.preventDefault();api.focus(next);
    } else if (keyboardTool) {
      event.preventDefault();
      if (!canEditAtScale(api.camera().scale) || !api.canEdit(index) || api.tool()==='move') api.select(api.level().regionMap[index]);
      else api.mark([index],markValueForTool(api.values()[index],event.shiftKey && event.key==='Enter'?'dark':keyboardTool));
    }
  });
  document.addEventListener('keyup',event=>{
    if(event.code==='Space'){if(spacePanned)event.preventDefault();space=false;spacePanned=false;}
  });
}
