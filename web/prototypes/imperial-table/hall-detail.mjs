import * as T from './vendor/three.module.min.js';
import {bevelBox} from './craft.mjs?v=12';

export async function addHallDetail(scene,m){
 const ceiling=[];
 const ceilingPart=o=>{o.material=o.material.clone();o.material.transparent=true;o.material.depthWrite=false;o.castShadow=false;ceiling.push(o);return o;};
 scene.traverse(o=>{if(o.name==='ceiling-rib')ceilingPart(o);});
 const add=(g,mat,x,y,z)=>{const o=new T.Mesh(g,mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o;};
 const box=(w,h,d,mat,x,y,z)=>add(bevelBox(w,h,d),mat,x,y,z);
 const limestone=new T.MeshStandardMaterial({color:'#6f746b',roughness:.79});
 const inset=new T.MeshStandardMaterial({color:'#293a35',roughness:.55,metalness:.12});
 // A complete shallow barrel vault rather than unsupported decorative hoops.
 const vault=new T.CylinderGeometry(11.75,11.75,40,64,12,true,0,Math.PI);
 vault.rotateZ(Math.PI/2);vault.rotateY(Math.PI/2);
 const shell=ceilingPart(add(vault,limestone,0,14,-4));shell.scale.y=.55;shell.material.side=T.BackSide;
 // Repeated soffit coffers follow the vault, with restrained inset gilding.
 for(const z of [-18,-10,-2,6,14])for(let k=1;k<10;k++){
  const a=k*Math.PI/10,x=Math.cos(a)*11.55,y=14+Math.sin(a)*6.25;
  const p=ceilingPart(box(2.7,.12,6.7,inset,x,y,z));p.rotation.z=a-Math.PI/2;
  const medallion=ceilingPart(add(new T.TorusGeometry(.32,.026,6,24),m.bronze,x,y-.09,z));
  medallion.rotation.x=Math.PI/2;
 }
 // Pale plinths, vertical joints and darker dados bring walls out of silhouette.
 for(const side of [-1,1]){
  const x=side*12.42;
  box(.24,2.2,44,inset,x,1.1,-4);
  for(const y of [2.25,3.0,11.9])box(.32,.15,44,limestone,x-side*.13,y,-4);
  for(const z of [-19,-11,-3,5,13]){
   box(.40,9,.52,limestone,x-side*.22,7.1,z);
   box(.65,.24,1.05,m.bronze,x-side*.3,11.6,z);
  }
 }
 // Fine floor inlay sets a ceremonial approach to the dais.
 for(const x of [-5.2,5.2])box(.045,.012,14,m.bronze,x,.016,-10.4);
 for(const z of [-17.4,-15.8,-14.2])box(10.4,.012,.035,m.bronze,0,.018,z);
 // Former throne drapery removed: this is a dining room, not a second ceremonial seat.
 // Local, broad throne light. It adds readable relief, without another shadow map.
 const throneLight=new T.SpotLight('#ffdaa0',360,26,.65,.85,2);
 throneLight.position.set(0,13,-12);throneLight.target.position.set(0,4.5,-18.5);scene.add(throneLight,throneLight.target);
 return {update(camera){const alpha=ceilingOpacity(camera.position.y);for(const o of ceiling){o.visible=alpha>0;o.material.opacity=alpha;}}};
}

export function ceilingOpacity(cameraHeight){return 1-T.MathUtils.smoothstep(cameraHeight,14.5,18.5);}
