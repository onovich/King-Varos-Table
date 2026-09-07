import {createCoastChart} from './journey-reveal.mjs';
/** Native dialogs keep focus trapped; narrative reads never mutate puzzle marks. */
export function createJourneyDialogs({t, localize, level, session, onAcknowledge, onReadNote}) {
  const el=id=>document.getElementById(id);
  let currentEvent=null,readingReturn=null,storyReturn=null;
  function open(id) {
    for(const dialog of document.querySelectorAll('dialog[open]')) dialog.close();
    const dialog=el(id);dialog.showModal();
    const heading=dialog.querySelector('h2');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
    dialog.scrollTop=0;
  }
  function read(title, body, returnTo=el('menuDialog').open?()=>open('menuDialog'):null,returnLabel=t('backMenu')) {
    readingReturn=returnTo;
    el('readingBack').hidden=!returnTo;el('readingBack').textContent=returnLabel;
    el('readingTitle').textContent=title;
    el('readingBody').textContent=body;
    open('readingDialog');
  }
  function story(event, replay=false, returnTo=null) {
    storyReturn=returnTo;
    const data=level(), state=session().getState();
    const region=data.regions.find(r=>r.id===event.regionId);
    const country=region?.country;
    const epilogue=data.campaign?.epilogue;
    const ending=data.campaign?.banquetTimeline?.at(-1);
    currentEvent=replay ? null : event;
    el('storyKicker').textContent=t(event.type==='fall'?'fall':event.type==='epilogue'?'epilogue':event.type==='banquet-ending'?'banquetEnding':'complete');
    el('storyTitle').textContent=event.type==='fall' ? localize(country.fallCardTitle) : event.type==='epilogue' ? localize(epilogue.title) : event.type==='banquet-ending'?localize(ending.title):localize(data.title);
    el('storyPlace').textContent=country ? `${localize(region.name)} · ${localize(country.fallChronology)}` : '';
    el('storyBody').textContent=event.type==='fall'?localize(country.fallCardBody):event.type==='epilogue'?localize(epilogue.body):event.type==='banquet-ending'?localize(ending.body):t('endPractice');
    el('storyTrace').textContent=localize(country?.survivingTrace ?? (event.type==='epilogue'?epilogue?.survivingTrace:null));
    el('storyTrace').hidden=!el('storyTrace').textContent;
    el('storyReveal').textContent=country?`${localize(country.mapMotifName ?? country.mapMotif)} · ${localize(country.mapRevealConcept)}`:'';
    el('storyReveal').hidden=!el('storyReveal').textContent;
    el('completionDialog').querySelector('.coast-chart')?.remove();
    if(event.type==='fall' && data.onboarding && event.regionId===state.openingRegionId)
      el('storyReveal').before(createCoastChart(data,region,state.values,t('coastTitle')));
    el('storyContinue').textContent=t(returnTo?'backList':replay?'backMap':event.type==='practice'?'continue':state.guideActive?'finishOpening':'continue');
    open('completionDialog');
  }
  function acknowledge() {
    const event=currentEvent;currentEvent=null;
    el('completionDialog').close();
    const returnTo=storyReturn;storyReturn=null;
    if(event) onAcknowledge(event);else returnTo?.();
  }
  el('storyContinue').addEventListener('click',acknowledge);
  el('completionDialog').addEventListener('cancel',event=>{event.preventDefault();acknowledge();});
  function closeReading(){
    const returnTo=readingReturn;readingReturn=null;el('readingDialog').close();returnTo?.();
  }
  el('readingBack').addEventListener('click',closeReading);
  el('readingDialog').addEventListener('cancel',event=>{event.preventDefault();closeReading();});
  for(const button of document.querySelectorAll('.close-dialog')) button.addEventListener('click',()=>{
    const dialog=button.closest('dialog');if(dialog.id==='readingDialog')closeReading();else dialog.close();
  });
  function note(id) {
    const [kind,number]=id.split(':'),data=level();
    if(kind==='banquet') {
      const beat=data.campaign?.banquetTimeline?.find(b=>b.completedCountries===Number(number));
      return beat ? {title:`${t('banquet')} · ${localize(beat.title)}`,body:localize(beat.body)} : null;
    }
    const region=data.regions.find(r=>r.id===Number(number));
    const body=localize(region?.country?.[kind==='arrival'?'arrival':'halfway']);
    return body ? {title:`${localize(region.name)} · ${t(kind==='arrival'?'arrivalNote':'halfwayNote')}`,body} : null;
  }
  function archive(returnTo=el('menuDialog').open?()=>open('menuDialog'):null) {
    readingReturn=returnTo;el('readingBack').hidden=!returnTo;el('readingBack').textContent=t('backMenu');
    const state=session().getState();
    el('readingTitle').textContent=t('archive'); el('readingBody').replaceChildren();
    const addButton=(text,action)=>{const b=document.createElement('button');b.textContent=text;b.addEventListener('click',action);el('readingBody').append(b);};
    for(const id of state.notes) {const entry=note(id);if(entry) addButton(`${state.readNotes.includes(id)?'':t('newNote')+' · '}${entry.title}`,()=>{onReadNote(id);read(entry.title,entry.body,()=>archive(returnTo),t('backList'));});}
    for(const id of state.campaign.revealedRegionIds) {
      const region=level().regions.find(r=>r.id===id);
      addButton(`${t('records')} · ${localize(region.name)}`,()=>story({type:'fall',regionId:id},true,()=>archive(returnTo)));
    }
    if(state.campaign.epilogueRevealed) addButton(t('epilogue'),()=>story({type:'epilogue'},true,()=>archive(returnTo)));
    if(!el('readingBody').children.length) el('readingBody').textContent=t('noteEmpty');
    open('readingDialog');
  }
  function landscape(){
    const state=session().getState(),data=level(),region=data.regions.find(r=>r.id===state.openingRegionId);
    if(!data.onboarding || !state.campaign.completedRegionIds.includes(region.id))return;
    read(t('coastTitle'),t('coastCaption'));
    el('readingBody').prepend(createCoastChart(data,region,state.values,t('coastTitle')));
  }
  return {open,read,story,note,archive,landscape};
}
