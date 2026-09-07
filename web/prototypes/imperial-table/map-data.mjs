// Region identities plus a local, read-only snapshot of the real 2D board.
import {boardData} from './board-data.mjs';
export const regions=[
 {id:'loven',name:'洛汶低地',line:'河流穿过低地，通往遥远的粮仓。',color:'#afb7a0',points:[[.07,.10],[.37,.07],[.40,.30],[.31,.40],[.09,.35]]},
 {id:'aspa',name:'阿斯帕',line:'白色城阶，向内海层层展开。',color:'#c8b894',points:[[.37,.07],[.67,.10],[.66,.32],[.51,.39],[.40,.30]]},
 {id:'galan',name:'迦蓝岬',line:'岬角上的灯，照见航路的尽头。',color:'#aabac0',points:[[.67,.10],[.88,.16],[.94,.38],[.77,.45],[.66,.32]]},
 {id:'turan',name:'图兰河谷',line:'九道水湾，载着群山深处的来客。',color:'#bdad92',points:[[.09,.35],[.31,.40],[.43,.56],[.35,.72],[.11,.84],[.05,.60]]},
 {id:'melosa',name:'梅罗萨',line:'桥与桥之间，留着尚未讲完的往事。',color:'#b5a5a6',points:[[.31,.40],[.51,.39],[.66,.32],[.77,.45],[.69,.66],[.54,.76],[.35,.72],[.43,.56]]},
 {id:'urshan',name:'乌尔珊',line:'山口向南，王印的轮廓沉入暮色。',color:'#9eaaa0',points:[[.35,.72],[.54,.76],[.69,.66],[.83,.70],[.91,.89],[.61,.94],[.35,.90],[.11,.84]]},
 {id:'pel',name:'佩尔岛',line:'潮水漫过砾湾，海风先于宾客抵达。',color:'#cdbd9d',points:[[.82,.48],[.91,.49],[.95,.57],[.92,.65],[.84,.63],[.79,.57]]}
];
export const MAP={width:7.2,height:9.4,y:3.035};
export function center(region){const cells=boardData.regions[regions.indexOf(region)].cells;return cells.reduce((a,i)=>[a[0]+(.04+(i%32+.5)/32*.92)/cells.length,a[1]+(.236+(Math.floor(i/32)+.5)/24*.528)/cells.length],[0,0]);}
export function contains(points,u,v){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
 const [x,y]=points[i],[a,b]=points[j];if((y>v)!==(b>v)&&u<(a-x)*(v-y)/(b-y)+x)inside=!inside;}return inside;}
export function regionAt(u,v){const x=Math.floor((u-.04)/.92*32),y=Math.floor((v-.236)/.528*24);return x<0||y<0||x>=32||y>=24?null:regions[boardData.regionMap[y*32+x]];}
export function worldPoint(u,v){return [(u-.5)*MAP.width,MAP.y,(v-.5)*MAP.height];}
