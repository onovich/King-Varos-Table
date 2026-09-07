export const easeOut=t=>1-(1-t)**3;
export const isClick=(distance,multiple)=>distance<=6&&!multiple;
export function createMotion(){let active=null;return {
 start(from,to,time,duration){active={from:structuredClone(from),to:structuredClone(to),time,duration};},
 cancel(){active=null;},get active(){return Boolean(active);},
 sample(time){if(!active)return null;const {from,to,duration}=active;const t=Math.min(1,Math.max(0,(time-active.time)/duration)),e=easeOut(t);
 const value={position:from.position.map((v,i)=>v+(to.position[i]-v)*e),target:from.target.map((v,i)=>v+(to.target[i]-v)*e)};
 if(t===1)active=null;return value;}
};}
