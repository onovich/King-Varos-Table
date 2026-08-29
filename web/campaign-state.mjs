import { BRIGHT, DARK, UNKNOWN } from "./puzzle-logic.mjs";

export const SAVE_SCHEMA_VERSION = 3;
const SAVE_NAMESPACE = "king-varos-table:save";

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function levelFingerprint(level) {
  const savedData = JSON.stringify(canonicalize({
    schemaVersion: level.schemaVersion ?? null,
    width: level.width,
    height: level.height,
    campaign: level.campaign ?? {},
    regionMap: level.regionMap ?? [],
    regions: (level.regions ?? []).map((region) => ({
      id: region.id,
      name: region.name ?? "",
      accent: region.accent ?? "",
      cells: region.cells ?? [],
      clues: region.clues ?? {},
      country: region.country ?? {},
    })),
  }));
  let hash = 2166136261;
  for (let index = 0; index < savedData.length; index += 1) {
    hash ^= savedData.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function uniqueRegionIds(values) {
  return [...new Set(values)];
}

function normalizedProgress(progress = {}) {
  return {
    completedRegionIds: uniqueRegionIds(progress.completedRegionIds ?? []),
    revealedRegionIds: uniqueRegionIds(progress.revealedRegionIds ?? []),
    pendingStoryRegionIds: [...new Set(progress.pendingStoryRegionIds ?? [])],
    epilogueRevealed: progress.epilogueRevealed === true,
  };
}

export function createCampaignProgress() {
  return normalizedProgress();
}

export function hasNarrativeCampaign(level) {
  return (
    level?.kind !== "tutorial" &&
    Boolean(
      level?.campaign?.chapterId ||
      level?.campaign?.epilogue ||
      level?.campaign?.banquetTimeline?.length ||
      (level?.regions ?? []).some((region) => region.country?.fallCardBody),
    )
  );
}

export function reconcileCampaignProgress(
  progress,
  completedRegionIds,
  { queueStories = true } = {},
) {
  const previous = normalizedProgress(progress);
  const current = uniqueRegionIds(completedRegionIds);
  const previousCompleted = new Set(previous.completedRegionIds);
  const completed = uniqueRegionIds([...previous.completedRegionIds, ...current]);
  const revealed = new Set(previous.revealedRegionIds);
  const pending = new Set(
    previous.pendingStoryRegionIds.filter(
      (regionId) => !revealed.has(regionId),
    ),
  );
  const newlyCompletedRegionIds = current.filter((regionId) => !previousCompleted.has(regionId));

  for (const regionId of newlyCompletedRegionIds) {
    if (queueStories && !revealed.has(regionId)) pending.add(regionId);
  }

  if (!queueStories) pending.clear();

  return {
    newlyCompletedRegionIds,
    progress: {
      completedRegionIds: completed,
      revealedRegionIds: [...revealed],
      pendingStoryRegionIds: [...pending],
      epilogueRevealed: previous.epilogueRevealed,
    },
  };
}

export function isCampaignCompatibleWithBoard(progress, completedRegionIds) {
  const normalized = normalizedProgress(progress);
  const completedOnBoard = new Set(completedRegionIds);
  return normalized.completedRegionIds.every((regionId) => completedOnBoard.has(regionId));
}

export function nextPendingStory(progress) {
  return normalizedProgress(progress).pendingStoryRegionIds[0] ?? null;
}

export function archiveStory(progress, regionId) {
  const normalized = normalizedProgress(progress);
  if (!normalized.completedRegionIds.includes(regionId)) return normalized;

  return {
    completedRegionIds: normalized.completedRegionIds,
    revealedRegionIds: uniqueRegionIds([
      ...normalized.revealedRegionIds,
      regionId,
    ]),
    pendingStoryRegionIds: normalized.pendingStoryRegionIds.filter(
      (pendingRegionId) => pendingRegionId !== regionId,
    ),
    epilogueRevealed: normalized.epilogueRevealed,
  };
}

export function isEpilogueReady(level, progress) {
  const normalized = normalizedProgress(progress);
  const regionIds = (level.regions ?? []).map((region) => region.id);
  if (
    !level.campaign?.epilogue ||
    regionIds.length === 0 ||
    normalized.epilogueRevealed ||
    normalized.pendingStoryRegionIds.length > 0
  ) {
    return false;
  }

  const completed = new Set(normalized.completedRegionIds);
  const revealed = new Set(normalized.revealedRegionIds);
  return regionIds.every(
    (regionId) => completed.has(regionId) && revealed.has(regionId),
  );
}

export function archiveEpilogue(level, progress) {
  const normalized = normalizedProgress(progress);
  if (!isEpilogueReady(level, normalized)) return normalized;
  return { ...normalized, epilogueRevealed: true };
}

export function currentBanquetBeat(level, completedCountryCount) {
  const timeline = [...(level.campaign?.banquetTimeline ?? [])]
    .sort((left, right) => left.completedCountries - right.completedCountries);
  if (timeline.length === 0) return null;

  let current = timeline[0];
  for (const beat of timeline) {
    if (beat.completedCountries > completedCountryCount) break;
    current = beat;
  }
  return current;
}

export function saveKeyForLevel(level) {
  const chapterId = level.campaign?.chapterId ?? "standalone";
  return `${SAVE_NAMESPACE}:v${SAVE_SCHEMA_VERSION}:${chapterId}:${level.seed}:${levelFingerprint(level)}`;
}

function validCellValue(value) {
  return value === UNKNOWN || value === DARK || value === BRIGHT;
}

function levelIdentity(level) {
  return {
    seed: level.seed,
    width: level.width,
    height: level.height,
    chapterId: level.campaign?.chapterId ?? "standalone",
    fingerprint: levelFingerprint(level),
  };
}

function validRegionIds(level) {
  return new Set(level.regions.map((region) => region.id));
}

function isValidIdArray(values, validIds) {
  return (
    Array.isArray(values) &&
    values.every((value) => Number.isInteger(value) && validIds.has(value)) &&
    new Set(values).size === values.length
  );
}

export function createSavePayload(level, values, progress) {
  const expectedLength = level.width * level.height;
  if (
    !Array.isArray(values) ||
    values.length !== expectedLength ||
    !values.every(validCellValue)
  ) {
    throw new TypeError("values must match the level and contain only known cell states");
  }

  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    level: levelIdentity(level),
    values: [...values],
    campaign: normalizedProgress(progress),
  };
}

export function restoreSavePayload(level, serialized) {
  try {
    const payload = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
    if (!payload || payload.schemaVersion !== SAVE_SCHEMA_VERSION) return null;

    const identity = levelIdentity(level);
    if (
      payload.level?.seed !== identity.seed ||
      payload.level?.width !== identity.width ||
      payload.level?.height !== identity.height ||
      payload.level?.chapterId !== identity.chapterId ||
      payload.level?.fingerprint !== identity.fingerprint
    ) {
      return null;
    }

    const expectedLength = level.width * level.height;
    if (
      !Array.isArray(payload.values) ||
      payload.values.length !== expectedLength ||
      !payload.values.every(validCellValue)
    ) {
      return null;
    }

    const validIds = validRegionIds(level);
    const campaign = payload.campaign ?? {};
    if (
      !isValidIdArray(campaign.completedRegionIds, validIds) ||
      !isValidIdArray(campaign.revealedRegionIds, validIds) ||
      !isValidIdArray(campaign.pendingStoryRegionIds, validIds) ||
      typeof campaign.epilogueRevealed !== "boolean"
    ) {
      return null;
    }

    const completed = new Set(campaign.completedRegionIds);
    const revealed = new Set(campaign.revealedRegionIds);
    const pending = new Set(campaign.pendingStoryRegionIds);
    const narrative = hasNarrativeCampaign(level);
    if (
      campaign.revealedRegionIds.some((regionId) => !completed.has(regionId)) ||
      campaign.pendingStoryRegionIds.some(
        (regionId) => !completed.has(regionId) || revealed.has(regionId),
      ) ||
      (
        narrative &&
        campaign.completedRegionIds.some(
          (regionId) => !revealed.has(regionId) && !pending.has(regionId),
        )
      ) ||
      (
        !narrative &&
        (
          campaign.revealedRegionIds.length > 0 ||
          campaign.pendingStoryRegionIds.length > 0 ||
          campaign.epilogueRevealed
        )
      )
    ) {
      return null;
    }

    if (
      campaign.epilogueRevealed &&
      (
        !level.campaign?.epilogue ||
        campaign.pendingStoryRegionIds.length > 0 ||
        level.regions.some(
          (region) => !completed.has(region.id) || !revealed.has(region.id),
        )
      )
    ) {
      return null;
    }

    return {
      values: [...payload.values],
      campaign: normalizedProgress(campaign),
    };
  } catch {
    return null;
  }
}
