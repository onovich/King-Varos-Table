import * as T from './vendor/three.module.min.js';
import {candleSurface} from './atlas-layout.mjs';
import {createFire} from './fire.mjs?v=12';
export function createCandle(scene,mats,x,z,index,map){
 const group=new T.Group();group.name=`candle-component-${index+1}`;scene.add(group);
 const surface=candleSurface(x,z,map),lift=surface-2.985;
 function add(name,geometry,material,y,dx=0,dz=0){const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.position.set(x+dx,y,z+dz);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}
 function cylinder(name,a,b,height,material,y){return add(name,new T.CylinderGeometry(a,b,height,40),material,y);}
 cylinder('foot',.31,.37,.09,mats.bronze,surface+.045);
 cylinder('stem',.07,.13,.85,mats.gold,3.47+lift);
 cylinder('drip-pan',.18,.12,.10,mats.bronze,3.91+lift);
 cylinder('wax',.105,.105,.52,mats.ivory,4.19+lift).castShadow=false;
 const lip=add('wax-lip',new T.TorusGeometry(.101,.013,8,32),mats.ivory,4.45+lift);lip.rotation.x=Math.PI/2;lip.castShadow=false;
 for(let k=0;k<3;k++){const a=k*2.1;const drip=add('wax-drip',new T.SphereGeometry(.023,10,12),mats.ivory,4.36+lift,Math.cos(a)*.102,Math.sin(a)*.102);drip.scale.y=2.5;drip.castShadow=false;}
 cylinder('wick',.008,.008,.08,mats.dark,4.48+lift);
 const fire=createFire(group,x,z,index,lift);return {...fire,group};
}
