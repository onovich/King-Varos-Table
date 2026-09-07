import * as T from './vendor/three.module.min.js';
import {bevelBox} from './craft.mjs';
export function addPalace(scene,m){
 const add=(g,mat,x,y,z)=>{const o=new T.Mesh(g,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;};
 const box=(w,h,d,mat,x,y,z)=>add(bevelBox(w,h,d),mat,x,y,z);
 const pale=new T.MeshStandardMaterial({color:'#817b67',roughness:.65}),red=m.cloth.clone();red.color.set('#8d2735');
 // A long central axis ends at a raised, canopied imperial seat.
 for(let i=0;i<4;i++)box(10-i*.7,.24,5.6-i*.48,pale,0,.12+i*.24,-17.1-i*.23);
 box(6.8,.03,11,red,0,.017,-10.8);
 const throne=new T.Group();throne.position.set(0,.99,-18.4);scene.add(throne);
 const part=(w,h,d,mat,x,y,z)=>{const o=new T.Mesh(bevelBox(w,h,d),mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;throne.add(o);return o;};
 part(3.8,.45,2.8,m.gold,0,1.5,0);part(3.2,.35,2.5,red,0,1.83,0);
 part(3.8,5.2,.35,m.gold,0,3.7,-1.2);part(3.28,4.6,.25,red,0,3.65,-.97);
 for(const x of [-1.75,1.75]){part(.19,6.9,.3,m.gold,x,3.5,-1.2);part(.3,.28,2.5,m.gold,x,2.75,.05);part(.2,1.7,.2,m.gold,x,.78,1.1);}
 // Abstract sunburst crest, with no historical dynasty insignia.
 const crest=add(new T.TorusGeometry(1.15,.12,12,64),m.gold,0,8.1,-19.45);
 for(let i=0;i<24;i++){const a=i*Math.PI/12;const ray=box(.065,i%2?.55:.85,.10,m.gold,Math.sin(a)*1.58,8.1+Math.cos(a)*1.58,-19.45);ray.rotation.z=-a;}
 for(const x of [-4.5,4.5]){add(new T.CylinderGeometry(.22,.32,13,32),m.gold,x,7.45,-19.2);add(new T.SphereGeometry(.35,24,16),m.gold,x,14.0,-19.2);}
 box(10,.48,4.8,m.gold,0,14.3,-18.4);box(9.7,.3,4.55,red,0,14.0,-18.4);
 // Heavy pleated drapery, framed by gold braid, instead of flat rectangles.
 function curtain(x,z,width,height){const g=new T.PlaneGeometry(width,height,40,60),p=g.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getY(i);p.setZ(i,Math.sin(u*8)*.20+Math.sin(u*16)*.045);p.setX(i,u+Math.sign(u)*.17*Math.sin((v/height+.5)*Math.PI));}g.computeVertexNormals();const fabric=add(g,red,x,14-height/2,z);fabric.material.side=T.DoubleSide;}
 curtain(-3.35,-19.0,2.2,11.6);curtain(3.35,-19.0,2.2,11.6);
 for(const x of [-3.35,3.35])box(2.25,.16,.18,m.gold,x,5.0,-18.69);
 // Repeated arches, layered wall panels and barrel-vault ribs establish scale.
 for(const side of [-1,1])for(const z of [-15,-7,1,9]){
  const x=side*12.28;
  box(.18,7.2,5.7,m.bronze,x,5,z);box(.22,6.8,5.3,pale,x-side*.12,5,z);box(.28,6.2,4.7,m.stone,x-side*.24,5,z);
  for(const edge of [-2.8,2.8])box(.35,12,.22,m.gold,x-side*.12,7.8,z+edge);
  const arch=add(new T.TorusGeometry(2.8,.14,10,48,Math.PI),m.gold,x-side*.25,11,z);arch.rotation.y=Math.PI/2;
 }
 for(const z of [-18,-10,-2,6]){const arch=add(new T.TorusGeometry(11.2,.15,10,72,Math.PI),m.bronze,0,14,z);arch.scale.y=.55;}
 for(const y of [12.8,13.3,14])for(const x of [-12,12])box(.3,.22,43,m.gold,x,y,-4);
 // A suspended ceremonial chandelier, high enough to leave the chart's sightline clear.
 for(const r of [2.2,3.2]){const ring=add(new T.TorusGeometry(r,.08,12,80),m.gold,0,13.2,-9.2);ring.rotation.x=Math.PI/2;}
 for(let i=0;i<16;i++){const a=i*Math.PI/8,x=Math.cos(a)*3.2,z=-9.2+Math.sin(a)*3.2;add(new T.CylinderGeometry(.07,.10,.65,12),m.ivory,x,13.5,z);const jewel=add(new T.OctahedronGeometry(.10),m.gold,x,12.9,z);jewel.scale.y=3;}
}
