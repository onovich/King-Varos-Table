export const AUTO_SAVE_KEY='king-varos-table:autosave:v1';

export function readAutoSave(storage){
  try{
    const saved=JSON.parse(storage?.getItem(AUTO_SAVE_KEY)??'null');
    if(saved?.version!==1 || typeof saved.levelId!=='string' || typeof saved.payload!=='string')return null;
    const payload=JSON.parse(saved.payload);
    return payload?.version===1 && payload.started===true && payload.board ? saved : null;
  }catch{return null;}
}

export function writeAutoSave(storage,levelId,payload){
  if(!storage)throw new Error('Storage unavailable');
  // Write the replacement first: a quota error must not destroy the previous save.
  storage.setItem(AUTO_SAVE_KEY,JSON.stringify({version:1,levelId,payload}));
  const obsolete=[];
  for(let i=0;i<storage.length;i++){
    const key=storage.key(i);
    if(key?.startsWith('king-varos-table:journey:v1:') || key?.startsWith('king-varos-table:save:'))obsolete.push(key);
  }
  for(const key of obsolete)storage.removeItem(key);
}
