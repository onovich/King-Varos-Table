/** Earned Pel chart: geometry comes exclusively from the completed board. */
export function createCoastChart(level,region,values,label) {
  const ns='http://www.w3.org/2000/svg';
  const node=(tag,attrs)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
  const xs=region.cells.map(i=>i%level.width),ys=region.cells.map(i=>Math.floor(i/level.width));
  const left=Math.min(...xs),top=Math.min(...ys),w=Math.max(...xs)-left+1,h=Math.max(...ys)-top+1;
  const svg=node('svg',{viewBox:`-1 -1 ${w+2} ${h+2}`,role:'img','aria-label':label,class:'coast-chart'});
  const land=new Set(region.cells.filter(i=>values[i]===1));
  const tiles=[],coast=[];
  for(const i of region.cells){
    const x=i%level.width-left,y=Math.floor(i/level.width)-top;
    if(land.has(i)){
      tiles.push(`M${x} ${y}h1v1h-1Z`);
      if(i%level.width===0 || !land.has(i-1))coast.push(`M${x} ${y}v1`);
      if(i%level.width===level.width-1 || !land.has(i+1))coast.push(`M${x+1} ${y}v1`);
      if(!land.has(i-level.width))coast.push(`M${x} ${y}h1`);
      if(!land.has(i+level.width))coast.push(`M${x} ${y+1}h1`);
    }else if((x+y)%3===0)svg.append(node('path',{d:`M${x+.2} ${y+.55}q.15 -.1 .3 0t.3 0`,class:'coast-water'}));
  }
  svg.append(node('path',{d:tiles.join(''),class:'coast-land'}));
  svg.append(node('path',{d:coast.join(''),class:'coast-edge'}));
  // An empty timber landing makes the absent boats visible without changing the earned silhouette.
  const shore=[...land].filter(i=>i%level.width===level.width-1 || !land.has(i+1)).sort((a,b)=>a-b);
  if(shore.length){
    const anchor=shore[Math.floor(shore.length*.65)],x=anchor%level.width-left+1,y=Math.floor(anchor/level.width)-top+.5;
    const pier=node('g',{class:'coast-pier',transform:`translate(${x} ${y})`});
    pier.append(node('path',{d:'M-.25 -.12H.78M-.25 .12H.78M.08 -.22V.22M.36 -.22V.22M.64 -.22V.22'}));
    pier.append(node('circle',{cx:.8,cy:.24,r:.06}));
    svg.append(pier);
  }
  return svg;
}
