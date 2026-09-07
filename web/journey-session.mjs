import {UNKNOWN, BRIGHT, DARK, deriveDirectSolution, clearIncorrectValues, findDirectClueHint} from './puzzle-logic.mjs';
import {createCampaignProgress, reconcileCampaignProgress, archiveStory, isEpilogueReady, archiveEpilogue,
  createSavePayload, restoreSavePayload, saveKeyForLevel, hasNarrativeCampaign} from './campaign-state.mjs';
import {createBoardHistory, commitBoardHistory, replaceBoardHistoryPresent, undoBoardHistory, redoBoardHistory} from './board-history.mjs';

export function validJourneyRun(run) { return typeof run==='string' && /^[a-zA-Z0-9-]{1,64}$/.test(run) ? run : ''; }
export function journeySaveKey(level,run='') { return `king-varos-table:journey:v1:${saveKeyForLevel(level)}${validJourneyRun(run)?`:run:${run}`:''}`; }

/** All game mutations cross this boundary; the DOM never owns puzzle/story progress. */
export function createJourneySession(level, options = {}) {
  const solution = deriveDirectSolution(level);
  if (!solution) throw new Error('This map cannot be completed with direct clues.');
  const ids = new Set(level.regions.map(r => r.id));
  const opening = ids.has(level.onboarding?.regionId) ? level.onboarding.regionId : level.regions[0].id;
  let values = Array(solution.length).fill(UNKNOWN);
  let campaign = createCampaignProgress();
  let activeRegionId = opening;
  let started = false;
  let guideSkipped = options.skipGuide === true || !level.onboarding;
  let practiceAcknowledged = false;
  let banquetEnded = false;
  let camera = null;
  let notes = [];
  let readNotes = [];
  let history;

  function completedIds() {
    return level.regions.filter(r => r.cells.every(i => values[i] === solution[i])).map(r => r.id);
  }
  function checkpoint() { return {values, campaign, narrative:{notes, readNotes, banquetEnded, practiceAcknowledged}}; }
  function addNote(id) { if (!notes.includes(id)) notes.push(id); }
  function guideActive() { return !guideSkipped && !campaign.revealedRegionIds.includes(opening); }
  function reconcile() {
    campaign = reconcileCampaignProgress(campaign, completedIds(), {queueStories: hasNarrativeCampaign(level)}).progress;
    for (const region of level.regions) {
      if (region.cells.filter(i => values[i] === solution[i]).length >= Math.ceil(region.cells.length / 2)) addNote(`half:${region.id}`);
    }
  }
  function validNote(id) {
    if (typeof id !== 'string') return false;
    const [kind, number] = id.split(':');
    return ['arrival','half'].includes(kind) ? ids.has(Number(number)) : kind === 'banquet' && Number.isInteger(Number(number)) && Number(number) >= 0 && Number(number) <= level.regions.length;
  }
  function restore() {
    let saved = null;
    try { saved = typeof options.saved === 'string' ? JSON.parse(options.saved) : options.saved; } catch { /* Invalid save stays untouched in storage. */ }
    let board = saved?.version === 1 && saved.mapKey === saveKeyForLevel(level) ? restoreSavePayload(level, saved.board) : null;
    const restoredJourney = Boolean(board);
    if (!board && options.legacyProgress) {
      try { board = restoreSavePayload(level, createSavePayload(level, options.legacyProgress.values, options.legacyProgress.campaign)); } catch { /* Invalid legacy data is not imported. */ }
    }
    if (!board) return;
    if (board.campaign.completedRegionIds.some(id => !level.regions.find(r => r.id === id).cells.every(i => board.values[i] === solution[i]))) return;
    values = board.values;
    campaign = board.campaign;
    started = restoredJourney ? saved.started !== false : true;
    if (restoredJourney) {
      guideSkipped ||= saved.guideSkipped === true;
      if (ids.has(saved.activeRegionId)) activeRegionId = saved.activeRegionId;
      practiceAcknowledged = saved.practiceAcknowledged === true;
      banquetEnded = saved.banquetEnded === true;
      notes = Array.isArray(saved.notes) ? [...new Set(saved.notes.filter(validNote))] : [];
      readNotes = Array.isArray(saved.readNotes) ? saved.readNotes.filter(id => notes.includes(id)) : [];
      if (saved.camera && ['x','y','scale'].every(k => Number.isFinite(saved.camera[k]))) camera = {...saved.camera};
    }
    if (guideActive()) activeRegionId = opening;
    reconcile();
  }
  restore();
  history = createBoardHistory(checkpoint());

  function pendingEvent() {
    const regionId = campaign.pendingStoryRegionIds[0];
    if (regionId !== undefined) return {type:'fall', regionId};
    if (isEpilogueReady(level, campaign)) return {type:level.onboarding && !banquetEnded ? 'banquet-ending' : 'epilogue'};
    if (level.kind === 'tutorial' && completedIds().length === level.regions.length && !practiceAcknowledged) return {type:'practice'};
    return null;
  }
  function canEdit(index) {
    return started && !pendingEvent() && Number.isInteger(index) && index >= 0 && index < values.length
      && level.regionMap[index] === activeRegionId && !campaign.completedRegionIds.includes(activeRegionId)
      && (!guideActive() || activeRegionId === opening);
  }
  function commitValues(next) {
    if (next.every((v,i) => v === values[i])) return false;
    values = [...next];
    reconcile();
    history = commitBoardHistory(history, checkpoint());
    return true;
  }
  function restoreHistory(next) {
    if (next === history) return false;
    history = next;
    values = [...history.present.values];
    campaign = structuredClone(history.present.campaign);
    ({notes, readNotes, banquetEnded, practiceAcknowledged} = structuredClone(history.present.narrative));
    return true;
  }
  return {
    start() { started = true; addNote('banquet:0'); addNote(`arrival:${activeRegionId}`); history=replaceBoardHistoryPresent(history,checkpoint()); },
    getState() {
      return {values:[...values], campaign:structuredClone(campaign), activeRegionId, started,
        guideActive:guideActive(), guideSkipped, openingRegionId:opening, notes:[...notes], readNotes:[...readNotes],
        canUndo:history.past.length > 0, canRedo:history.future.length > 0, camera:camera ? {...camera} : null};
    },
    selectRegion(id) {
      if (!ids.has(id) || pendingEvent() || (guideActive() && id !== opening)) return false;
      activeRegionId = id;
      if (started) addNote(`arrival:${id}`);
      history=replaceBoardHistoryPresent(history,checkpoint());
      return true;
    },
    skipGuide() { guideSkipped = true; },
    canEdit,
    applyMarks(indices, value) {
      if (![UNKNOWN,BRIGHT,DARK].includes(value)) return false;
      const next = [...values];
      for (const index of new Set(indices)) if (canEdit(index)) next[index] = value;
      return commitValues(next);
    },
    hint() { return findDirectClueHint(level, level.regions.find(r => r.id === activeRegionId), values); },
    clearErrors() {
      if (pendingEvent()) return 0;
      const result = clearIncorrectValues(values, solution);
      commitValues(result.values);
      return result.removedIndices.length;
    },
    undo() { return pendingEvent() ? false : restoreHistory(undoBoardHistory(history)); },
    redo() { return pendingEvent() ? false : restoreHistory(redoBoardHistory(history)); },
    pendingEvent,
    acknowledgeEvent() {
      const event = pendingEvent();
      if (!event) return null;
      if (event.type === 'fall') {
        campaign = archiveStory(campaign, event.regionId);
        if (event.regionId === opening) guideSkipped = true;
        addNote(`banquet:${campaign.revealedRegionIds.length}`);
      } else if (event.type === 'banquet-ending') { banquetEnded = true; readNotes.push(`banquet:${level.regions.length}`); }
      else if (event.type === 'epilogue') campaign = archiveEpilogue(level, campaign);
      else practiceAcknowledged = true;
      history = replaceBoardHistoryPresent(history, checkpoint());
      return event;
    },
    readNote(id) {
      if (notes.includes(id) && !readNotes.includes(id)) {
        readNotes.push(id);history=replaceBoardHistoryPresent(history,checkpoint());
      }
    },
    setCamera(next) { if (next && ['x','y','scale'].every(k => Number.isFinite(next[k]))) camera = {...next}; },
    serialize() {
      return JSON.stringify({version:1, mapKey:saveKeyForLevel(level), board:createSavePayload(level,values,campaign),
        activeRegionId, started, guideSkipped, practiceAcknowledged, banquetEnded, camera, notes, readNotes});
    },
  };
}
