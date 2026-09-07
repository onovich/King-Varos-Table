import {CELL_SIZE, canEditAtScale, countryBounds} from './map-camera.mjs';

const colors = ['#d8cfac','#bacdce','#c3cfc0','#dcc2ae','#cec4d2','#bfc9ac','#dec8b7'];

export function createJourneyBoard(level, {board, labels, viewport, world, t, localize, onCountry}) {
  const cells = [], buttons = [];
  let focusIndex = level.regions[0].cells[0];
  board.replaceChildren(); labels.replaceChildren();
  board.style.gridTemplateColumns = `repeat(${level.width}, ${CELL_SIZE}px)`;
  board.setAttribute('aria-rowcount', level.height);
  board.setAttribute('aria-colcount', level.width);
  for (let row = 0; row < level.height; row++) {
    const line = document.createElement('div'); line.className = 'map-row'; line.setAttribute('role','row');
    for (let col = 0; col < level.width; col++) {
      const index = row * level.width + col, regionId = level.regionMap[index];
      const region = level.regions.find(r => r.id === regionId);
      const cell = document.createElement('div'); cell.className = 'map-cell'; cell.dataset.index = index;
      cell.setAttribute('role','gridcell'); cell.setAttribute('aria-rowindex',row+1); cell.setAttribute('aria-colindex',col+1);
      cell.style.setProperty('--country-color',colors[regionId % colors.length]);
      if (col === 0 || level.regionMap[index-1] !== regionId) cell.style.borderLeft = '3px solid var(--ink)';
      if (row === 0 || level.regionMap[index-level.width] !== regionId) cell.style.borderTop = '3px solid var(--ink)';
      if (col === level.width-1) cell.style.borderRight = '3px solid var(--ink)';
      if (row === level.height-1) cell.style.borderBottom = '3px solid var(--ink)';
      const number = document.createElement('span'); number.textContent = region.clues[index] ?? '';
      cell.append(number); line.append(cell); cells.push(cell);
    }
    board.append(line);
  }
  for (const region of level.regions) {
    const bounds = countryBounds(level,region.cells);
    const button = document.createElement('button'); button.className = 'country-label';
    button.style.left = `${(bounds.left+bounds.right)*CELL_SIZE/2}px`;
    button.style.top = `${(bounds.top+bounds.bottom)*CELL_SIZE/2}px`;
    button.addEventListener('click',() => onCountry(region.id));
    labels.append(button); buttons.push([region,button]);
  }
  return {
    render(state, hint = null, preview = null) {
      const values = preview ?? state.values, scope = new Set(hint?.scopeCells ?? []);
      if (level.regionMap[focusIndex] !== state.activeRegionId) focusIndex = level.regions.find(r => r.id === state.activeRegionId).cells[0];
      cells.forEach((cell,index) => {
        const region = level.regions.find(r => r.id === level.regionMap[index]);
        cell.dataset.value = values[index]; cell.tabIndex = index === focusIndex ? 0 : -1;
        cell.classList.toggle('is-inactive',region.id !== state.activeRegionId);
        cell.classList.toggle('is-complete',state.campaign.completedRegionIds.includes(region.id));
        cell.classList.toggle('is-hint-scope',scope.has(index));
        cell.classList.toggle('is-hint',index === hint?.clueIndex);
        cell.classList.toggle('is-conflict',hint?.status==='contradiction' && index===hint.clueIndex);
        cell.setAttribute('aria-readonly',String(state.campaign.completedRegionIds.includes(region.id)));
        cell.setAttribute('aria-label',t('cell',{country:localize(region.name),row:Math.floor(index/level.width)+1,column:index%level.width+1,
          clue:region.clues[index] === undefined ? t('noClue') : t('clue',{value:region.clues[index]}),
          state:t(values[index] === -1 ? 'unknown' : values[index] === 1 ? 'markedBright' : 'markedDark')})
          + (index === hint?.clueIndex ? t('hintCenter') : scope.has(index) ? t('hintScope') : ''));
      });
      for (const [region,button] of buttons) {
        button.replaceChildren(document.createTextNode(localize(region.name)));
        const small = document.createElement('small'), completed = state.campaign.completedRegionIds.includes(region.id);
        small.textContent = completed ? t('complete') : t('progress',{count:region.cells.filter(i=>values[i]!==-1).length,total:region.cells.length});
        button.append(small); button.classList.toggle('is-complete',completed);
        if(!completed && region.country?.mapMotif){
          const hook=document.createElement('span');hook.className='country-hook';
          hook.textContent=t('exploreMotif',{motif:localize(region.country.mapMotif)});button.append(hook);
        }
        button.disabled = state.guideActive && region.id !== state.openingRegionId;
      }
    },
    camera(camera) {
      world.style.transform = `translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;
      viewport.classList.toggle('is-overview',!canEditAtScale(camera.scale));
      for (const [,button] of buttons) button.style.transform = `translate(-50%,-50%) scale(${Math.min(1/camera.scale,viewport.clientWidth<=700?3.5:2.5)})`;
    },
    focus(index) {
      if (!cells[index]) return;
      cells[focusIndex].tabIndex = -1; focusIndex = index; cells[index].tabIndex = 0; cells[index].focus({preventScroll:true});
    },
  };
}
