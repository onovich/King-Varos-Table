import {
  BRIGHT,
  DARK,
  UNKNOWN,
  analyseRegion,
  clearIncorrectValues,
  deriveDirectSolution,
} from "./puzzle-logic.mjs";
import {
  archiveEpilogue,
  archiveStory,
  createCampaignProgress,
  createSavePayload,
  isCampaignCompatibleWithBoard,
  isEpilogueReady,
  nextPendingStory,
  reconcileCampaignProgress,
  restoreSavePayload,
  saveKeyForLevel,
} from "./campaign-state.mjs";
import {
  populateEpilogueDialog,
  populateFallDialog,
  renderArchiveList,
  renderBanquetPanel,
} from "./campaign-ui.mjs";
import {
  applyDocumentTranslations,
  createI18n,
  persistLocale,
  preferredLocale,
} from "./i18n.mjs";

const localeStorage = (() => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();
const browserLanguages = navigator.languages?.length
  ? navigator.languages
  : [navigator.language];
const i18n = createI18n(preferredLocale(localeStorage, browserLanguages));

const refs = {
  subtitle: document.querySelector("#levelSubtitle"),
  regionTabs: document.querySelector("#regionTabs"),
  board: document.querySelector("#board"),
  boardMessage: document.querySelector("#boardMessage"),
  statusNote: document.querySelector("#statusNote"),
  hintButton: document.querySelector("#hintButton"),
  checkButton: document.querySelector("#checkButton"),
  clearErrorsButton: document.querySelector("#clearErrorsButton"),
  resetButton: document.querySelector("#resetButton"),
  regionCount: document.querySelector("#regionCount"),
  cellCount: document.querySelector("#cellCount"),
  clueCount: document.querySelector("#clueCount"),
  proofStatus: document.querySelector("#proofStatus"),
  reasoningBadge: document.querySelector("#reasoningBadge"),
  progressLabel: document.querySelector("#progressLabel"),
  seedLabel: document.querySelector("#seedLabel"),
  banquetHeading: document.querySelector("#banquetHeading"),
  banquetBody: document.querySelector("#banquetBody"),
  banquetProgress: document.querySelector("#banquetProgress"),
  banquetInsert: document.querySelector("#banquetInsert"),
  archiveButton: document.querySelector("#archiveButton"),
  archiveButtonLabel: document.querySelector("#archiveButtonLabel"),
  archiveCount: document.querySelector("#archiveCount"),
  archiveDialog: document.querySelector("#archiveDialog"),
  archiveDialogClose: document.querySelector("#archiveDialogClose"),
  archiveEmpty: document.querySelector("#archiveEmpty"),
  archiveList: document.querySelector("#archiveList"),
  fallDialog: document.querySelector("#fallDialog"),
  fallDialogClose: document.querySelector("#fallDialogClose"),
  fallDialogConfirm: document.querySelector("#fallDialogConfirm"),
  fallCountry: document.querySelector("#fallCountry"),
  fallCardTitle: document.querySelector("#fallCardTitle"),
  fallPlace: document.querySelector("#fallPlace"),
  fallCardBody: document.querySelector("#fallCardBody"),
  fallSurvivingTrace: document.querySelector("#fallSurvivingTrace"),
  epilogueDialog: document.querySelector("#epilogueDialog"),
  epilogueDialogClose: document.querySelector("#epilogueDialogClose"),
  epilogueDialogConfirm: document.querySelector("#epilogueDialogConfirm"),
  epilogueEyebrow: document.querySelector("#epilogueEyebrow"),
  epilogueTitle: document.querySelector("#epilogueTitle"),
  epilogueBody: document.querySelector("#epilogueBody"),
  epilogueTrace: document.querySelector("#epilogueTrace"),
  languageOptions: [...document.querySelectorAll("[data-locale]")],
};

const state = {
  level: null,
  values: [],
  solution: null,
  clues: [],
  selectedRegion: null,
  hintIndex: null,
  hintScopeIndices: new Set(),
  conflictIndices: new Set(),
  campaign: createCampaignProgress(),
  saveKey: null,
  storyReturnFocus: null,
  activeStoryRegionId: null,
  archiveStoryOnClose: false,
  epilogueReturnFocus: null,
  archiveEpilogueOnClose: false,
  messages: new Map(),
};

function stateName(value) {
  if (value === BRIGHT) return "light";
  if (value === DARK) return "dark";
  return "unknown";
}

function valueLabel(value) {
  if (value === BRIGHT) return i18n.t("state.bright");
  if (value === DARK) return i18n.t("state.dark");
  return i18n.t("state.unknown");
}

function localizedMessage(key, params = {}) {
  return () => i18n.t(key, params);
}

function setMessage(element, renderer, tone = "neutral") {
  const renderText = typeof renderer === "function"
    ? renderer
    : localizedMessage(renderer);
  state.messages.set(element, { renderText, tone });
  element.textContent = renderText();
  element.dataset.tone = tone;
}

function renderMessages() {
  for (const [element, descriptor] of state.messages) {
    element.textContent = descriptor.renderText();
    element.dataset.tone = descriptor.tone;
  }
}

function showNarrativeDialog(dialog, initialFocus) {
  if (refs.archiveDialog.open) refs.archiveDialog.close();
  dialog.showModal();
  queueMicrotask(() => initialFocus.focus());
}

function wireDialogDismissControls(dialog, controls) {
  for (const control of controls) {
    control.addEventListener("click", () => dialog.close());
  }
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function readStoredProgress(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function persistProgress() {
  if (!state.level || !state.saveKey) return;
  try {
    const payload = createSavePayload(
      state.level,
      state.values,
      state.campaign,
    );
    window.localStorage.setItem(state.saveKey, JSON.stringify(payload));
  } catch (error) {
    console.warn("Could not persist chapter progress.", error);
  }
}

function removeStoredProgress() {
  if (!state.saveKey) return;
  try {
    window.localStorage.removeItem(state.saveKey);
  } catch (error) {
    console.warn("Could not remove chapter progress.", error);
  }
}

function renderCampaign() {
  if (!state.level) return;
  renderBanquetPanel(state.level, state.campaign, {
    heading: refs.banquetHeading,
    body: refs.banquetBody,
    progress: refs.banquetProgress,
    insert: refs.banquetInsert,
  }, i18n);
  renderArchiveList(
    state.level,
    state.campaign,
    {
      button: refs.archiveButton,
      buttonLabel: refs.archiveButtonLabel,
      count: refs.archiveCount,
      empty: refs.archiveEmpty,
      list: refs.archiveList,
    },
    openArchivedStory,
    openArchivedEpilogue,
    i18n,
  );
}

function completedRegionIdsFromAnalysis(analysis) {
  return analysis.results
    .filter(isRegionComplete)
    .map((item) => item.region.id);
}

function syncCampaignWithBoard(analysis) {
  const completedRegionIds = completedRegionIdsFromAnalysis(analysis);
  const transition = reconcileCampaignProgress(
    state.campaign,
    completedRegionIds,
  );
  state.campaign = transition.progress;
  return transition;
}

function openStoryDialog(
  regionId,
  returnFocus = refs.archiveButton,
  archiveOnClose = false,
) {
  if (
    !populateFallDialog(state.level, regionId, {
      country: refs.fallCountry,
      title: refs.fallCardTitle,
      place: refs.fallPlace,
      body: refs.fallCardBody,
      trace: refs.fallSurvivingTrace,
    }, i18n)
  ) {
    return;
  }

  state.storyReturnFocus = returnFocus;
  state.activeStoryRegionId = regionId;
  state.archiveStoryOnClose = archiveOnClose;
  refs.fallDialog.dataset.regionId = String(regionId);
  showNarrativeDialog(refs.fallDialog, refs.fallDialogClose);
}

function showNextPendingStory(returnFocus = refs.archiveButton) {
  if (refs.fallDialog.open) return;
  const regionId = nextPendingStory(state.campaign);
  if (regionId === null) return;
  openStoryDialog(regionId, returnFocus, true);
}

function openArchivedStory(regionId) {
  openStoryDialog(regionId, refs.archiveButton, false);
}

function openEpilogueDialog(
  returnFocus = refs.archiveButton,
  archiveOnClose = false,
) {
  if (
    !populateEpilogueDialog(state.level, {
      eyebrow: refs.epilogueEyebrow,
      title: refs.epilogueTitle,
      body: refs.epilogueBody,
      trace: refs.epilogueTrace,
    }, i18n)
  ) {
    return false;
  }

  state.epilogueReturnFocus = returnFocus;
  state.archiveEpilogueOnClose = archiveOnClose;
  showNarrativeDialog(refs.epilogueDialog, refs.epilogueDialogClose);
  return true;
}

function showEpilogueIfReady(returnFocus = refs.archiveButton) {
  if (
    refs.fallDialog.open ||
    refs.epilogueDialog.open ||
    !isEpilogueReady(state.level, state.campaign)
  ) {
    return false;
  }
  return openEpilogueDialog(returnFocus, true);
}

function openArchivedEpilogue() {
  openEpilogueDialog(refs.archiveButton, false);
}

function openArchive() {
  renderCampaign();
  refs.archiveDialog.showModal();
  queueMicrotask(() => refs.archiveDialogClose.focus());
}

function regionFor(index) {
  return state.level.regions.find((region) => region.id === state.level.regionMap[index]);
}

function analyseBoard() {
  const results = state.level.regions.map((region) => ({
    region,
    ...analyseRegion(state.level, region, state.values),
  }));
  const conflicts = new Set();
  const contradiction = results.find((item) => item.result.status === "contradiction");
  for (const item of results) {
    if (item.result.status === "contradiction") {
      item.region.cells.forEach((index) => conflicts.add(index));
    }
  }
  return {
    results,
    conflicts,
    contradiction,
  };
}

function regionName(region) {
  return i18n.localize(region?.name);
}

function contradictionMessage(analysis) {
  const contradiction = analysis.contradiction;
  if (!contradiction) return null;
  const detail = contradiction.result.messageKey
    ? i18n.t(
        contradiction.result.messageKey,
        contradiction.result.messageParams ?? {},
      )
    : i18n.t("message.conflictFallback");
  return i18n.t("logic.regionContradiction", {
    region: regionName(contradiction.region),
    detail,
  });
}

function edgeClasses(index) {
  const { width, height, regionMap } = state.level;
  const regionId = regionMap[index];
  const x = index % width;
  const y = Math.floor(index / width);
  const classes = [];
  if (y === 0 || regionMap[index - width] !== regionId) classes.push("edge-top");
  if (x === width - 1 || regionMap[index + 1] !== regionId) classes.push("edge-right");
  if (y === height - 1 || regionMap[index + width] !== regionId) classes.push("edge-bottom");
  if (x === 0 || regionMap[index - 1] !== regionId) classes.push("edge-left");
  return classes;
}

function isRegionComplete(item) {
  return (
    item.result.status === "solved" &&
    item.region.cells.every((globalIndex) => state.values[globalIndex] !== UNKNOWN)
  );
}

function nextStepFor(item) {
  return item?.directHint?.status === "ok" ? item.directHint : null;
}

function hintItems(analysis) {
  if (state.selectedRegion === null) return analysis.results;
  return analysis.results.filter((item) => item.region.id === state.selectedRegion);
}

function compareHintCandidates(left, right) {
  if (left.step.dependsOnPlayerMarks !== right.step.dependsOnPlayerMarks) {
    return left.step.dependsOnPlayerMarks ? -1 : 1;
  }
  if (left.step.forcedCells.length !== right.step.forcedCells.length) {
    return left.step.forcedCells.length - right.step.forcedCells.length;
  }
  return left.item.region.id - right.item.region.id;
}

function hintCandidates(analysis) {
  return hintItems(analysis)
    .map((item) => {
      const step = nextStepFor(item);
      return step ? { item, step } : null;
    })
    .filter(Boolean);
}

function nextHintCandidate(analysis) {
  return hintCandidates(analysis)
    .sort(compareHintCandidates)[0] ?? null;
}

function coordinateFor(index) {
  const row = Math.floor(index / state.level.width) + 1;
  const column = (index % state.level.width) + 1;
  return i18n.t("coordinate.cell", { row, column });
}

function regionHasAdvancedReasoning(region) {
  return region.metrics?.reasoningLevel === "advanced" || region.metrics?.advancedSteps > 0;
}

function renderTabs(analysis = null) {
  const { regions } = state.level;
  refs.regionTabs.replaceChildren();
  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = "region-tab";
  allButton.setAttribute("role", "tab");
  allButton.setAttribute("aria-selected", String(state.selectedRegion === null));
  allButton.textContent = i18n.t("tabs.all");
  allButton.addEventListener("click", () => {
    state.selectedRegion = null;
    clearHint();
    renderAll();
  });
  refs.regionTabs.append(allButton);

  for (const region of regions) {
    const button = document.createElement("button");
    const item = analysis?.results.find((candidate) => candidate.region.id === region.id);
    const completed = state.campaign.completedRegionIds.includes(region.id);
    const advanced = regionHasAdvancedReasoning(region) || nextStepFor(item)?.reasoningLevel === "advanced";
    const suffix = item
      ? completed
        ? ` · ${i18n.t("tabs.completed")}`
        : advanced
          ? ` · ${i18n.t("tabs.advanced")}`
          : ""
      : "";
    button.type = "button";
    button.className = completed ? "region-tab is-complete" : "region-tab";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(state.selectedRegion === region.id));
    const dot = document.createElement("span");
    dot.className = "tab-dot";
    dot.setAttribute("aria-hidden", "true");
    button.append(dot, document.createTextNode(`${regionName(region)}${suffix}`));
    button.style.color = `var(--${region.accent})`;
    button.addEventListener("click", () => {
      state.selectedRegion = region.id;
      clearHint();
      renderAll();
    });
    refs.regionTabs.append(button);
  }
}

function renderBoard(focusIndex = null) {
  const { width, height, regionMap } = state.level;
  const activeIndex = focusIndex ?? document.activeElement?.dataset?.index;
  refs.board.style.setProperty("--columns", width);
  refs.board.setAttribute("aria-rowcount", height);
  refs.board.setAttribute("aria-colcount", width);
  refs.board.replaceChildren();

  for (let index = 0; index < width * height; index += 1) {
    const value = state.values[index];
    const region = regionFor(index);
    const clue = state.clues[index];
    const countryComplete = state.campaign.completedRegionIds.includes(region.id);
    const countryArchived = state.campaign.revealedRegionIds.includes(region.id);
    const x = index % width;
    const y = Math.floor(index / width);
    const button = document.createElement("button");
    button.type = "button";
    button.className = [
      "cell",
      `region-${region.accent}`,
      `state-${stateName(value)}`,
      clue === null ? "no-clue" : "has-clue",
      state.selectedRegion !== null && state.selectedRegion !== region.id ? "is-muted" : "",
      state.hintIndex === index ? "is-hint" : "",
      state.hintScopeIndices.has(index) ? "is-hint-scope" : "",
      state.conflictIndices.has(index) ? "is-conflict" : "",
      ...edgeClasses(index),
    ]
      .filter(Boolean)
      .join(" ");
    button.classList.toggle("is-country-complete", countryComplete);
    button.disabled = countryComplete;
    button.dataset.index = String(index);
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-rowindex", String(y + 1));
    button.setAttribute("aria-colindex", String(x + 1));
    const hintLabel = state.hintIndex === index
      ? i18n.t("cell.hintStrong")
      : state.hintScopeIndices.has(index)
        ? i18n.t("cell.hintScope")
        : "";
    const clueLabel = clue === null
      ? i18n.t("cell.noClue")
      : i18n.t("cell.clue", { clue });
    button.setAttribute(
      "aria-label",
      i18n.t("cell.aria", {
        region: regionName(region),
        row: y + 1,
        column: x + 1,
        clue: clueLabel,
        value: valueLabel(value),
        hint: hintLabel,
      }),
    );
    if (countryComplete) {
      button.setAttribute(
        "aria-label",
        i18n.t("cell.completedAria", {
          base: button.getAttribute("aria-label"),
          status: i18n.t(
            countryArchived ? "cell.countryArchived" : "cell.countryStoryOpen",
          ),
        }),
      );
    }

    const clueSpan = document.createElement("span");
    clueSpan.className = "clue";
    clueSpan.textContent = clue === null ? "·" : String(clue);
    clueSpan.setAttribute("aria-hidden", "true");
    button.append(clueSpan);

    if (!countryComplete) {
      button.addEventListener("click", (event) => {
        if (event.shiftKey) {
          setCell(index, state.values[index] === DARK ? UNKNOWN : DARK);
        } else {
          setCell(index, state.values[index] === BRIGHT ? UNKNOWN : BRIGHT);
        }
      });
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        setCell(index, state.values[index] === DARK ? UNKNOWN : DARK);
      });
    }
    refs.board.append(button);
  }

  if (activeIndex !== undefined && activeIndex !== null) {
    const focusTarget = refs.board.querySelector(`[data-index="${activeIndex}"]`);
    focusTarget?.focus({ preventScroll: true });
  }
}

function updateStats(analysis) {
  const placed = state.values.filter((value) => value !== UNKNOWN).length;
  const solved = state.campaign.completedRegionIds.length;
  const total = state.level.width * state.level.height;
  const clueCount = state.level.regions.reduce((sum, region) => sum + Object.keys(region.clues).length, 0);
  const nextStep = nextHintCandidate(analysis)?.step ?? null;
  refs.regionCount.textContent = String(state.level.regions.length);
  refs.cellCount.textContent = String(total);
  refs.clueCount.textContent = String(clueCount);
  refs.progressLabel.textContent = `${placed} / ${total}`;
  refs.proofStatus.textContent = i18n.t(
    solved === state.level.regions.length ? "proof.complete" : "proof.unique",
  );
  if (analysis.conflicts.size > 0) {
    refs.reasoningBadge.textContent = i18n.t("reasoning.conflict");
    refs.reasoningBadge.dataset.level = "waiting";
  } else if (solved === state.level.regions.length) {
    refs.reasoningBadge.textContent = i18n.t("reasoning.complete");
    refs.reasoningBadge.dataset.level = "complete";
  } else if (nextStep) {
    refs.reasoningBadge.textContent = i18n.t("reasoning.basic");
    refs.reasoningBadge.dataset.level = "basic";
  } else {
    refs.reasoningBadge.textContent = i18n.t("reasoning.stalled");
    refs.reasoningBadge.dataset.level = "waiting";
  }
}

function renderAll(focusIndex = null, analysis = null) {
  const currentAnalysis = analysis ?? analyseBoard();
  state.conflictIndices = currentAnalysis.conflicts;
  renderTabs(currentAnalysis);
  renderBoard(focusIndex);
  updateStats(currentAnalysis);
  renderCampaign();
}

function clearHint() {
  state.hintIndex = null;
  state.hintScopeIndices = new Set();
}

function setCell(index, value) {
  const region = regionFor(index);
  if (state.campaign.completedRegionIds.includes(region.id)) return;
  state.values[index] = value;
  clearHint();
  const analysis = analyseBoard();
  const transition = syncCampaignWithBoard(analysis);
  renderAll(index, analysis);
  persistProgress();
  if (analysis.conflicts.size > 0) {
    setMessage(
      refs.boardMessage,
      () => i18n.t("message.moveContradiction", {
        reason: contradictionMessage(analysis)
          ?? i18n.t("message.moveContradictionFallback"),
      }),
      "error",
    );
  } else if (transition.newlyCompletedRegionIds.length > 0) {
    const completedRegion = state.level.regions.find(
      (candidate) => candidate.id === transition.newlyCompletedRegionIds[0],
    );
    setMessage(
      refs.boardMessage,
      () => i18n.t("message.countryCompleted", {
        country: completedRegion
          ? regionName(completedRegion)
          : i18n.t("message.countryFallback"),
      }),
      "success",
    );
    queueMicrotask(() => showNextPendingStory(refs.archiveButton));
  } else {
    setMessage(refs.boardMessage, "message.recordUpdated", "neutral");
  }
}

function requestHint() {
  const analysis = analyseBoard();
  clearHint();
  if (analysis.conflicts.size > 0) {
    renderAll(null, analysis);
    setMessage(
      refs.statusNote,
      () => i18n.t("message.hintConflict", {
        reason: contradictionMessage(analysis)
          ?? i18n.t("message.boardConflictFallback"),
      }),
      "error",
    );
    setMessage(refs.boardMessage, "message.hintStopsAtConflict", "error");
    return;
  }

  const candidate = nextHintCandidate(analysis);
  if (candidate) {
    const { item, step } = candidate;
    state.hintIndex = step.clueIndex;
    state.hintScopeIndices = new Set(
      step.scopeCells.filter((index) => index !== step.clueIndex),
    );
    renderAll(null, analysis);
    setMessage(
      refs.statusNote,
      () => i18n.t("message.hintFound", {
        country: regionName(item.region),
        coordinate: coordinateFor(step.clueIndex),
        clue: step.clueValue,
      }),
      "success",
    );
    setMessage(
      refs.boardMessage,
      "message.hintScope",
      "neutral",
    );
    return;
  }

  const solved = analysis.results.every(isRegionComplete);
  if (solved) {
    clearHint();
    renderAll(null, analysis);
    setMessage(refs.statusNote, "message.pageSolved", "success");
    setMessage(refs.boardMessage, "message.allRegionsSolved", "success");
  } else {
    renderAll(null, analysis);
    setMessage(
      refs.statusNote,
      state.selectedRegion === null
        ? "message.noDirectBoard"
        : "message.noDirectRegion",
      "neutral",
    );
    setMessage(refs.boardMessage, "message.noAdvancedHint", "neutral");
  }
}

function checkBoard() {
  const analysis = analyseBoard();
  renderAll(null, analysis);
  persistProgress();
  if (analysis.conflicts.size > 0) {
    setMessage(
      refs.statusNote,
      () => i18n.t("message.checkConflict", {
        reason: contradictionMessage(analysis)
          ?? i18n.t("message.conflictFallback"),
      }),
      "error",
    );
    setMessage(refs.boardMessage, "message.returnUnknown", "error");
    return;
  }
  if (analysis.results.every(isRegionComplete)) {
    clearHint();
    renderAll(null, analysis);
    setMessage(refs.statusNote, "message.completed", "success");
    setMessage(refs.boardMessage, "message.mapRestored", "success");
    return;
  }
  const remaining = state.values.filter((value) => value === UNKNOWN).length;
  setMessage(
    refs.statusNote,
    localizedMessage("message.checkRemaining", { remaining }),
    "neutral",
  );
  setMessage(refs.boardMessage, "message.checkPassed", "neutral");
}

function clearErrors() {
  if (!state.solution) {
    setMessage(refs.statusNote, "message.cleanupUnavailable", "error");
    setMessage(refs.boardMessage, "message.boardUnchanged", "neutral");
    return;
  }

  const cleanup = clearIncorrectValues(state.values, state.solution);
  state.values = cleanup.values;
  clearHint();
  const analysis = analyseBoard();
  renderAll(null, analysis);
  persistProgress();

  if (cleanup.removedIndices.length > 0) {
    setMessage(
      refs.statusNote,
      localizedMessage("message.cleanupDone", {
        count: cleanup.removedIndices.length,
      }),
      "success",
    );
    setMessage(refs.boardMessage, "message.cleanupContinue", "success");
  } else {
    setMessage(refs.statusNote, "message.cleanupNone", "neutral");
    setMessage(refs.boardMessage, "message.noBoardChange", "neutral");
  }
}

function resetBoard() {
  state.values = new Array(state.level.width * state.level.height).fill(UNKNOWN);
  state.campaign = createCampaignProgress();
  state.activeStoryRegionId = null;
  state.archiveStoryOnClose = false;
  state.storyReturnFocus = null;
  state.epilogueReturnFocus = null;
  state.archiveEpilogueOnClose = false;
  clearHint();
  state.conflictIndices = new Set();
  if (refs.fallDialog.open) refs.fallDialog.close();
  if (refs.archiveDialog.open) refs.archiveDialog.close();
  if (refs.epilogueDialog.open) refs.epilogueDialog.close();
  removeStoredProgress();
  renderAll();
  setMessage(refs.statusNote, "message.reset", "neutral");
  setMessage(refs.boardMessage, "board.initial", "neutral");
}

function prepareLevel(level) {
  state.level = level;
  state.saveKey = saveKeyForLevel(level);
  const restored = restoreSavePayload(level, readStoredProgress(state.saveKey));
  const emptyValues = new Array(level.width * level.height).fill(UNKNOWN);
  state.values = restored?.values ?? emptyValues;
  state.campaign = restored?.campaign ?? createCampaignProgress();
  state.solution = deriveDirectSolution(level);
  state.clues = new Array(level.width * level.height).fill(null);
  for (const region of level.regions) {
    for (const [rawIndex, clue] of Object.entries(region.clues)) {
      state.clues[Number(rawIndex)] = clue;
    }
  }
  state.selectedRegion = null;
  clearHint();
  state.conflictIndices = new Set();
  refs.clearErrorsButton.disabled = state.solution === null;
  refs.subtitle.textContent = i18n.localize(level.subtitle);
  refs.seedLabel.textContent = `SEED ${level.seed}`;
  let initialAnalysis = analyseBoard();
  if (
    restored &&
    !isCampaignCompatibleWithBoard(
      state.campaign,
      completedRegionIdsFromAnalysis(initialAnalysis),
    )
  ) {
    state.values = emptyValues;
    state.campaign = createCampaignProgress();
    removeStoredProgress();
    initialAnalysis = analyseBoard();
  }
  syncCampaignWithBoard(initialAnalysis);
  renderAll(null, initialAnalysis);
  persistProgress();
  if (state.campaign.pendingStoryRegionIds.length > 0) {
    queueMicrotask(() => showNextPendingStory(refs.archiveButton));
  } else if (isEpilogueReady(state.level, state.campaign)) {
    queueMicrotask(() => showEpilogueIfReady(refs.archiveButton));
  }
}

async function loadLevel() {
  try {
    const response = await fetch("./data/demo-level.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    prepareLevel(await response.json());
  } catch (error) {
    console.error(error);
    setMessage(refs.statusNote, "message.loadFailed", "error");
    setMessage(refs.boardMessage, "message.serveExample", "error");
  }
}

function updateLanguageSwitcher() {
  for (const option of refs.languageOptions) {
    const locale = option.dataset.locale;
    const labelKey = locale === "zh-CN" ? "language.zhCN" : "language.en";
    const label = i18n.t(labelKey);
    option.setAttribute("aria-pressed", String(locale === i18n.locale));
    option.setAttribute("aria-label", label);
    option.setAttribute("title", label);
  }
}

function renderOpenNarrative() {
  if (refs.fallDialog.open && state.activeStoryRegionId !== null) {
    populateFallDialog(state.level, state.activeStoryRegionId, {
      country: refs.fallCountry,
      title: refs.fallCardTitle,
      place: refs.fallPlace,
      body: refs.fallCardBody,
      trace: refs.fallSurvivingTrace,
    }, i18n);
  }
  if (refs.epilogueDialog.open) {
    populateEpilogueDialog(state.level, {
      eyebrow: refs.epilogueEyebrow,
      title: refs.epilogueTitle,
      body: refs.epilogueBody,
      trace: refs.epilogueTrace,
    }, i18n);
  }
}

function applyLocale() {
  applyDocumentTranslations(document, i18n);
  updateLanguageSwitcher();
  if (state.level) {
    refs.subtitle.textContent = i18n.localize(state.level.subtitle);
    renderAll();
    renderOpenNarrative();
  }
  renderMessages();
}

function chooseLocale(locale) {
  if (!i18n.setLocale(locale)) return;
  persistLocale(localeStorage, i18n.locale);
  applyLocale();
}

refs.hintButton.addEventListener("click", requestHint);
refs.checkButton.addEventListener("click", checkBoard);
refs.clearErrorsButton.addEventListener("click", clearErrors);
refs.resetButton.addEventListener("click", resetBoard);
refs.archiveButton.addEventListener("click", openArchive);
refs.archiveDialogClose.addEventListener("click", () => refs.archiveDialog.close());
refs.archiveDialog.addEventListener("click", (event) => {
  if (event.target === refs.archiveDialog) refs.archiveDialog.close();
});
for (const option of refs.languageOptions) {
  option.addEventListener("click", () => chooseLocale(option.dataset.locale));
}
wireDialogDismissControls(
  refs.fallDialog,
  [refs.fallDialogClose, refs.fallDialogConfirm],
);
refs.fallDialog.addEventListener("close", () => {
  if (state.archiveStoryOnClose && state.activeStoryRegionId !== null) {
    state.campaign = archiveStory(state.campaign, state.activeStoryRegionId);
    renderCampaign();
    persistProgress();
  }
  state.activeStoryRegionId = null;
  state.archiveStoryOnClose = false;
  const returnFocus = state.storyReturnFocus;
  state.storyReturnFocus = null;
  if (state.campaign.pendingStoryRegionIds.length > 0) {
    queueMicrotask(() => showNextPendingStory(returnFocus));
    return;
  }
  if (isEpilogueReady(state.level, state.campaign)) {
    queueMicrotask(() => showEpilogueIfReady(returnFocus));
    return;
  }
  if (returnFocus && !returnFocus.disabled) returnFocus.focus();
});
wireDialogDismissControls(
  refs.epilogueDialog,
  [refs.epilogueDialogClose, refs.epilogueDialogConfirm],
);
refs.epilogueDialog.addEventListener("close", () => {
  if (state.archiveEpilogueOnClose) {
    state.campaign = archiveEpilogue(state.level, state.campaign);
    renderCampaign();
    persistProgress();
  }
  state.archiveEpilogueOnClose = false;
  const returnFocus = state.epilogueReturnFocus;
  state.epilogueReturnFocus = null;
  if (returnFocus && !returnFocus.disabled) returnFocus.focus();
});

applyLocale();
loadLevel();
