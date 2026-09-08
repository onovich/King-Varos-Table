const KEY='varos-lighting-v1';
export function validateLighting(value,defaults){
 if(value?.version!==1||!Array.isArray(value.sources)||value.sources.length!==defaults.sources.length)throw Error('配置版本或光源数量不匹配');
 const ids=new Set();
 for(const source of value.sources){const original=defaults.sources.find(x=>x.id===source.id);if(!original||ids.has(source.id))throw Error('未知或重复的光源 ID');ids.add(source.id);
  for(const [key,base] of Object.entries(original)){const v=source[key];if(typeof base==='number'&&(!Number.isFinite(v)||Math.abs(v)>10000))throw Error(`${source.id}: ${key} 数值无效`);if(typeof base==='boolean'&&typeof v!=='boolean')throw Error(`${key} 必须是开关`);if(key==='color'&&!/^#[0-9a-f]{6}$/i.test(v))throw Error('颜色必须为六位十六进制');}
  for(const key of ['intensity','distance','decay','amplitude','speed','wind','radius','normalBias'])if(source[key]<0)throw Error(`${key} 不能为负数`);
  for(const [key,max] of [['amplitude',3.5],['speed',20],['wind',10],['radius',16],['normalBias',1]])if(source[key]>max)throw Error(`${key} 超出范围（最大 ${max}）`);
  if(source.angle!==undefined&&(source.angle<=0||source.angle>Math.PI/2))throw Error('锥角必须在 0 到 π/2 之间');
  if(source.penumbra!==undefined&&(source.penumbra<0||source.penumbra>1))throw Error('柔边必须在 0 到 1 之间');
 }
 return {version:1,sources:defaults.sources.map(x=>structuredClone(value.sources.find(s=>s.id===x.id)))};
}
export function shadowBudget(width){return width<700?{count:1,size:256,hz:10}:{count:2,size:512,hz:15};}
export function crossingGust(previous,next,center){
 if(!previous||next.time-previous.time>150||next.time<=previous.time)return 0;
 const dx=next.x-previous.x,dy=next.y-previous.y,length=Math.hypot(dx,dy);if(length<2)return 0;
 const t=Math.max(0,Math.min(1,((center.x-previous.x)*dx+(center.y-previous.y)*dy)/(length*length)));
 if(Math.hypot(previous.x+t*dx-center.x,previous.y+t*dy-center.y)>35)return 0;
 return Math.sign(dx||dy)*Math.min(.12,length/(next.time-previous.time)*.055);
}
export function createLightEditor(stage,renderer,{onView=()=>{}}={}){
 const sources=[],bindings=[];let solo=null;
 stage.scene.traverse(object=>{if(!object.isLight)return;const fire=stage.fires.find(f=>f.light===object),id=fire?`candle-${stage.fires.indexOf(fire)+1}`:object===stage.sun?'window-main':object.isSpotLight?'throne':object.isHemisphereLight?'hemisphere':object.isPointLight?'overhead':'fill';
  const source={id,name:object.name||(object.isHemisphereLight?'半球填光':object.isSpotLight?'王座灯':object===stage.sun?'高窗主光':'侧向填光'),enabled:true,color:'#'+object.color.getHexString(),intensity:fire?fire.settings.intensity:object.intensity,x:object.position.x,y:object.position.y,z:object.position.z};
  if(object.target)Object.assign(source,{targetX:object.target.position.x,targetY:object.target.position.y,targetZ:object.target.position.z});
  for(const key of ['distance','decay','angle','penumbra'])if(typeof object[key]==='number')source[key]=object[key];
  if(object.shadow)Object.assign(source,{shadow:fire?stage.fires.indexOf(fire)<2:object.castShadow,bias:object.shadow.bias,normalBias:object.shadow.normalBias,radius:object.shadow.radius});
  if(fire)Object.assign(source,{amplitude:1,speed:1,wind:1,dynamic:!matchMedia('(prefers-reduced-motion: reduce)').matches});
  sources.push(source);bindings.push({object,fire});
 });
 for(const [id,name,intensity] of [['environment','HDR 环境反射',stage.scene.environmentIntensity],['baked','桌面烘焙间接光',.16],['emissive','窗面与发光材质',1]]){sources.push({id,name,enabled:true,intensity});bindings.push({});}
 const defaults=structuredClone({version:1,sources});let config=structuredClone(defaults);
 const emissives=[];stage.scene.traverse(o=>{if(o.material?.emissiveIntensity>0)emissives.push([o.material,o.material.emissiveIntensity]);});
 function apply(){let shadows=0;const budget=shadowBudget(innerWidth);
  config.sources.forEach((s,i)=>{const {object:o,fire}=bindings[i],enabled=s.enabled&&(!solo||solo===s.id);
   if(s.id==='environment')stage.scene.environmentIntensity=enabled?s.intensity:0;
   else if(s.id==='baked')stage.scene.traverse(n=>{if(n.material?.lightMap)n.material.lightMapIntensity=enabled?s.intensity:0;});
   else if(s.id==='emissive'){emissives.forEach(([m,base])=>m.emissiveIntensity=enabled?s.intensity*base:0);stage.fires.forEach(f=>f.settings.emission=s.enabled?s.intensity:0);}
   else {o.visible=enabled;o.color.set(s.color);o.intensity=s.intensity;o.position.set(s.x,s.y,s.z);if(o.target){o.target.position.set(s.targetX,s.targetY,s.targetZ);o.target.updateMatrixWorld();}
    for(const key of ['distance','decay','angle','penumbra'])if(s[key]!==undefined)o[key]=s[key];
    if(o.shadow){o.castShadow=s.shadow&&enabled&&(!fire||shadows++<budget.count);for(const key of ['bias','normalBias','radius'])o.shadow[key]=s[key];if(fire&&o.shadow.mapSize.x!==budget.size){o.shadow.mapSize.set(budget.size,budget.size);o.shadow.map?.dispose();o.shadow.map=null;}o.shadow.needsUpdate=true;}
    if(fire){Object.assign(fire.settings,{intensity:s.intensity,enabled,amplitude:s.amplitude,speed:s.speed,wind:s.wind,dynamic:s.dynamic});fire.origin.copy(o.position);}
   }
  });
 }
 const panel=document.createElement('dialog');panel.id='lightEditor';panel.className='light-editor';panel.setAttribute('aria-label','光影编辑');
 panel.innerHTML='<header><h2>光影编辑</h2><button data-action="close">关闭</button></header><p class="light-metrics" role="status"></p><nav><button data-view="banquet">宴席</button><button data-view="overview">全图</button><button data-view="focus">聚焦</button></nav><label>光源<select aria-label="光源"></select></label><label><input type="checkbox" data-solo>仅查看选中光源</label><div class="light-fields"></div><footer><button data-action="reset">恢复默认</button><button data-action="save">本地保存</button><button data-action="export">导出 JSON</button><label class="light-import">导入 JSON<input type="file" accept="application/json,.json"></label></footer><p class="light-error" role="alert"></p>';
 document.body.append(panel);const select=panel.querySelector('select'),fields=panel.querySelector('.light-fields'),error=panel.querySelector('.light-error');
 for(const s of sources){const option=document.createElement('option');option.value=s.id;option.textContent=s.name;select.append(option);}
 const labels={enabled:'开启',color:'颜色',intensity:'强度',x:'位置 X',y:'位置 Y',z:'位置 Z',targetX:'目标 X',targetY:'目标 Y',targetZ:'目标 Z',distance:'范围',decay:'衰减',angle:'锥角（弧度）',penumbra:'柔边',shadow:'阴影',bias:'阴影偏移',normalBias:'法线偏移',radius:'阴影柔度',amplitude:'闪烁幅度',speed:'闪烁速度',wind:'风感强度',dynamic:'持续动态与微风'};
 function draw(){fields.replaceChildren();const s=config.sources.find(s=>s.id===select.value);for(const [key,value] of Object.entries(s)){if(!labels[key])continue;const label=document.createElement('label');label.textContent=labels[key];const input=document.createElement('input');input.type=typeof value==='boolean'?'checkbox':key==='color'?'color':'number';input.step='any';if(input.type==='checkbox')input.checked=value;else input.value=value;input.oninput=()=>{const next=structuredClone(config),item=next.sources.find(x=>x.id===s.id);item[key]=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;try{config=validateLighting(next,defaults);apply();error.textContent='';}catch(e){error.textContent=e.message;}};label.append(input);fields.append(label);}}
 select.onchange=()=>{if(solo)solo=select.value;apply();draw();};panel.querySelector('[data-solo]').onchange=e=>{solo=e.target.checked?select.value:null;apply();};
 panel.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>onView(b.dataset.view));
 panel.querySelector('[data-action="close"]').onclick=()=>panel.close();panel.addEventListener('close',()=>{document.getElementById('markToolbar').inert=false;solo=null;panel.querySelector('[data-solo]').checked=false;apply();});
 panel.querySelector('[data-action="reset"]').onclick=()=>{config=structuredClone(defaults);apply();draw();error.textContent='已恢复默认（尚未保存）';};
 panel.querySelector('[data-action="save"]').onclick=()=>{try{localStorage.setItem(KEY,JSON.stringify(config));error.textContent='光影配置已保存';}catch(e){error.textContent='保存失败：'+e.message;}};
 panel.querySelector('[data-action="export"]').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(config,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='imperial-lighting-v1.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 panel.querySelector('input[type=file]').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>100000)throw Error('配置文件过大');const next=validateLighting(JSON.parse(await file.text()),defaults);config=next;apply();draw();error.textContent='已导入（尚未保存）';}catch(e){error.textContent='导入失败，原配置保留：'+e.message;}};
 try{const saved=localStorage.getItem(KEY);if(saved)config=validateLighting(JSON.parse(saved),defaults);}catch(e){error.textContent='保存的光影配置无法读取：'+e.message;}
 apply();draw();window.addEventListener('resize',apply);
 const button=document.createElement('button');button.textContent='光影编辑';button.id='lightEditorButton';button.hidden=true;document.querySelector('#menuDialog .menu-list').append(button);button.onclick=()=>{document.getElementById('menuDialog').close();document.getElementById('markToolbar').inert=true;panel.show();};
 return {panel,defaults,apply,setDynamic(value){config.sources.filter(s=>s.dynamic!==undefined).forEach(s=>s.dynamic=value);apply();draw();},update(fps){if(panel.open)panel.querySelector('.light-metrics').textContent=`${fps} FPS · ${renderer.info.render.calls} 次绘制 · ${stage.fires.filter(f=>f.light.castShadow&&f.light.visible).length} 盏动态阴影`;}};
}
