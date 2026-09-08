// Paper coordinates shared by picking, board placement and the engraved texture.
export const BOARD={u:.04,v:.236,width:.92,height:.528};
export const CANDLES=[[-3.1,-3.4],[3.1,-3.4],[-3.1,3.4],[3.1,3.4],[2.5,7.8]];
export function chartV(v){return v<BOARD.v?v/BOARD.v*.21:v>BOARD.v+BOARD.height?.78+(v-BOARD.v-BOARD.height)/.236*.22:.21+(v-BOARD.v)/BOARD.height*.57;}
export function candleSurface(x,z,map){return Math.abs(x)+.37<map.width/2&&Math.abs(z)+.37<map.height/2?map.y:2.985;}
export function paperRelief(x,z,map){
 const smooth=(a,b,t)=>{const f=Math.max(0,Math.min(1,(t-a)/(b-a)));return f*f*(3-2*f);};
 const edge=Math.max(Math.abs(x)/(map.width/2),Math.abs(z)/(map.height/2));
 const clearance=Math.min(...CANDLES.map(([cx,cz])=>Math.hypot(x-cx,z-cz)));
 return smooth(.88,1,edge)*(.018+.012*Math.sin(x*3-z))*smooth(.48,.65,clearance);
}
