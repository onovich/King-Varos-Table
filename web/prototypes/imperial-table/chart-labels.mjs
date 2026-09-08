import * as T from './vendor/three.module.min.js';
import {MAP} from './map-data.mjs';
export function createChartLabels(scene,data,unit,buttons){
 const entries=data.regions.map((region,i)=>{
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const material=new T.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-2});
  const mesh=new T.Mesh(new T.PlaneGeometry(unit*6.0,unit*1.875),material);mesh.rotation.x=-Math.PI/2;mesh.receiveShadow=true;mesh.renderOrder=5;
  const cx=region.cells.reduce((a,c)=>a+c%data.width+.5,0)/region.cells.length,cy=region.cells.reduce((a,c)=>a+Math.floor(c/data.width)+.5,0)/region.cells.length;
  mesh.position.set((cx-data.width/2)*unit,MAP.y+.022,(cy-data.height/2)*unit);scene.add(mesh);
  return {canvas,texture,mesh,button:buttons[i],text:''};
 });
 return {update(visible,pixels=24){for(const e of entries){const button=e.button,name=button.firstChild?.textContent??'';if(name!==e.text){e.text=name;const ctx=e.canvas.getContext('2d');ctx.clearRect(0,0,512,160);ctx.font='600 74px Georgia, "Songti SC", SimSun, serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeStyle='#e8d4a7';ctx.lineWidth=3;ctx.strokeText(name,256,70,490);ctx.fillStyle='#100b06';ctx.fillText(name,256,70,490);ctx.strokeStyle='#866339';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(220,112);ctx.lineTo(292,112);ctx.stroke();e.texture.needsUpdate=true;}
   e.mesh.scale.setScalar(Math.max(.55,Math.min(2.3,(innerWidth<700?15:21)/(Math.max(1,pixels)*.867))));
   const decorated=visible&&!button.hidden&&!button.matches(':hover,:focus-visible');e.mesh.visible=decorated;e.mesh.material.opacity=button.disabled?.38:1;button.classList.toggle('has-world-label',decorated);
  }},dispose(){for(const e of entries){scene.remove(e.mesh);e.mesh.geometry.dispose();e.mesh.material.dispose();e.texture.dispose();e.button.classList.remove('has-world-label');}}};
}
