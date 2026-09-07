/** Keep the live camera and hit testing in sync throughout a cancellable ease-out. */
export function createCameraMotion({read,write,finish,requestFrame=requestAnimationFrame,cancelFrame=cancelAnimationFrame,now=()=>performance.now()}){
  let frame=null;
  function cancel(){if(frame!==null){cancelFrame(frame);frame=null;}}
  function move(target,{duration=520,reducedMotion=false}={}){
    cancel();
    const from={...read()},start=now();
    if(reducedMotion){write(target);finish();return;}
    function tick(time){
      const progress=Math.min(1,Math.max(0,(time-start)/duration));
      const eased=1-(1-progress)**3;
      write(progress===1?target:Object.fromEntries(['x','y','scale'].map(k=>[k,from[k]+(target[k]-from[k])*eased])));
      if(progress<1)frame=requestFrame(tick);else{frame=null;finish();}
    }
    frame=requestFrame(tick);
  }
  return {move,cancel};
}
