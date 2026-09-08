// Local u follows the table edge; v points from the diner toward the chart.
export const SEATS=[[-4.75,-5.8],[-4.75,0],[-4.75,5.8],[4.75,-5.8],[4.75,0],[4.75,5.8],[0,-7.8]];
export function setting(x,z){const angle=x===0?Math.PI:x<0?-Math.PI/2:Math.PI/2;const point=(u,v)=>[x+Math.cos(angle)*u+Math.sin(angle)*v,z-Math.sin(angle)*u+Math.cos(angle)*v];return {angle,point,plate:point(0,0),cup:point(1.65,0),napkin:point(-1.62,0)};}
