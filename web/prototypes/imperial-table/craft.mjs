import * as T from './vendor/three.module.min.js';
export function bevelBox(w,h,d){
 const r=Math.min(.09,w*.12,h*.12,d*.12),shape=new T.Shape();shape.moveTo(-w/2+r,-h/2+r);shape.lineTo(w/2-r,-h/2+r);shape.lineTo(w/2-r,h/2-r);shape.lineTo(-w/2+r,h/2-r);shape.closePath();
 const g=new T.ExtrudeGeometry(shape,{depth:d-r*2,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:4});g.translate(0,0,-d/2+r);
 const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));uv.setXY(i,nx>ny&&nx>nz?p.getZ(i)/d+.5:p.getX(i)/w+.5,ny>nx&&ny>nz?p.getZ(i)/d+.5:p.getY(i)/h+.5);}return g;
}
export function addCraft(scene,m){
 const add=(g,mat,x,y,z)=>{const o=new T.Mesh(g,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;};
 const ring=(radius,tube,mat,x,y,z)=>{const o=add(new T.TorusGeometry(radius,tube,8,64),mat,x,y,z);o.rotation.x=Math.PI/2;return o;};
 const curve=(points,mat,r=.025)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,8,false),mat,0,0,0);
 // Carved table aprons, inset banding and carved volutes under the edges.
 for(const x of [-5.93,5.93]){
  for(const y of [2.18,2.31,2.64])add(bevelBox(.07,.055,18.6),m.gold,x,y,0);
  for(let z=-8;z<=8;z+=1.15){const o=add(new T.TorusGeometry(.22,.028,8,24,Math.PI),m.bronze,x,2.10,z);o.rotation.y=Math.PI/2;}
 }
 const seats=[[-4.75,-5.8],[-4.75,0],[-4.75,5.8],[4.75,-5.8],[4.75,0],[4.75,5.8],[0,-7.8]];
 for(const [x,z] of seats){
  // Two nested porcelain courses and a restrained engraved gilt rim.
  ring(.79,.013,m.gold,x,3.14,z);ring(.95,.012,m.bronze,x,3.22,z);
  for(let k=0;k<28;k++){const a=k/28*Math.PI*2;const leaf=add(new T.SphereGeometry(.027,8,6),m.gold,x+Math.cos(a)*.95,3.235,z+Math.sin(a)*.95);leaf.scale.set(.7,.22,1.7);leaf.rotation.y=-a;}
  // Fork tines and a shaped knife blade replace the impression of loose sticks.
  for(let k=0;k<4;k++)add(bevelBox(.023,.025,.23),m.gold,x-1.25+(k-1.5)*.042,3.11,z-.56);
  add(bevelBox(.19,.028,.44),m.gold,x+1.23,3.11,z-.37);
  const gx=x+(x<0?.7:-.7),gz=z-.85;
  for(const y of [3.08,3.48,3.77,3.97])ring(y<3.5?.22:.305,.014,m.gold,gx,y,gz);
  for(let k=0;k<12;k++){const a=k*Math.PI/6;curve([[gx+Math.cos(a)*.18,3.56,gz+Math.sin(a)*.18],[gx+Math.cos(a)*.28,3.76,gz+Math.sin(a)*.28],[gx+Math.cos(a)*.307,3.94,gz+Math.sin(a)*.307]],m.bronze,.009);}
  // Folded linen, caught by a metal napkin ring, beside each setting.
  const linen=add(bevelBox(.5,.13,.78),new T.MeshStandardMaterial({color:'#c7bb9c',roughness:1}),x+(x<0?1.18:-1.18),3.15,z+.8);linen.rotation.y=.25;
  const nr=add(new T.TorusGeometry(.19,.035,10,32),m.gold,linen.position.x,3.18,z+.8);nr.rotation.y=Math.PI/2;nr.scale.y=.65;
 }
 // Wax is imperfect: lip, rivulets and a tiny visible wick.
 for(const [x,z] of [[-4,-3],[4,-3],[-4,3],[4,3],[2.5,7.8]]){
  ring(.105,.016,m.ivory,x,4.45,z).castShadow=false;
  for(let k=0;k<4;k++){const a=k*1.7;const drip=add(new T.SphereGeometry(.026,8,10),m.ivory,x+Math.cos(a)*.101,4.33-(k%2)*.08,z+Math.sin(a)*.101);drip.scale.y=3.5;drip.castShadow=false;}
  add(new T.CylinderGeometry(.008,.008,.09,8),new T.MeshBasicMaterial({color:'#322317'}),x,4.46,z);
 }
 // Blown-glass decanter: a thin shell, amber liquid and metal lip.
 const vessel=[[0,0],[.35,0],[.46,.13],[.52,.55],[.40,.95],[.17,1.20],[.14,1.62],[.19,1.69],[.16,1.71],[.115,1.61],[.14,1.18],[.36,.93],[.47,.53],[.40,.12],[0,.07]];
 const profile=new T.SplineCurve(vessel.map(p=>new T.Vector2(...p))).getPoints(96);
 const bottle=add(new T.LatheGeometry(profile,64),m.glass,-2.3,3.015,7.65);bottle.castShadow=false;
 const liquidProfile=[[0,0],[.32,0],[.41,.09],[.46,.4],[.44,.53],[.42,.515],[0,.515]];const liquid=add(new T.LatheGeometry(liquidProfile.map(p=>new T.Vector2(...p)),64),new T.MeshPhysicalMaterial({color:'#7f241b',roughness:.06,transmission:.65,thickness:.5,ior:1.34,attenuationColor:new T.Color('#641508'),attenuationDistance:.45}),-2.3,3.10,7.65);liquid.castShadow=false;
 ring(.175,.018,m.gold,-2.3,4.68,7.65);
 // Reeded pillars and compound capitals catch the window light.
 for(const x of [-10.5,10.5])for(const z of [-18,-10,-2,6,14]){
  for(const [y,r] of [[.55,.78],[.75,.70],[13.4,.65],[13.6,.77],[13.85,.88]])ring(r,.055,m.bronze,x,y,z);
  for(let k=0;k<12;k++){const a=k*Math.PI/6;add(new T.CylinderGeometry(.037,.045,11.6,8),m.stone,x+Math.cos(a)*.58,7,z+Math.sin(a)*.58);}
 }
 // Recessed coffers and cornices add architectural depth beyond plain walls.
 for(const x of [-12.4,12.4])for(let y=4;y<=20;y+=4)add(bevelBox(.24,.22,46),m.bronze,x,y,-3);
 for(const x of [-7,0,7]){const arch=add(new T.TorusGeometry(1.84,.15,10,48,Math.PI),m.bronze,x,15.6,-21.05);for(let k=0;k<5;k++)add(bevelBox(3.35,.055,.15),m.bronze,x,6+k*1.85,-21.0);}
}
