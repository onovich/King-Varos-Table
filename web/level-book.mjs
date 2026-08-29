export const LEVEL_BOOK_SCHEMA_VERSION = 1;
const STORAGE_NAMESPACE = "king-varos-table:level-book";

export function levelEntries(manifest) {
  return (manifest?.chapters ?? []).flatMap((chapter) =>
    (chapter.levels ?? []).map((level) => ({ ...level, chapter })),
  );
}

export function levelEntryFor(manifest, levelId) {
  return levelEntries(manifest).find((entry) => entry.id === levelId) ?? null;
}

export function validateManifest(manifest) {
  if (!manifest || manifest.schemaVersion !== 1 || typeof manifest.bookId !== "string") {
    throw new TypeError("campaign manifest has an unsupported schema");
  }
  const entries = levelEntries(manifest);
  if (entries.length === 0) throw new TypeError("campaign manifest contains no levels");
  const ids = entries.map((entry) => entry.id);
  if (ids.some((id) => typeof id !== "string" || id.length === 0)) {
    throw new TypeError("every campaign level needs an id");
  }
  if (new Set(ids).size !== ids.length) throw new TypeError("campaign level ids must be unique");
  const knownIds = new Set(ids);
  for (const entry of entries) {
    if (typeof entry.source !== "string" || entry.source.length === 0) {
      throw new TypeError(`campaign level ${entry.id} needs a source`);
    }
    if (entry.unlockAfter !== null && entry.unlockAfter !== undefined && !knownIds.has(entry.unlockAfter)) {
      throw new TypeError(`campaign level ${entry.id} has an unknown prerequisite`);
    }
    if (entry.unlockAfter === entry.id) {
      throw new TypeError(`campaign level ${entry.id} cannot unlock itself`);
    }
  }
  return manifest;
}

export function saveKeyForLevelBook(manifest) {
  return `${STORAGE_NAMESPACE}:v${LEVEL_BOOK_SCHEMA_VERSION}:${manifest.bookId}`;
}

export function createLevelBookProgress(manifest) {
  const first = levelEntries(validateManifest(manifest))[0];
  return { completedLevelIds: [], lastLevelId: first.id };
}

function normalizedProgress(manifest, progress = {}) {
  const entries = levelEntries(manifest);
  const knownIds = new Set(entries.map((entry) => entry.id));
  const requestedCompleted = new Set(
    (progress.completedLevelIds ?? []).filter((id) => knownIds.has(id)),
  );
  const acceptedCompleted = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const entry of entries) {
      if (!requestedCompleted.has(entry.id) || acceptedCompleted.has(entry.id)) continue;
      if (
        entry.unlockAfter === null ||
        entry.unlockAfter === undefined ||
        acceptedCompleted.has(entry.unlockAfter)
      ) {
        acceptedCompleted.add(entry.id);
        changed = true;
      }
    }
  }
  const completedLevelIds = entries
    .map((entry) => entry.id)
    .filter((id) => acceptedCompleted.has(id));
  const candidateLast = knownIds.has(progress.lastLevelId) ? progress.lastLevelId : entries[0].id;
  return { completedLevelIds, lastLevelId: candidateLast };
}

export function isLevelUnlocked(manifest, progress, levelId) {
  const entry = levelEntryFor(manifest, levelId);
  if (!entry) return false;
  if (entry.unlockAfter === null || entry.unlockAfter === undefined) return true;
  return normalizedProgress(manifest, progress).completedLevelIds.includes(entry.unlockAfter);
}

export function firstPlayableLevelId(manifest, progress) {
  const normalized = normalizedProgress(manifest, progress);
  if (
    isLevelUnlocked(manifest, normalized, normalized.lastLevelId) &&
    !normalized.completedLevelIds.includes(normalized.lastLevelId)
  ) {
    return normalized.lastLevelId;
  }
  const entries = levelEntries(manifest);
  const nextIncomplete = entries.find(
    (entry) =>
      isLevelUnlocked(manifest, normalized, entry.id) &&
      !normalized.completedLevelIds.includes(entry.id),
  );
  if (nextIncomplete) return nextIncomplete.id;
  if (isLevelUnlocked(manifest, normalized, normalized.lastLevelId)) {
    return normalized.lastLevelId;
  }
  return entries.find((entry) => isLevelUnlocked(manifest, normalized, entry.id))?.id
    ?? entries[0].id;
}

export function selectLevel(manifest, progress, levelId) {
  const normalized = normalizedProgress(manifest, progress);
  if (!isLevelUnlocked(manifest, normalized, levelId)) return normalized;
  return { ...normalized, lastLevelId: levelId };
}

export function completeLevel(manifest, progress, levelId) {
  const normalized = normalizedProgress(manifest, progress);
  if (!isLevelUnlocked(manifest, normalized, levelId)) {
    return { progress: normalized, newlyCompleted: false, nextLevelId: null };
  }
  const newlyCompleted = !normalized.completedLevelIds.includes(levelId);
  const completedLevelIds = newlyCompleted
    ? [...normalized.completedLevelIds, levelId]
    : normalized.completedLevelIds;
  const nextProgress = { completedLevelIds, lastLevelId: levelId };
  const entries = levelEntries(manifest);
  const currentIndex = entries.findIndex((entry) => entry.id === levelId);
  const nextLevel = entries
    .slice(currentIndex + 1)
    .find((entry) => isLevelUnlocked(manifest, nextProgress, entry.id));
  return {
    progress: nextProgress,
    newlyCompleted,
    nextLevelId: nextLevel?.id ?? null,
  };
}

export function createLevelBookSave(manifest, progress) {
  const normalized = normalizedProgress(manifest, progress);
  return {
    schemaVersion: LEVEL_BOOK_SCHEMA_VERSION,
    bookId: manifest.bookId,
    ...normalized,
  };
}

export function restoreLevelBookProgress(manifest, serialized) {
  try {
    const payload = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
    if (
      !payload ||
      payload.schemaVersion !== LEVEL_BOOK_SCHEMA_VERSION ||
      payload.bookId !== manifest.bookId ||
      !Array.isArray(payload.completedLevelIds) ||
      typeof payload.lastLevelId !== "string"
    ) {
      return null;
    }
    return normalizedProgress(manifest, payload);
  } catch {
    return null;
  }
}
