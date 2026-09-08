import {setting} from './seat-layout.mjs';
import {GLTFLoader} from './vendor/GLTFLoader.js';

// Optional comparison assets; cloned geometry/materials are shared by seven settings.
export async function loadBlenderTableware(scene){
 const loader=new GLTFLoader(),names=['charger','goblet','napkin'];
 const models=await Promise.all(names.map(name=>loader.loadAsync(new URL(`./assets/blender-tableware/${name}.glb`,import.meta.url).href)));
 return (x,z)=>{
  const layout=setting(x,z),[gx,gz]=layout.cup,[nx,nz]=layout.napkin;
  const placements=[[x,3.01,z,layout.angle],[gx,3.02,gz,layout.angle],[nx,3.05,nz,layout.angle]];
  models.forEach((asset,i)=>{
   const model=asset.scene.clone(true),[px,py,pz,angle]=placements[i];
   model.position.set(px,py,pz);model.rotation.y=angle;
   model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
   scene.add(model);
  });
 };
}
