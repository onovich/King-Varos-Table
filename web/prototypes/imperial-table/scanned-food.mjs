import * as T from './vendor/three.module.min.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
export async function addScannedFood(scene){
 const loader=new GLTFLoader();
 const names=['food_apple_01','food_pomegranate_01','round-bread'];
 const assets=await Promise.all(names.map(name=>loader.loadAsync(new URL(name==='round-bread'?'./assets/blender-furniture/round-bread.glb':`./assets/${name}/model.gltf`,import.meta.url).href)));
 function place(kind,x,y,z,size,angle){
  const model=assets[names.indexOf(kind)].scene.clone(true),box=new T.Box3().setFromObject(model),dimensions=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
  const scale=size/Math.max(dimensions.x,dimensions.y,dimensions.z),holder=new T.Group();
  model.position.set(-center.x,-box.min.y,-center.z);holder.add(model);holder.scale.setScalar(scale);holder.position.set(x,y,z);holder.rotation.y=angle;
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const key of ['map','normalMap','roughnessMap'])if(o.material[key])o.material[key].anisotropy=8;}});scene.add(holder);
 }
 for(const [x,z,a] of [[-4.75,-5.8,.2],[-4.75,5.8,1.3],[4.75,0,-.4],[0,-7.8,.8]])place('round-bread',x,3.115,z,1.35,a);
 for(const [kind,x,y,z,size,a] of [
  ['food_apple_01',-.43,3.31,7.15,.64,.6],['food_apple_01',.18,3.30,7.35,.59,2.8],
  ['food_apple_01',.30,3.32,6.91,.62,-1.1],['food_pomegranate_01',-.12,3.4,6.86,.65,.4],
  ['food_pomegranate_01',-.13,3.63,7.22,.58,2.1],
 ])place(kind,x,y,z,size,a);
}
