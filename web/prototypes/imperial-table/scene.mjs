import * as T from './vendor/three.module.min.js';
import {MAP} from './map-data.mjs';
import {createMaterials} from './materials.mjs';
import {bevelBox,addCraft} from './craft.mjs';
import {addScannedFood} from './scanned-food.mjs';
import {addPalace} from './palace.mjs';
import {createFire} from './fire.mjs';
export async function createScene(renderer){
 const scene=new T.Scene();scene.background=new T.Color('#14201e');scene.fog=new T.Fog('#14201e',32, 70);

 const envScene=new T.Scene();envScene.background=new T.Color('#41453d');
 for(const [x,y,z,w,h,c] of [[0,9,0,5,9,'#fff0d2'],[-9,3,-5,3,8,'#e4f2ff'],[8,4,4,2,9,'#ffd396'],[0,4,9,9,6,'#c8b68d']]){
  const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c,side:T.DoubleSide}));mesh.position.set(x,y,z);mesh.lookAt(0,0,0);envScene.add(mesh);
 }
 const pmrem=new T.PMREMGenerator(renderer);const env=pmrem.fromScene(envScene,.04);scene.environment=env.texture;scene.environmentIntensity=.85;pmrem.dispose();
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
  box(3.5,11,.12,new T.MeshStandardMaterial({color:'#ddd7b5',emissive:'#afcbd0',emissiveIntensity:1.3,roughness:1}),x,10,-21.42);
  for(const edge of [-1.88,1.88])box(.25,11.6,.45,bronze,x+edge,10,-21.2);
  box(3.9,.3,.4,bronze,x,15.65,-21.2);box(3.9,.3,.4,bronze,x,4.4,-21.2);
  box(.12,11,.35,bronze,x,10,-21.1);box(3.5,.16,.35,bronze,x,10.2,-21.1);
 }
 for(const x of [-11.2,11.2]){box(.1,7,3.4,cloth,x,9,-6);box(.14,.17,3.6,gold,x,12.5,-6);box(.14,.17,3.6,gold,x,5.5,-6);}
 // Thick tabletop and a long, restrained crimson runner beneath the chart.
 box(12,.55,19,wood,0,2.7,0);box(12.06,.12,19.06,bronze,0,2.53,0);box(11.9,.12,18.9,wood,0,2.39,0);
 for(const x of [-4.9,4.9])for(const z of [-7.7,7.7]){box(.75,2.5,.75,wood,x,1.2,z);box(.88,.18,.88,bronze,x,.35,z);}
 const fabric=new T.PlaneGeometry(3.1,19.15,24,96);fabric.rotateX(-Math.PI/2);
 for(let i=0;i<fabric.attributes.position.count;i++){const p=fabric.attributes.position,x=p.getX(i),z=p.getZ(i);p.setY(i,.018+Math.sin(x*8+z*.7)*.012*T.MathUtils.smoothstep(Math.abs(z),4.9,6));}fabric.computeVertexNormals();mesh(fabric,cloth,0,2.994,0);
 box(3.1,2.7,.04,cloth,0,1.62,9.59);box(3.1,2.7,.04,cloth,0,1.62,-9.59);
 for(const x of [-1.46,1.46])box(.035,.012,19.1,gold,x,3.016,0);
 // A physical chart is only background art; the gameplay UI is a separate plane.
 const texture=await new T.TextureLoader().loadAsync('./assets/sea-chart.png');texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
 const paperGeometry=new T.PlaneGeometry(MAP.width,MAP.height,64,80);
 for(let i=0;i<paperGeometry.attributes.position.count;i++){const p=paperGeometry.attributes.position,x=p.getX(i),y=p.getY(i),edge=Math.max(Math.abs(x)/(MAP.width/2),Math.abs(y)/(MAP.height/2));p.setZ(i,T.MathUtils.smoothstep(edge,.88,1)*(.018+.012*Math.sin(x*3+y)));}paperGeometry.computeVertexNormals();mats.paper.map=texture;
 const map=mesh(paperGeometry,mats.paper,0,MAP.y,0);map.rotation.x=-Math.PI/2;map.castShadow=false;
 for(const x of [-MAP.width/2-.055,MAP.width/2+.055])box(.11,.06,MAP.height+.22,bronze,x,3.033,0);
 for(const z of [-MAP.height/2-.055,MAP.height/2+.055])box(MAP.width+.22,.06,.11,bronze,0,3.033,z);
 function lathe(points,mat,x,y,z,parent){return mesh(new T.LatheGeometry(new T.SplineCurve(points.map(p=>new T.Vector2(...p))).getPoints(96),64),mat,x,y,z,parent);}
 function plate(x,z){const g=new T.Group();scene.add(g);g.position.set(x,3.01,z);lathe([[0,.03],[.6,.03],[.9,.07],[1,.15],[1.03,.18],[1.03,.22],[.88,.18],[.70,.09],[0,.08]],ivory,0,0,0,g);const rim=mesh(new T.TorusGeometry(.99,.025,8,64),gold,0,.19,0,g);rim.rotation.x=Math.PI/2;return g;}
 function goblet(x,z){lathe([[0,0],[.29,0],[.30,.055],[.09,.10],[.045,.45],[.20,.52],[.32,.75],[.32,.96],[.29,.97],[.28,.76],[.17,.56],[0,.54]],gold,x,3.02,z);const wine=new T.MeshPhysicalMaterial({color:'#541124',roughness:.08,metalness:0,ior:1.34,transmission:.2,thickness:.18,attenuationColor:new T.Color('#761121'),attenuationDistance:.2});const liquid=lathe([[0,0],[.23,0],[.263,.012],[.266,.024],[.25,.015],[0,.008]],wine,x,3.84,z);liquid.castShadow=false;}
 const fires=[];
 function candle(x,z){cyl(.31,.37,.09,bronze,x,3.03,z);cyl(.07,.13,.85,gold,x,3.47,z);cyl(.18,.12,.10,bronze,x,3.91,z);const wax=cyl(.105,.105,.52,ivory,x,4.19,z);wax.castShadow=false;fires.push(createFire(scene,x,z,fires.length));}

 const seats=[[-4.75,-5.8],[-4.75,0],[-4.75,5.8],[4.75,-5.8],[4.75,0],[4.75,5.8],[0,-7.8]];
 seats.forEach(([x,z],i)=>{
  plate(x,z);goblet(x+(x<0?.7:-.7),z-.85);
  box(.11,.055,1.25,gold,x-1.25,3.065,z);box(.11,.055,1.25,bronze,x+1.25,3.065,z);
  const cx=x===0?0:x<0?-7.1:7.1,cz=x===0?-10.8:z;const chair=new T.Group();chair.position.set(cx,0,cz);chair.rotation.y=x===0?0:x<0?Math.PI/2:-Math.PI/2;scene.add(chair);
  box(1.9,.3,1.8,dark,0,1.55,0,chair);box(1.95,2.6,.24,wood,0,2.5,-.85,chair);box(1.55,2.15,.1,dark,0,2.5,-.7,chair);
  for(const a of [-.88,.88]){box(.1,3.8,.12,bronze,a,1.9,-.85,chair);box(.15,1.4,.15,wood,a,.7,.68,chair);}box(1.85,.1,.14,gold,0,3.8,-.85,chair);

 });
 for(const [x,z] of [[-4,-3],[4,-3],[-4,3],[4,3],[2.5,7.8]])candle(x,z);
 // A low fruit bowl at the near end leaves the entire chart unobstructed.
 lathe([[0,0],[.55,0],[.75,.18],[1.1,.37],[1.08,.43],[.72,.23],[0,.1]],bronze,0,3.01,7.1);

 addCraft(scene,mats);addPalace(scene,mats);await addScannedFood(scene);
 const sun=new T.DirectionalLight('#d4e2ef',1.45);sun.position.set(-9,20,-14);sun.target.position.set(0,2,1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-15,right:15,top:17,bottom:-17,near:1,far:55});sun.shadow.bias=-.0002;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
 scene.add(new T.HemisphereLight('#b8d2da','#3e2415',.36));
 const fill=new T.DirectionalLight('#c3dce3',.45);fill.position.set(12,9,10);scene.add(fill);
 return {scene,map,sun,update(time,hover,selected,reduced,camera){fires.forEach(f=>f.update(time,reduced,camera));},dispose(){env.dispose();texture.dispose();}};
}
