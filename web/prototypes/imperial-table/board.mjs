import * as T from './vendor/three.module.min.js';
import {boardData as defaultData} from './board-data.mjs?v=12';
import {MAP} from './map-data.mjs?v=12';
import {BOARD} from './atlas-layout.mjs?v=12';
export {BOARD};
export function cellUV(index){return [BOARD.u+(index%defaultData.width+.5)/defaultData.width*BOARD.width,BOARD.v+(Math.floor(index/defaultData.width)+.5)/defaultData.height*BOARD.height];}
export function cellAt(u,v){const x=Math.floor((u-BOARD.u)/BOARD.width*defaultData.width),y=Math.floor((v-BOARD.v)/BOARD.height*defaultData.height);return x<0||y<0||x>=defaultData.width||y>=defaultData.height?null:y*defaultData.width+x;}
export function boardOpacity(pixels){const t=Math.max(0,Math.min(1,(pixels-17)/12));return t*t*(3-2*t);}
export function createMarks(count=defaultData.width*defaultData.height){const values=new Array(count).fill(-1),history=[];return {values,paint(index,value){if(!Number.isInteger(index)||index<0||index>=values.length||![-1,0,1].includes(value)||values[index]===value)return false;history.push([index,values[index]]);values[index]=value;return true;},undo(){const last=history.pop();if(!last)return false;values[last[0]]=last[1];return true;}};}
export function createBoard(scene,data=defaultData){
 const w=data.width,h=data.height,unit=Math.min(MAP.width*BOARD.width/w,MAP.height*BOARD.height/h);
 const marks=createMarks(w*h),values=marks.values,clues=Object.assign({},...data.regions.map(r=>r.clues));
 const canvas=document.createElement('canvas');canvas.width=w*64;canvas.height=h*64;const ctx=canvas.getContext('2d'),size=64;
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
 const material=new T.MeshStandardMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,roughness:.92,metalness:0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const mesh=new T.Mesh(new T.PlaneGeometry(unit*w,unit*h),material);mesh.rotation.x=-Math.PI/2;mesh.position.set(0,MAP.y+.012,(BOARD.v+BOARD.height/2-.5)*MAP.height);mesh.receiveShadow=true;mesh.renderOrder=3;scene.add(mesh);
 let hovered=null,state=null,hint=null,focused=false;
 function draw(){
  ctx.clearRect(0,0,w*64,h*64);
  for(let i=0;i<values.length;i++){const x=i%w*size,y=Math.floor(i/w)*size;
   ctx.fillStyle=values[i]===1?'rgba(200,169,106,.78)':values[i]===0?'rgba(35,48,44,.88)':'rgba(233,222,194,.25)';ctx.fillRect(x+.5,y+.5,size-1,size-1);
   ctx.strokeStyle='rgba(81,66,42,.30)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,size-1,size-1);
   if(clues[i]!==undefined){ctx.globalAlpha=focused&&state&&data.regionMap[i]!==state.activeRegionId?.6:1;ctx.fillStyle=values[i]===0?'rgba(35,48,44,.7)':'rgba(238,225,195,.72)';ctx.beginPath();ctx.ellipse(x+32,y+32,20,23,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=values[i]===0?'#f3e5c6':'#29342e';ctx.font='600 33px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(clues[i]),x+32,y+33);ctx.globalAlpha=1;}
   if(hint?.scopeCells?.includes(i)){ctx.fillStyle='rgba(203,168,80,.25)';ctx.fillRect(x+2,y+2,60,60);}if(i===hint?.clueIndex){ctx.strokeStyle=hint.status==='contradiction'?'#ab493d':'#cf9b35';ctx.lineWidth=5;ctx.strokeRect(x+3,y+3,58,58);}

   const r=data.regionMap[i];ctx.strokeStyle='rgba(89,66,35,.70)';ctx.lineWidth=2.5;ctx.beginPath();if(i%w===0||data.regionMap[i-1]!==r){ctx.moveTo(x,y);ctx.lineTo(x,y+64);}if(i<w||data.regionMap[i-w]!==r){ctx.moveTo(x,y);ctx.lineTo(x+64,y);}ctx.stroke();
  }
  ctx.strokeStyle='#967945';ctx.lineWidth=3;ctx.strokeRect(3,3,w*64-6,h*64-6);
  if(hovered!==null){ctx.strokeStyle='#c6a368';ctx.lineWidth=5;ctx.strokeRect(hovered%w*64+3,Math.floor(hovered/w)*64+3,58,58);}
  texture.needsUpdate=true;
 }
 draw();return {mesh,values,unit,setFocused(next){if(next!==focused){focused=next;draw();}},render(next,nextHint=null,preview=null){state=next;hint=nextHint;values.splice(0,values.length,...(preview??next.values));draw();},dispose(){scene.remove(mesh);mesh.geometry.dispose();material.dispose();texture.dispose();},get opacity(){return material.opacity;},setOpacity(value){material.opacity=value;mesh.visible=value>.005;},hover(index){if(index!==hovered){hovered=index;draw();}},paint(index,value){const changed=marks.paint(index,value);if(changed)draw();return changed;},undo(){const changed=marks.undo();if(changed)draw();return changed;},description(index){return index===null?'':`第 ${Math.floor(index/w)+1} 行，第 ${index%w+1} 列${clues[index]===undefined?'':`，线索 ${clues[index]}`}，${values[index]===1?'亮格':values[index]===0?'暗格':'未标记'}`;}};
}
