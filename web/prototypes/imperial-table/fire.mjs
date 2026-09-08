import * as T from './vendor/three.module.min.js';
export function flamePower(time,seed,reduced){return reduced?1:1+Math.sin(time*5.7+seed*2.3)*.17+Math.sin(time*9.3+seed*1.7)*.07+Math.sin(time*2.1+seed)*.04;}
export function flameShape(time,seed,reduced){return reduced?{height:1,width:1,bend:0}:{height:1+Math.sin(time*4.3+seed)*.14+Math.sin(time*8.7+seed*2.1)*.06,width:1+Math.sin(time*6.1+seed*1.9)*.12,bend:Math.sin(time*3.7+seed)*.045+Math.sin(time*7.3+seed*2.7)*.014};}
export function createFire(scene,x,z,index,lift=0){
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{bend:{value:0},power:{value:1},emission:{value:1}},vertexShader:`varying vec2 uvFire;varying vec3 eyeNormal;varying vec3 eyeDirection;uniform float bend;
 void main(){uvFire=uv;vec3 p=position;float tip=pow(clamp(p.y/.36,0.,1.),1.7);p.x+=bend*tip;p.z+=bend*.45*tip;vec4 eye=modelViewMatrix*vec4(p,1.);eyeNormal=normalize(normalMatrix*normal);eyeDirection=normalize(-eye.xyz);gl_Position=projectionMatrix*eye;}`,fragmentShader:`
 varying vec2 uvFire;varying vec3 eyeNormal;varying vec3 eyeDirection;uniform float power;uniform float emission;
 void main(){float core=pow(abs(dot(normalize(eyeNormal),normalize(eyeDirection))),.65);vec3 color=mix(vec3(1.,.25,.025),vec3(1.,.93,.68),core);color=mix(vec3(.10,.19,.58),color,smoothstep(.02,.19,uvFire.y));gl_FragColor=vec4(color*(1.25+power*.25)*emission,(.70+core*.28)*min(1.,emission));}
 `});
 const shape=[[0,0],[.025,.018],[.052,.07],[.06,.13],[.038,.22],[.013,.30],[0,.36]];
 const flame=new T.Mesh(new T.LatheGeometry(shape.map(p=>new T.Vector2(...p)),32),material);flame.position.set(x,4.49+lift,z);flame.renderOrder=2;scene.add(flame);
 const light=new T.PointLight('#ffbf7a',52,13,2);light.position.set(x,4.61+lift,z);scene.add(light);

 light.castShadow=index<(innerWidthSafe()<700?1:2);light.shadow.needsUpdate=true;
 light.name=`烛光 ${index+1}`;
 const settings={intensity:72,amplitude:1,speed:1,wind:1,dynamic:true,enabled:true,emission:1};
 const origin=light.position.clone(),shadowPosition=origin.clone();let gust=0,last=0,shadowTime=0;
 light.shadow.mapSize.set(innerWidthSafe()<700?256:512,innerWidthSafe()<700?256:512);light.shadow.camera.near=.08;light.shadow.camera.far=13;light.shadow.bias=-.0002;light.shadow.normalBias=.018;light.shadow.autoUpdate=false;
 return {light,flame,settings,origin,gust(force){gust=Math.max(-.18,Math.min(.18,gust+force*settings.wind));},update(time,reduced){
 const dt=last?Math.min(.1,(time-last)/1000):0;last=time;gust*=Math.exp(-dt/ .20);
 const calm=reduced||!settings.dynamic,t=time*.001*settings.speed,p=(1+(flamePower(t,index,calm)-1)*settings.amplitude)*(calm?1:1-Math.min(.28,Math.abs(gust)*1.4)),s=flameShape(t,index,calm);
 const bend=s.bend+(calm?0:gust);material.uniforms.bend.value=bend;material.uniforms.power.value=p;material.uniforms.emission.value=settings.emission;flame.scale.set(s.width,s.height,s.width);flame.visible=settings.enabled;
 light.visible=settings.enabled;light.intensity=settings.intensity*p;light.position.copy(origin);light.position.x+=bend*.9;light.position.z+=bend*.45;light.position.y+=(s.height-1)*.13;
 if(light.castShadow&&light.position.distanceToSquared(shadowPosition)>1e-8&&time-shadowTime>1000/(innerWidthSafe()<700?10:15)){light.shadow.needsUpdate=true;shadowTime=time;shadowPosition.copy(light.position);}
 }};
}
function innerWidthSafe(){return typeof innerWidth==='number'?innerWidth:1440;}
