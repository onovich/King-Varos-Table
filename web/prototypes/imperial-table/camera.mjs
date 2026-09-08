import {regions,MAP,center,worldPoint} from './map-data.mjs?v=12';
export const overviewDistance=aspect=>Math.max(19,12/aspect);
export function cameraDestination(kind,id,aspect){
 if(kind==='banquet')return {position:aspect<.7?[8,21,32]:[10,13.5,26],target:[-1,5.4,-2.5]};
 const region=regions.find(r=>r.id===id),p=region?worldPoint(...center(region)):[0,MAP.y,0];
 const distance=region?Math.max(8,3.8/aspect):overviewDistance(aspect);
 return {position:[p[0],p[1]+distance*.97,p[2]+distance*.24],target:p};
}
