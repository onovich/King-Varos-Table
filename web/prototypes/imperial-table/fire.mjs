import * as T from './vendor/three.module.min.js';
export function flamePower(time,seed,reduced){return reduced?1:1+Math.sin(time*7.1+seed)*.05+Math.sin(time*11.7+seed*2.3)*.035+Math.sin(time*3.3+seed)*.025;}
export function createFire(scene,x,z,index){
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:{value:0},seed:{value:index}},vertexShader:`varying vec2 uvFire;varying vec3 eyeNormal;varying vec3 eyeDirection;uniform float time;uniform float seed;
 void main(){uvFire=uv;vec3 p=position;p.x+=sin(time*4.1+seed+p.y*7.)*.09*p.y*p.y;vec4 eye=modelViewMatrix*vec4(p,1.);eyeNormal=normalize(normalMatrix*normal);eyeDirection=normalize(-eye.xyz);gl_Position=projectionMatrix*eye;}`,fragmentShader:`
 varying vec2 uvFire;varying vec3 eyeNormal;varying vec3 eyeDirection;
 void main(){float core=pow(abs(dot(normalize(eyeNormal),normalize(eyeDirection))),.65);vec3 color=mix(vec3(1.,.25,.025),vec3(1.,.93,.68),core);color=mix(vec3(.10,.24,.95),color,smoothstep(.02,.19,uvFire.y));gl_FragColor=vec4(color*1.5,.72+core*.28);}
 `});
 const shape=[[0,0],[.025,.018],[.052,.07],[.06,.13],[.038,.22],[.013,.30],[0,.36]];
 const flame=new T.Mesh(new T.LatheGeometry(shape.map(p=>new T.Vector2(...p)),32),material);flame.position.set(x,4.49,z);flame.renderOrder=2;scene.add(flame);
 const light=new T.PointLight('#ffb75f',30,10,2);light.position.set(x,4.61,z);scene.add(light);
 // Two cached cube shadows: static geometry need not be re-rendered every flame frame.
 if(index===0||index===4){light.castShadow=true;light.shadow.mapSize.set(512,512);light.shadow.camera.near=.08;light.shadow.camera.far=10;light.shadow.radius=2;light.shadow.bias=-.0002;light.shadow.normalBias=.018;light.shadow.autoUpdate=false;light.shadow.needsUpdate=true;}
 return {light,update(time,reduced,camera){const t=time*.001,p=flamePower(t,index,reduced);material.uniforms.time.value=reduced?0:t;flame.scale.y=.95+p*.05;light.intensity=30*p;}};
}
