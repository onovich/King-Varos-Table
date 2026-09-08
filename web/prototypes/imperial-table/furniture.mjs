import {GLTFLoader} from './vendor/GLTFLoader.js';
export async function addFurniture(scene,seats,mats=null){
 const {scene:source}=await new GLTFLoader().loadAsync(new URL('./assets/blender-furniture/imperial-chair.glb?v=12',import.meta.url).href);
 const surfaces=new Map();
 function finish(o){if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;if(!mats)return;
  const key=o.material.name;if(!surfaces.has(key)){let mat=o.material.clone();
   if(key==='Carved walnut'){mat=mats.wood.clone();mat.color.set('#d9c2a5');mat.roughness=.72;mat.normalScale.set(.18,.18);}
   if(key==='Oxblood upholstery'){mat=mats.cloth.clone();mat.color.set('#9b6b57');mat.bumpScale=.006;}
   surfaces.set(key,mat);
  }o.material=surfaces.get(key);
 }
 source.traverse(finish);
 function place(x,y,z,rotation,scale=1){const chair=source.clone(true);chair.name=scale===1?'banquet-chair':'imperial-throne';chair.position.set(x,y,z);chair.rotation.y=rotation;chair.scale.setScalar(scale);scene.add(chair);return chair;}
 for(const [x,z] of seats.filter(([x])=>x!==0))place(x===0?0:x<0?-7.1:7.1,0,x===0?-10.8:z,x===0?0:x<0?Math.PI/2:-Math.PI/2);
 const {scene:throne}=await new GLTFLoader().loadAsync(new URL('./assets/blender-furniture/imperial-throne.glb?v=12',import.meta.url).href);throne.name='imperial-throne';throne.position.set(0,0,-10.65);throne.traverse(finish);scene.add(throne);
}
