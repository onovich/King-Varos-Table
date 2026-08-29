const DEFAULT_HISTORY_LIMIT = 100;


function cloneCampaign(progress = {}) {
  return {
    completedRegionIds: [...(progress.completedRegionIds ?? [])],
    revealedRegionIds: [...(progress.revealedRegionIds ?? [])],
    pendingStoryRegionIds: [...(progress.pendingStoryRegionIds ?? [])],
    epilogueRevealed: progress.epilogueRevealed === true,
  };
}


export function cloneBoardSnapshot(snapshot) {
  return {
    values: [...snapshot.values],
    campaign: cloneCampaign(snapshot.campaign),
  };
}


function arraysEqual(left, right) {
  return left.length === right.length
    && left.every((value, index) => value === right[index]);
}


function snapshotsEqual(left, right) {
  return arraysEqual(left.values, right.values)
    && arraysEqual(left.campaign.completedRegionIds, right.campaign.completedRegionIds)
    && arraysEqual(left.campaign.revealedRegionIds, right.campaign.revealedRegionIds)
    && arraysEqual(left.campaign.pendingStoryRegionIds, right.campaign.pendingStoryRegionIds)
    && left.campaign.epilogueRevealed === right.campaign.epilogueRevealed;
}


export function createBoardHistory(snapshot, { limit = DEFAULT_HISTORY_LIMIT } = {}) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new TypeError("history limit must be a positive integer");
  }
  return {
    past: [],
    present: cloneBoardSnapshot(snapshot),
    future: [],
    limit,
  };
}


export function canUndoBoardHistory(history) {
  return history.past.length > 0;
}


export function canRedoBoardHistory(history) {
  return history.future.length > 0;
}


export function commitBoardHistory(history, snapshot) {
  const next = cloneBoardSnapshot(snapshot);
  if (snapshotsEqual(history.present, next)) return history;
  return {
    ...history,
    past: [...history.past, cloneBoardSnapshot(history.present)].slice(-history.limit),
    present: next,
    future: [],
  };
}


export function replaceBoardHistoryPresent(history, snapshot) {
  return {
    ...history,
    present: cloneBoardSnapshot(snapshot),
  };
}


export function undoBoardHistory(history) {
  if (!canUndoBoardHistory(history)) return history;
  const previous = history.past.at(-1);
  return {
    ...history,
    past: history.past.slice(0, -1),
    present: cloneBoardSnapshot(previous),
    future: [cloneBoardSnapshot(history.present), ...history.future],
  };
}


export function redoBoardHistory(history) {
  if (!canRedoBoardHistory(history)) return history;
  const [next, ...future] = history.future;
  return {
    ...history,
    past: [...history.past, cloneBoardSnapshot(history.present)].slice(-history.limit),
    present: cloneBoardSnapshot(next),
    future,
  };
}
