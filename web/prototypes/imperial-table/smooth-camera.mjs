// A single frame-rate-independent controller for navigation and direct input.
export function createSmoothCamera(initial){
 let current=structuredClone(initial),target=structuredClone(initial);
 return {get current(){return structuredClone(current);},get target(){return structuredClone(target);},
 set(next){target=structuredClone(next);},
 step(seconds,tau=.12){const a=1-Math.exp(-Math.min(Math.max(seconds,0),.1)/tau);
  for(const key of ['position','target'])current[key]=current[key].map((v,i)=>Math.abs(target[key][i]-v)<1e-5?target[key][i]:v+(target[key][i]-v)*a);
  return structuredClone(current);
 }};
}
