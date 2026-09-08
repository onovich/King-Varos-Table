import * as T from './vendor/three.module.min.js';
import {bevelBox} from './craft.mjs?v=12';
export function addPalace(scene,m){
 const add=(g,mat,x,y,z)=>{const o=new T.Mesh(g,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;};
 const box=(w,h,d,mat,x,y,z)=>add(bevelBox(w,h,d),mat,x,y,z);
 const pale=new T.MeshStandardMaterial({color:'#817b67',roughness:.65}),red=m.cloth.clone();red.color.set('#8d2735');
 // Rear wall is architecture, without a second throne frame or floating textile.
 // Low stone dado with real panel joints; restrained upper plaster remains unpatterned.
 for(let i=0;i<13;i++)box(1.95,2.15,.18,pale,(i-6)*2,1.075,-21.38);
 box(26,.12,.25,pale,0,2.20,-21.30);
 // Repeated arches, layered wall panels and barrel-vault ribs establish scale.
 for(const side of [-1,1])for(const z of [-15,-7,1,9]){
  const x=side*12.28;
  box(.18,7.2,5.7,m.bronze,x,5,z);box(.22,6.8,5.3,pale,x-side*.12,5,z);box(.28,6.2,4.7,m.stone,x-side*.24,5,z);
  for(const edge of [-2.8,2.8])box(.35,12,.22,m.gold,x-side*.12,7.8,z+edge);
  const arch=add(new T.TorusGeometry(2.8,.14,10,48,Math.PI),m.gold,x-side*.25,11,z);arch.rotation.y=Math.PI/2;
 }
 for(const z of [-18,-10,-2,6]){const arch=add(new T.TorusGeometry(11.2,.15,10,72,Math.PI),m.bronze,0,14,z);arch.scale.y=.55;arch.name='ceiling-rib';}
 for(const y of [12.8,13.3,14])for(const x of [-12,12])box(.3,.22,43,m.gold,x,y,-4);
 // Bronze oil-lamp frame, carried by four diagonal suspension rods.
 const hub=new T.Vector3(0,18,-9.2);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,x=Math.cos(a)*2.4,z=-9.2+Math.sin(a)*2.4;
 const start=new T.Vector3(x,13.2,z),delta=hub.clone().sub(start);const rod=add(new T.CylinderGeometry(.035,.035,delta.length(),12),m.bronze,...start.clone().add(hub).multiplyScalar(.5).toArray());rod.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());}
 const frame=add(new T.TorusGeometry(2.4,.10,12,64),m.bronze,0,13.2,-9.2);frame.rotation.x=Math.PI/2;
 for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*2.4,z=-9.2+Math.sin(a)*2.4;add(new T.CylinderGeometry(.25,.12,.16,24),m.bronze,x,13.28,z);}
 const lamp=new T.PointLight('#ffc887',65,24,2);lamp.name='顶灯 · 青铜悬灯';lamp.position.set(0,13.6,-9.2);scene.add(lamp);
}
