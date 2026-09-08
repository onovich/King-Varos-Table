import {setting} from './seat-layout.mjs';
import {chartV,CANDLES,candleSurface,paperRelief} from './atlas-layout.mjs?v=12';
import * as T from './vendor/three.module.min.js';
import {MAP} from './map-data.mjs?v=12';
import {createMaterials} from './materials.mjs?v=12';
import {bevelBox,addCraft} from './craft.mjs?v=12';
import {addScannedFood} from './scanned-food.mjs';
import {addPalace} from './palace.mjs?v=12';
import {createCandle} from './candle.mjs';
import {addHallDetail} from './hall-detail.mjs?v=12';
import {loadBlenderTableware} from './blender-tableware.mjs?v=12';
import {addFurniture} from './furniture.mjs?v=12';
import {createLighting} from './lighting.mjs?v=12';
export async function createScene(renderer,{blenderTableware=true,bakedLighting=true}={}){
 const scene=new T.Scene();scene.background=new T.Color('#14201e');scene.fog=new T.Fog('#14201e',32, 70);

 const lighting=await createLighting(renderer,scene,bakedLighting,blenderTableware);
 const material=(color,metalness=0,roughness=.65)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const mats=await createMaterials();const {bronze,gold,wood,stone,cloth,ivory,dark}=mats;
 function mesh(geometry,mat,x,y,z,parent=scene){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const box=(w,h,d,mat,x,y,z,parent)=>mesh(bevelBox(w,h,d),mat,x,y,z,parent);
 const cyl=(r1,r2,h,mat,x,y,z,parent,segments=40)=>mesh(new T.CylinderGeometry(r1,r2,h,segments),mat,x,y,z,parent);
 box(40,.3,54,stone,0,-.2,0);
 const tileMat=material('#455049',.12,.63);
 for(let x=-18;x<=18;x+=6)for(let z=-24;z<=24;z+=6)if(((x+18)/6+(z+24)/6)%2===0)box(5.94,.02,5.94,tileMat,x,-.035,z);
 box(1,23,52,stone,-13,11,-2);box(1,23,52,stone,13,11,-2);box(26,23,1,stone,0,11,-22);
 for(const x of [-10.5,10.5])for(const z of [-18,-10,-2,6,14]){
  cyl(.56,.72,14,stone,x,7,z);cyl(.85,.85,.35,bronze,x,.22,z);cyl(.78,.78,.25,bronze,x,13.9,z);
  box(1.85,.5,1.85,stone,x,14.3,z);box(.12,9,.12,bronze,x+(x>0?-.56:.56),7,z);
 }
 for(const x of [-7,0,7]){
  box(3.5,11,.12,new T.MeshStandardMaterial({color:'#627c86',emissive:'#a4bfd1',emissiveIntensity:.38,roughness:1}),x,10,-21.42);
  for(const edge of [-1.88,1.88])box(.25,11.6,.45,bronze,x+edge,10,-21.2);
  box(3.9,.3,.4,bronze,x,15.65,-21.2);box(3.9,.3,.4,bronze,x,4.4,-21.2);
  box(.12,11,.35,bronze,x,10,-21.1);box(3.5,.16,.35,bronze,x,10.2,-21.1);
 }
 for(const x of [-11.2,11.2]){box(.1,7,3.4,cloth,x,9,-6);box(.14,.17,3.6,gold,x,12.5,-6);box(.14,.17,3.6,gold,x,5.5,-6);}
 // Thick tabletop and a long, restrained crimson runner beneath the chart.
 box(12,.22,19,wood,0,2.865,0);box(12.06,.07,19.06,bronze,0,2.72,0);box(11.9,.08,18.9,wood,0,2.68,0);
 lighting.addTable(wood);
 for(const x of [-4.9,4.9])for(const z of [-7.7,7.7]){box(.75,2.5,.75,wood,x,1.2,z);box(.88,.18,.88,bronze,x,.35,z);}
 const fabric=new T.PlaneGeometry(3.1,19.15,24,96);fabric.rotateX(-Math.PI/2);
 for(let i=0;i<fabric.attributes.position.count;i++){const p=fabric.attributes.position,x=p.getX(i),z=p.getZ(i);p.setY(i,.018+Math.sin(x*8+z*.7)*.012*T.MathUtils.smoothstep(Math.abs(z),4.9,6));}fabric.computeVertexNormals();mesh(fabric,cloth,0,2.994,0);
 box(3.1,2.7,.04,cloth,0,1.62,9.59);box(3.1,2.7,.04,cloth,0,1.62,-9.59);
 for(const x of [-1.46,1.46])box(.035,.012,19.1,gold,x,3.016,0);
 // A physical chart is only background art; the gameplay UI is a separate plane.
 const texture=await new T.TextureLoader().loadAsync(new URL('./assets/sea-chart-v7.webp',import.meta.url).href);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
 const paperGeometry=new T.PlaneGeometry(MAP.width,MAP.height,64,80);
 for(let i=0;i<paperGeometry.attributes.position.count;i++){const p=paperGeometry.attributes.position,x=p.getX(i),y=p.getY(i),edge=Math.max(Math.abs(x)/(MAP.width/2),Math.abs(y)/(MAP.height/2));p.setZ(i,paperRelief(x,-y,MAP));}paperGeometry.computeVertexNormals();
 const uv=paperGeometry.attributes.uv;for(let i=0;i<uv.count;i++){const v=1-uv.getY(i);const mapped=chartV(v);uv.setY(i,1-mapped);}uv.needsUpdate=true;mats.paper.map=texture;
 const map=mesh(paperGeometry,mats.paper,0,MAP.y,0);map.rotation.x=-Math.PI/2;map.castShadow=false;
 for(const x of [-MAP.width/2-.055,MAP.width/2+.055])box(.11,.06,MAP.height+.22,bronze,x,3.033,0);
 for(const z of [-MAP.height/2-.055,MAP.height/2+.055])box(MAP.width+.22,.06,.11,bronze,0,3.033,z);
 function lathe(points,mat,x,y,z,parent){return mesh(new T.LatheGeometry(new T.SplineCurve(points.map(p=>new T.Vector2(...p))).getPoints(96),64),mat,x,y,z,parent);}
 function plate(x,z){const g=new T.Group();scene.add(g);g.position.set(x,3.01,z);lathe([[0,.03],[.6,.03],[.9,.07],[1,.15],[1.03,.18],[1.03,.22],[.88,.18],[.70,.09],[0,.08]],ivory,0,0,0,g);const rim=mesh(new T.TorusGeometry(.99,.025,8,64),gold,0,.19,0,g);rim.rotation.x=Math.PI/2;return g;}
 function goblet(x,z){if(!blenderTableware)lathe([[0,0],[.29,0],[.30,.055],[.09,.10],[.045,.45],[.20,.52],[.32,.75],[.32,.96],[.29,.97],[.28,.76],[.17,.56],[0,.54]],gold,x,3.02,z);const wine=new T.MeshPhysicalMaterial({color:'#541124',roughness:.08,metalness:0,ior:1.34,transmission:.2,thickness:.18,attenuationColor:new T.Color('#761121'),attenuationDistance:.2});const liquid=lathe([[0,0],[.23,0],[.263,.012],[.266,.024],[.25,.015],[0,.008]],wine,x,3.84,z);liquid.castShadow=false;}
 const fires=[];
 function candle(x,z){fires.push(createCandle(scene,mats,x,z,fires.length,MAP));}
 const seats=[[-4.75,-5.8],[-4.75,0],[-4.75,5.8],[4.75,-5.8],[4.75,0],[4.75,5.8],[0,-7.8]];
 seats.forEach(([x,z],i)=>{
  if(!blenderTableware)plate(x,z);goblet(...setting(x,z).cup);
  const layout=setting(x,z);
  for(const side of [-1,1]){const [px,pz]=layout.point(side*1.2,0);const group=new T.Group();group.position.set(px,3.055,pz);group.rotation.y=layout.angle;scene.add(group);
   box(.065,.045,.64,bronze,0,.025,.20,group);
   if(side<0){const spoon=mesh(new T.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI/2),bronze,0,.08,-.27,group);spoon.scale.set(.14,.065,.23);spoon.rotation.x=Math.PI;spoon.material.side=T.DoubleSide;}
   else box(.14,.035,.46,bronze,.025,.026,-.30,group);
  }

 });
 for(const [x,z] of CANDLES)candle(x,z);
 // A low fruit bowl at the near end leaves the entire chart unobstructed.
 lathe([[0,0],[.55,0],[.75,.18],[1.1,.37],[1.08,.43],[.72,.23],[0,.1]],bronze,0,3.01,7.1);

 if(blenderTableware){const place=await loadBlenderTableware(scene);seats.forEach(([x,z])=>place(x,z));}
 addCraft(scene,mats,{blenderTableware});addPalace(scene,mats);await addFurniture(scene,seats,mats);const hall=await addHallDetail(scene,mats);await addScannedFood(scene);
 const sun=new T.DirectionalLight('#d4e2ef',.38);sun.position.set(-9,20,-14);sun.target.position.set(0,2,1);sun.castShadow=true;sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-15,right:15,top:17,bottom:-17,near:1,far:55});sun.shadow.bias=-.0002;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
 scene.add(new T.HemisphereLight('#bacdd4','#302419',.10));
 const fill=new T.DirectionalLight('#c3dce3',.08);fill.position.set(12,9,10);scene.add(fill);
 return {scene,map,sun,fires,update(time,hover,selected,reduced,camera){hall.update(camera);fires.forEach(f=>f.update(time,reduced,camera));},dispose(){lighting.dispose();texture.dispose();}};
}
