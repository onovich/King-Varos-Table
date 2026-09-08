import * as T from './vendor/three.module.min.js';
// Deterministic material microstructure; color, roughness and relief remain separate.
function surface(kind){
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d'),pixels=ctx.createImageData(512,512);
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const hash=Math.sin(x*127.1+y*311.7)*43758.5453,n=hash-Math.floor(hash),broad=Math.sin(x*.022+Math.sin(y*.009)*2.7),fine=Math.sin(x*.63+Math.sin(y*.023)*3);
  let rgb;
  if(kind==='wood'){const v=50+broad*9+fine*2+n*3;rgb=[v*1.2,v*.78,v*.46];}
  else if(kind==='stone'){const vein=Math.pow(Math.abs(Math.sin(x*.021+y*.018+Math.sin(x*.035)*1.1)),18),v=88+n*2+vein*6;rgb=[v*.82,v*.9,v*.86];}
  else if(kind==='cloth'){const weave=((x%3===0?1:0)+(y%3===0?1:0))*5,v=45+weave*.3+n*1.5;rgb=[v*1.35,v*.32,v*.41];}
  else {const v=170+n*24+broad*9;rgb=[v,v,v];}
  const i=(y*512+x)*4;pixels.data.set([...rgb,255],i);
 }ctx.putImageData(pixels,0,0);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=8;return map;
}
export async function createMaterials(){
 const loader=new T.TextureLoader();
 const [woodMap,woodNormal,woodRough]=await Promise.all(['wood-color.jpg','wood-normal.jpg','wood-roughness.jpg'].map(name=>loader.loadAsync(new URL('./assets/'+name,import.meta.url).href)));
 woodMap.colorSpace=T.SRGBColorSpace;for(const map of [woodMap,woodNormal,woodRough]){map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(1,1.5);map.anisotropy=8;}
 const stoneMap=surface('stone'),clothMap=surface('cloth'),micro=surface('micro');
 const physical=(p)=>new T.MeshPhysicalMaterial(p);
 const standard=(p)=>new T.MeshStandardMaterial(p);
 return {
  wood:standard({map:woodMap,normalMap:woodNormal,normalScale:new T.Vector2(.45,.45),roughnessMap:woodRough,color:'#a99a8c',roughness:.82,metalness:0}),
  stone:standard({map:stoneMap,roughness:.63,metalness:0,bumpMap:stoneMap,bumpScale:.018}),
  cloth:physical({map:clothMap,roughness:.94,sheen:.85,sheenColor:new T.Color('#922c34'),bumpMap:clothMap,bumpScale:.028}),
  gold:standard({color:'#c3a36c',metalness:1,roughness:.31,roughnessMap:micro,bumpMap:micro,bumpScale:.006}),
  bronze:standard({color:'#987344',metalness:.93,roughness:.37,roughnessMap:micro}),
  ivory:physical({color:'#e7e1cd',metalness:0,roughness:.17,clearcoat:1,clearcoatRoughness:.12}),
  dark:standard({color:'#152a24',roughness:.85,bumpMap:clothMap,bumpScale:.025}),
  glass:physical({color:'#eee8d7',metalness:0,roughness:.06,transmission:.94,thickness:.08,ior:1.46}),
  paper:standard({roughness:.94,bumpMap:micro,bumpScale:.008}),
 };
}
