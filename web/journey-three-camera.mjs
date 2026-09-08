import {CELL_SIZE} from './map-camera.mjs';
export function journeyCameraPose(level,logical,size,unit,paperY){
 const x=((size.width/2-logical.x)/(CELL_SIZE*logical.scale)-level.width/2)*unit;
 const z=((size.height/2-logical.y)/(CELL_SIZE*logical.scale)-level.height/2)*unit;
 const distance=Math.max(1.8,Math.min(65,size.height*unit/(2*Math.tan(35*Math.PI/360)*CELL_SIZE*logical.scale)));
 return {position:[x,paperY+distance,z+distance*.015],target:[x,paperY,z]};
}
export function worldCell(level,unit,x,z){
 const col=Math.floor(x/unit+level.width/2),row=Math.floor(z/unit+level.height/2);
 return col<0||row<0||col>=level.width||row>=level.height?null:row*level.width+col;
}
