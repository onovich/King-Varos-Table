import * as T from './vendor/three.module.min.js';
import {createScene} from './scene.mjs';
import {regions,MAP,regionAt} from './map-data.mjs';
import {createMotion,isClick} from './motion.mjs';
import {cameraDestination,overviewDistance as fitDistance} from './camera.mjs';
import {createBoard,cellAt,boardOpacity,BOARD} from './board.mjs';

const $=id=>document.getElementById(id),canvas=$('scene');
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
const stage=await createScene(renderer),camera=new T.PerspectiveCamera(35,1,.1,100),target=new T.Vector3(),board=createBoard(stage.scene);
let brush=1,activeCell=0;
const toolbar=document.createElement('div');toolbar.id='boardTools';toolbar.hidden=true;toolbar.setAttribute('aria-label','棋盘工具');
for(const [label,value] of [['亮格',1],['暗格',0],['擦除',-1],['移动',null]]){const b=document.createElement('button');b.textContent=label;b.dataset.brush=String(value);b.setAttribute('aria-pressed',String(value===brush));b.onclick=()=>{brush=value;for(const child of toolbar.querySelectorAll('[data-brush]'))child.setAttribute('aria-pressed',String(child.dataset.brush===String(value)));};toolbar.append(b);}
const undo=document.createElement('button');undo.textContent='撤销';undo.onclick=()=>{board.undo();status.textContent=board.description(activeCell);};toolbar.append(undo);
const status=document.createElement('p');status.id='cellStatus';status.setAttribute('role','status');status.textContent='点击标记 · 拖动平移 · 试填不保存';toolbar.append(status);document.body.append(toolbar);
canvas.tabIndex=0;canvas.setAttribute('aria-label','内海棋盘；靠近后，方向键选择格子，空格标记，数字 1 亮格、0 暗格、Delete 擦除');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),motion=createMotion();
let view='banquet',selected=null,hover=null,frame=0,frames=0,lastMeasure=performance.now();
const ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),-MAP.y);
const pointers=new Map();let gesture=null;
const overviewDistance=()=>fitDistance(camera.aspect);
const destination=(kind,id)=>cameraDestination(kind,id,camera.aspect);
function pose(){return {position:camera.position.toArray(),target:target.toArray()};}
function apply(p){camera.position.fromArray(p.position);target.fromArray(p.target);camera.lookAt(target);camera.updateMatrixWorld();}
function go(kind,id=null){
 view=kind;selected=id;hover=null;$('hoverLabel').hidden=true;document.body.dataset.view=kind;
 $('intro').hidden=kind!=='banquet';$('mapUI').hidden=kind==='banquet';
 const region=regions.find(r=>r.id===id);$('regionName').textContent=region?.name||'七国，尽入眼底';$('regionLine').textContent=region?.line||'选择一处山河，让镜头带你靠近。';
 for(const b of $('countries').children)b.setAttribute('aria-pressed',String(b.dataset.region===id));
 motion.start(pose(),destination(kind,id),performance.now(),reduced.matches?120:kind==='region'?700:1400);
}
for(const r of regions){const b=document.createElement('button');b.textContent=r.name;b.dataset.region=r.id;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>go('region',r.id));$('countries').append(b);}
$('enter').onclick=()=>go('overview');$('overview').onclick=()=>go('overview');$('banquet').onclick=()=>go('banquet');
$('countries').addEventListener('keydown',e=>{const buttons=[...$('countries').children],index=buttons.indexOf(document.activeElement);if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();buttons[e.key==='Home'?0:e.key==='End'?6:(index+(e.key==='ArrowRight'?1:6))%7].focus();}});
function ground(x,y){ray.setFromCamera(new T.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),camera);return ray.ray.intersectPlane(plane,new T.Vector3());}
function pick(x,y){const p=ground(x,y);return p?regionAt(p.x/MAP.width+.5,p.z/MAP.height+.5):null;}
function pickCell(x,y){const p=ground(x,y);return p?cellAt(p.x/MAP.width+.5,p.z/MAP.height+.5):null;}
canvas.addEventListener('keydown',e=>{if(board.opacity<.65)return;const moves={ArrowLeft:-1,ArrowRight:1,ArrowUp:-32,ArrowDown:32};if(e.key in moves){e.preventDefault();activeCell=T.MathUtils.clamp(activeCell+moves[e.key],0,767);board.hover(activeCell);status.textContent=board.description(activeCell);}else if([' ','1','0','Delete','Backspace'].includes(e.key)){e.preventDefault();board.paint(activeCell,e.key==='1'?1:e.key==='0'?0:['Delete','Backspace'].includes(e.key)?-1:brush??1);status.textContent=board.description(activeCell);}});
function pan(dx,dz){const x=T.MathUtils.clamp(target.x+dx,-MAP.width*.55,MAP.width*.55),z=T.MathUtils.clamp(target.z+dz,-MAP.height*.55,MAP.height*.55);camera.position.x+=x-target.x;camera.position.z+=z-target.z;target.x=x;target.z=z;camera.lookAt(target);camera.updateMatrixWorld();}
function zoom(factor){const offset=camera.position.clone().sub(target),distance=T.MathUtils.clamp(offset.length()*factor,5,overviewDistance()*1.25);offset.setLength(distance);camera.position.copy(target).add(offset);camera.lookAt(target);camera.updateMatrixWorld();}
canvas.addEventListener('pointerdown',e=>{if(view==='banquet')return;motion.cancel();canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1)gesture={x:e.clientX,y:e.clientY,max:0,multiple:false};else gesture.multiple=true;$('hoverLabel').hidden=true;});
canvas.addEventListener('pointermove',e=>{
 if(view==='banquet')return;
 if(pointers.has(e.pointerId)){
  const old=pointers.get(e.pointerId),next={x:e.clientX,y:e.clientY};gesture.max=Math.max(gesture.max,Math.hypot(next.x-gesture.x,next.y-gesture.y));
  if(pointers.size===2){const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)[1];zoom(Math.hypot(old.x-other.x,old.y-other.y)/Math.max(1,Math.hypot(next.x-other.x,next.y-other.y)));}
  else if(gesture.max>6){const a=ground(old.x,old.y),b=ground(next.x,next.y);if(a&&b)pan(a.x-b.x,a.z-b.z);}
  pointers.set(e.pointerId,next);hover=null;return;
 }
 const cell=pickCell(e.clientX,e.clientY);board.hover(board.opacity>.65?cell:null);
 if(board.opacity>.65&&cell!==null){activeCell=cell;status.textContent=board.description(cell);canvas.style.cursor=brush===null?'grab':'crosshair';hover=null;$('hoverLabel').hidden=true;return;}
 const r=pick(e.clientX,e.clientY);hover=r?.id||null;canvas.style.cursor=r?'pointer':'grab';$('hoverLabel').hidden=!r;if(r){$('hoverLabel').textContent=r.name;$('hoverLabel').style.left=Math.min(e.clientX+16,innerWidth-130)+'px';$('hoverLabel').style.top=Math.min(e.clientY+16,innerHeight-50)+'px';}
});
function release(e,cancelled=false){if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);if(!pointers.size){if(!cancelled&&isClick(gesture.max,gesture.multiple)){const cell=pickCell(e.clientX,e.clientY);if(board.opacity>.65&&cell!==null){activeCell=cell;if(brush!==null)board.paint(cell,brush);status.textContent=board.description(cell);}else{const r=pick(e.clientX,e.clientY);if(r)go('region',r.id);}}gesture=null;}}
canvas.addEventListener('pointerup',e=>release(e));canvas.addEventListener('pointercancel',e=>release(e,true));canvas.addEventListener('pointerleave',()=>{hover=null;$('hoverLabel').hidden=true;});
canvas.addEventListener('wheel',e=>{if(view==='banquet')return;e.preventDefault();motion.cancel();zoom(Math.exp(T.MathUtils.clamp(e.deltaY,-150,150)*.0015));},{passive:false});
function resize(){const narrow=innerWidth<=700;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,narrow?1.25:1.75));renderer.setSize(innerWidth,innerHeight);const size=narrow?1024:2048;if(stage.sun.shadow.mapSize.x!==size){stage.sun.shadow.mapSize.set(size,size);stage.sun.shadow.map?.dispose();stage.sun.shadow.map=null;}motion.cancel();apply(destination(view,selected));}
addEventListener('resize',resize);resize();
if(matchMedia('(pointer:coarse)').matches)document.querySelector('.instruction').textContent='单指平移 · 双指缩放 · 轻触地区靠近';
function animate(time){if(document.hidden)return;const p=motion.sample(time);if(p)apply(p);
 const a=new T.Vector3(target.x,MAP.y,target.z).project(camera),b=new T.Vector3(target.x+MAP.width*BOARD.width/32,MAP.y,target.z).project(camera),pixels=Math.abs(a.x-b.x)*innerWidth/2;
 const opacity=view==='banquet'?0:boardOpacity(pixels);board.setOpacity(opacity);toolbar.hidden=opacity<.65;
 stage.update(time,hover,selected,reduced.matches,camera);renderer.render(stage.scene,camera);frames++;if(time-lastMeasure>1500){$('performance').textContent=Math.round(frames*1000/(time-lastMeasure))+' FPS';frames=0;lastMeasure=time;}frame=requestAnimationFrame(animate);}
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);motion.cancel();if(!document.hidden){frames=0;lastMeasure=performance.now();frame=requestAnimationFrame(animate);}});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);$('failure').hidden=false;$('failureText').textContent='图形上下文已中断，请重新载入试稿。';});
renderer.render(stage.scene,camera);$('loading').hidden=true;$('enter').disabled=false;frame=requestAnimationFrame(animate);
