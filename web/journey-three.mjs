import {createChartLabels} from './prototypes/imperial-table/chart-labels.mjs';
import {createLightEditor,crossingGust} from './journey-light-editor.mjs';
import {createRegionFocus,focusState} from './prototypes/imperial-table/region-focus.mjs';
import * as T from './prototypes/imperial-table/vendor/three.module.min.js';
import {createScene} from './prototypes/imperial-table/scene.mjs?v=12';
import {createBoard,boardOpacity} from './prototypes/imperial-table/board.mjs?v=12';
import {createSmoothCamera} from './prototypes/imperial-table/smooth-camera.mjs';
import {MAP} from './prototypes/imperial-table/map-data.mjs?v=12';
import {cameraDestination} from './prototypes/imperial-table/camera.mjs?v=12';
import {journeyCameraPose,worldCell} from './journey-three-camera.mjs';

export async function createJourneyThree(viewport){
 const canvas=document.createElement('canvas');canvas.className='journey-scene';canvas.setAttribute('aria-hidden','true');viewport.prepend(canvas);
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 let stage;try{stage=await createScene(renderer);}catch(error){canvas.remove();renderer.dispose();throw new Error('3D 宴厅加载失败：请检查 WebGL 2 支持或重新载入。',{cause:error});}
 const camera=new T.PerspectiveCamera(35,1,.1,100),look=new T.Vector3();
 const ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),-(MAP.y+.012));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let fireOverride=null;const toggle=document.getElementById('candleMotionButton');
 const fireEnabled=()=>fireOverride??!reduced.matches;
 function syncToggle(){toggle.setAttribute('aria-pressed',String(fireEnabled()));}
 toggle.onclick=()=>{fireOverride=!fireEnabled();editor.setDynamic(fireOverride);syncToggle();};reduced.addEventListener('change',syncToggle);syncToggle();
 const smooth=createSmoothCamera(cameraDestination('banquet',null,innerWidth/innerHeight));
 let chartLabels=null,overviewLatch=false,skipCamera=false,focus=null,focused=false,activeId=null,editorView=null,board=null,level=null,logical=null,labels=null,last=0,frame=0,shownTitle=true,pixels=0,measureStart=0,measureFrames=0;
 function title(){return document.getElementById('gameRoot').dataset.screen!=='play';}
 function destination(){
  if(editorView==='banquet'||title()||!logical||!board)return cameraDestination('banquet',null,camera.aspect);
  return journeyCameraPose(level,logical,{width:viewport.clientWidth,height:viewport.clientHeight},board.unit,MAP.y);
 }
 function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,w<700?1.25:1.75));renderer.setSize(w,h);const shadowSize=w<700?1024:2048;if(stage.sun.shadow.mapSize.x!==shadowSize){stage.sun.shadow.mapSize.set(shadowSize,shadowSize);stage.sun.shadow.map?.dispose();stage.sun.shadow.map=null;stage.sun.shadow.needsUpdate=true;}smooth.set(destination());}
 const editor=createLightEditor(stage,renderer,{onView(view){editorView=view==='banquet'?'banquet':null;if(view==='overview')document.getElementById('overviewButton').click();if(view==='focus')document.getElementById('focusButton').click();smooth.set(destination());}});
 editor.panel.addEventListener('close',()=>{editorView=null;smooth.set(destination());});
 let previousPointer=null;
 viewport.addEventListener('pointermove',e=>{if(e.buttons||e.target.closest('button')||document.querySelector('dialog[open]')||fireOverride===false){previousPointer=null;return;}const rect=viewport.getBoundingClientRect(),next={x:e.clientX-rect.left,y:e.clientY-rect.top,time:e.timeStamp};for(const fire of stage.fires){const p=fire.flame.position.clone().project(camera);if(p.z<1&&fire.settings.dynamic&&fire.settings.enabled){const force=crossingGust(previousPointer,next,{x:(p.x+1)*rect.width/2,y:(1-p.y)*rect.height/2});if(force){fire.gust(force);canvas.dataset.windEvents=String(Number(canvas.dataset.windEvents??0)+1);}}}previousPointer=next;});
 new ResizeObserver(resize).observe(viewport);resize();
 function animate(time){if(document.hidden||document.getElementById('gameRoot').hidden)return;
  if(title()!==shownTitle){shownTitle=title();smooth.set(destination());}
  const dt=last?Math.min(.1,(time-last)/1000):1/60;const p=smooth.step(dt,reduced.matches?.045:.13);last=time;
  camera.position.fromArray(p.position);look.fromArray(p.target);camera.lookAt(look);camera.updateMatrixWorld();
  if(board){const a=new T.Vector3(look.x,MAP.y,look.z).project(camera),b=new T.Vector3(look.x+board.unit,MAP.y,look.z).project(camera);pixels=Math.abs(b.x-a.x)*viewport.clientWidth/2;board.setOpacity(title()||overviewLatch?0:boardOpacity(pixels));
   const entering=!overviewLatch&&!focused&&focusState(focused,pixels,viewport.clientWidth);focused=!overviewLatch&&focusState(focused,pixels,viewport.clientWidth);if(entering&&!title()&&!editor.panel.open)queueMicrotask(()=>document.getElementById('focusButton').click());board.setFocused(focused);focus?.set(activeId,focused&&!title()&&editorView!=='banquet');focus?.update(dt);viewport.classList.toggle('is-overview',!focused);viewport.dataset.editable=String(focused);
   for(let i=0;i<(labels?.children.length??0);i++){const button=labels.children[i],r=level.regions[i];const cx=r.cells.reduce((s,c)=>s+c%level.width+.5,0)/r.cells.length,cy=r.cells.reduce((s,c)=>s+Math.floor(c/level.width)+.5,0)/r.cells.length;
    const point=new T.Vector3((cx-level.width/2)*board.unit,MAP.y+.08,(cy-level.height/2)*board.unit).project(camera);
    const half=Math.min((button.offsetWidth||120)/2,viewport.clientWidth/2-8);button.style.left=T.MathUtils.clamp((point.x+1)*viewport.clientWidth/2,half+4,viewport.clientWidth-half-4)+'px';button.style.top=(1-point.y)*viewport.clientHeight/2+'px';button.style.transform='translate(-50%,-50%)';button.hidden=title()||editorView==='banquet'||focused||point.z>1;
   }
  }
  chartLabels?.update(!title()&&!focused&&editorView!=='banquet',pixels);
  stage.update(time,null,null,fireOverride===false,camera);renderer.render(stage.scene,camera);editor.update(canvas.dataset.fps??'—');measureFrames++;if(time-measureStart>1500){canvas.dataset.fps=String(Math.round(measureFrames*1000/(time-measureStart)));canvas.dataset.drawCalls=String(renderer.info.render.calls);canvas.dataset.triangles=String(renderer.info.render.triangles);measureStart=time;measureFrames=0;}frame=requestAnimationFrame(animate);
 }
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);last=0;if(!document.hidden)frame=requestAnimationFrame(animate);});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);const note=document.createElement('div');note.className='scene-failure';note.setAttribute('role','alert');note.textContent='图形上下文中断，请刷新页面恢复自动存档。';viewport.append(note);});
 frame=requestAnimationFrame(animate);
 return {
  overview(){overviewLatch=true;skipCamera=true;},focusView(){overviewLatch=false;},
  attach(next,dom){chartLabels?.dispose();focus?.dispose();board?.dispose();level=next;labels=dom.labels;viewport.append(labels);board=createBoard(stage.scene,next);focus=createRegionFocus(stage.map,board,next);chartLabels=createChartLabels(stage.scene,next,board.unit,Array.from(labels.children));smooth.set(destination());return {
   render(state,hint,preview){activeId=state.activeRegionId;board.render(state,hint,preview);},camera(nextCamera){if(!skipCamera&&logical&&nextCamera.scale>logical.scale*1.005)overviewLatch=false;skipCamera=false;logical={...nextCamera};smooth.set(destination());},focus(index){board.hover(index);}
  };},
  editable(){return !title()&&focused&&!editor.panel.open;},
  hit(point){if(!board)return null;ray.setFromCamera(new T.Vector2(point.x/viewport.clientWidth*2-1,1-point.y/viewport.clientHeight*2),camera);const p=ray.ray.intersectPlane(plane,new T.Vector3());if(!p)return null;
   return worldCell(level,board.unit,p.x,p.z);
  }
 };
}
