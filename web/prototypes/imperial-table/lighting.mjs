import * as T from './vendor/three.module.min.js';
import {HDRLoader} from './vendor/HDRLoader.js';

export const TABLE_BAKE={width:12,depth:19,y:2.981};
export const HDR_Y_ROTATION=Math.PI/2;
export function tableBakeUV(x,z){return [x/TABLE_BAKE.width+.5,z/TABLE_BAKE.depth+.5];}

export async function createLighting(renderer,scene,baked=true,tableBake=true){
 const pmrem=new T.PMREMGenerator(renderer);let env,ao,indirect;
 try{
  if(baked){
   const tex=new T.TextureLoader();
   const resources=await Promise.all([
    new HDRLoader().loadAsync(new URL('./assets/baked-lighting/imperial-room-1k.hdr',import.meta.url).href),
    ...(tableBake?[tex.loadAsync(new URL('./assets/baked-lighting/table-ao.webp',import.meta.url).href),tex.loadAsync(new URL('./assets/baked-lighting/table-indirect.webp',import.meta.url).href)]:[]),
   ]);
   const hdr=resources[0];ao=resources[1];indirect=resources[2];
   hdr.mapping=T.EquirectangularReflectionMapping;
   try{env=pmrem.fromEquirectangular(hdr);}finally{hdr.dispose();}
   for(const map of [ao,indirect].filter(Boolean)){map.colorSpace=T.NoColorSpace;map.channel=1;map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());}
  }else{
   const room=new T.Scene();room.background=new T.Color('#41453d');
   for(const [x,y,z,w,h,c] of [[0,9,0,5,9,'#fff0d2'],[-9,3,-5,3,8,'#e4f2ff'],[8,4,4,2,9,'#ffd396'],[0,4,9,9,6,'#c8b68d']]){
    const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c,side:T.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);room.add(p);
   }
   env=pmrem.fromScene(room,.04);room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  }
 }finally{pmrem.dispose();}
 scene.environment=env.texture;scene.environmentIntensity=baked?.24:.24;
 // Blender windows land at u=.5 (+X in Three's atan(z,x) equirect mapping).
 // Rotate the environment +90 degrees so they illuminate world -Z, the rear wall.
 scene.environmentRotation.set(0,baked?HDR_Y_ROTATION:0,0);
 return {
  addTable(material){
   if(!baked||!tableBake)return;
   const geometry=new T.PlaneGeometry(TABLE_BAKE.width,TABLE_BAKE.depth);geometry.rotateX(-Math.PI/2);
   const uv=geometry.attributes.uv,pos=geometry.attributes.position;
   for(let i=0;i<uv.count;i++)uv.setXY(i,...tableBakeUV(pos.getX(i),pos.getZ(i)));
   geometry.setAttribute('uv1',uv.clone());
   const mat=material.clone();mat.aoMap=ao;mat.aoMapIntensity=.65;mat.lightMap=indirect;mat.lightMapIntensity=.16;
   const top=new T.Mesh(geometry,mat);top.position.y=TABLE_BAKE.y;top.receiveShadow=true;top.name='Baked tabletop lighting';scene.add(top);
  },
  dispose(){env.dispose();ao?.dispose();indirect?.dispose();}
 };
}
