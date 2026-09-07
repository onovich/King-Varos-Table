import * as T from './vendor/three.module.min.js';
import {boardData as data} from './board-data.mjs';
import {MAP} from './map-data.mjs';
export const BOARD={u:.04,v:.236,width:.92,height:.528};
export function cellUV(index){return [BOARD.u+(index%data.width+.5)/data.width*BOARD.width,BOARD.v+(Math.floor(index/data.width)+.5)/data.height*BOARD.height];}
export function cellAt(u,v){const x=Math.floor((u-BOARD.u)/BOARD.width*data.width),y=Math.floor((v-BOARD.v)/BOARD.height*data.height);return x<0||y<0||x>=data.width||y>=data.height?null:y*data.width+x;}
export function boardOpacity(pixels){const t=Math.max(0,Math.min(1,(pixels-17)/12));return t*t*(3-2*t);}
export function createMarks(){const values=new Array(data.width*data.height).fill(-1),history=[];return {values,paint(index,value){if(!Number.isInteger(index)||index<0||index>=values.length||![-1,0,1].includes(value)||values[index]===value)return false;history.push([index,values[index]]);values[index]=value;return true;},undo(){const last=history.pop();if(!last)return false;values[last[0]]=last[1];return true;}};}
export function createBoard(scene){
 const marks=createMarks(),values=marks.values,clues=Object.assign({},...data.regions.map(r=>r.clues));
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1536;const ctx=canvas.getContext('2d'),size=64;
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
 const material=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,toneMapped:false});
 const mesh=new T.Mesh(new T.PlaneGeometry(MAP.width*BOARD.width,MAP.height*BOARD.height),material);mesh.rotation.x=-Math.PI/2;mesh.position.set(0,MAP.y+.035,(BOARD.v+BOARD.height/2-.5)*MAP.height);mesh.renderOrder=3;scene.add(mesh);
 let hovered=null;
 function draw(){
  ctx.clearRect(0,0,2048,1536);
  for(let i=0;i<values.length;i++){const x=i%32*size,y=Math.floor(i/32)*size;
   ctx.fillStyle=values[i]===1?'rgba(233,190,99,.88)':values[i]===0?'rgba(17,44,44,.93)':'rgba(242,233,209,.54)';ctx.fillRect(x+.5,y+.5,size-1,size-1);
   ctx.strokeStyle='rgba(62,61,49,.38)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,size-1,size-1);
   if(clues[i]!==undefined){ctx.fillStyle=values[i]===0?'#f3e5c6':'#29342e';ctx.font='600 33px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(clues[i]),x+32,y+33);}
   const r=data.regionMap[i];ctx.strokeStyle='rgba(35,45,38,.85)';ctx.lineWidth=3;ctx.beginPath();if(i%32===0||data.regionMap[i-1]!==r){ctx.moveTo(x,y);ctx.lineTo(x,y+64);}if(i<32||data.regionMap[i-32]!==r){ctx.moveTo(x,y);ctx.lineTo(x+64,y);}ctx.stroke();
  }
  ctx.strokeStyle='#aa8a4e';ctx.lineWidth=6;ctx.strokeRect(3,3,2042,1530);
  if(hovered!==null){ctx.strokeStyle='#f9d689';ctx.lineWidth=5;ctx.strokeRect(hovered%32*64+3,Math.floor(hovered/32)*64+3,58,58);}
  texture.needsUpdate=true;
 }
 draw();return {mesh,values,get opacity(){return material.opacity;},setOpacity(value){material.opacity=value;mesh.visible=value>.005;},hover(index){if(index!==hovered){hovered=index;draw();}},paint(index,value){const changed=marks.paint(index,value);if(changed)draw();return changed;},undo(){const changed=marks.undo();if(changed)draw();return changed;},description(index){return index===null?'':`第 ${Math.floor(index/32)+1} 行，第 ${index%32+1} 列${clues[index]===undefined?'':`，线索 ${clues[index]}`}，${values[index]===1?'亮格':values[index]===0?'暗格':'未标记'}`;}};
}
