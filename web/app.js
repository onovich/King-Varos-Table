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
  hasNarrativeCampaign,
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
import {
  INPUT_TOOLS,
  gridTargetForKey,
  markValueForTool,
  resolveKeyboardTool,
  resolvePointerTool,
} from "./input-tools.mjs";
import {
  canRedoBoardHistory,
  canUndoBoardHistory,
  cloneBoardSnapshot,
  commitBoardHistory,
  createBoardHistory,
  redoBoardHistory,
  replaceBoardHistoryPresent,
  undoBoardHistory,
} from "./board-history.mjs";
import {
  completeLevel,
  createLevelBookProgress,
  createLevelBookSave,
  firstPlayableLevelId,
  isLevelUnlocked,
  levelEntryFor,
  restoreLevelBookProgress,
  saveKeyForLevelBook,
  selectLevel,
  validateManifest,
} from "./level-book.mjs";
import { renderLevelBook } from "./level-book-ui.mjs";

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
  folioNumber: document.querySelector("#folioNumber"),
  puzzleHeading: document.querySelector("#puzzleHeading"),
  puzzleDescription: document.querySelector("#puzzleDescription"),
  lessonPanel: document.querySelector("#lessonPanel"),
  lessonTitle: document.querySelector("#lessonTitle"),
  lessonBody: document.querySelector("#lessonBody"),
  regionTabs: document.querySelector("#regionTabs"),
  markToolbar: document.querySelector("#markToolbar"),
  markTools: [...document.querySelectorAll("[data-tool]")],
  undoButton: document.querySelector("#undoButton"),
  redoButton: document.querySelector("#redoButton"),
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
  banquetPanel: document.querySelector("#banquetPanel"),
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
  levelBookButton: document.querySelector("#levelBookButton"),
  levelBookButtonCount: document.querySelector("#levelBookButtonCount"),
  levelBookDialog: document.querySelector("#levelBookDialog"),
  levelBookDialogClose: document.querySelector("#levelBookDialogClose"),
  levelBookProgress: document.querySelector("#levelBookProgress"),
  levelBookChapters: document.querySelector("#levelBookChapters"),
  completionDialog: document.querySelector("#completionDialog"),
  completionDialogClose: document.querySelector("#completionDialogClose"),
  completionTitle: document.querySelector("#completionTitle"),
  completionBody: document.querySelector("#completionBody"),
  completionBookButton: document.querySelector("#completionBookButton"),
  completionNextButton: document.querySelector("#completionNextButton"),
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
  manifest: null,
  bookProgress: null,
  bookSaveKey: null,
  currentEntry: null,
  nextLevelId: null,
  loadRevision: 0,
  loading: true,
  level: null,
  values: [],
  boardHistory: null,
  solution: null,
  clues: [],
  selectedRegion: null,
  activeTool: INPUT_TOOLS.BRIGHT,
  activeCellIndex: 0,
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

function persistLevelBookProgress() {
  if (!state.manifest || !state.bookProgress || !state.bookSaveKey) return;
  try {
    const payload = createLevelBookSave(state.manifest, state.bookProgress);
    window.localStorage.setItem(state.bookSaveKey, JSON.stringify(payload));
  } catch (error) {
    console.warn("Could not persist level-book progress.", error);
  }
}

function renderLevelBookState() {
  if (!state.manifest || !state.bookProgress) return;
  renderLevelBook(
    state.manifest,
    state.bookProgress,
    state.currentEntry?.id ?? null,
    {
      progress: refs.levelBookProgress,
      buttonCount: refs.levelBookButtonCount,
      chapters: refs.levelBookChapters,
    },
    chooseLevel,
    i18n,
  );
  refs.levelBookButton.disabled = false;
}

function openLevelBook() {
  if (!state.manifest || !state.bookProgress) return;
  renderLevelBookState();
  refs.levelBookDialog.showModal();
  queueMicrotask(() => refs.levelBookDialogClose.focus());
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

function currentBoardSnapshot() {
  return cloneBoardSnapshot(state);
}

function applyBoardSnapshot(snapshot) {
  const restored = cloneBoardSnapshot(snapshot);
  state.values = restored.values;
  state.campaign = restored.campaign;
}

function commitCurrentBoardHistory() {
  const snapshot = currentBoardSnapshot();
  state.boardHistory = state.boardHistory
    ? commitBoardHistory(state.boardHistory, snapshot)
    : createBoardHistory(snapshot);
}

function replaceCurrentHistorySnapshot() {
  if (!state.boardHistory) return;
  state.boardHistory = replaceBoardHistoryPresent(
    state.boardHistory,
    currentBoardSnapshot(),
  );
}

function renderCampaign() {
  if (!state.level) return;
  const narrative = hasNarrativeCampaign(state.level);
  refs.banquetPanel.hidden = !narrative;
  refs.archiveButton.hidden = !narrative;
  if (!narrative) return;
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
    { queueStories: hasNarrativeCampaign(state.level) },
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

function renderMarkTools() {
  const unavailable = state.loading || state.level === null;
  for (const button of refs.markTools) {
    button.disabled = unavailable;
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.tool === state.activeTool),
    );
  }
}

function renderHistoryControls() {
  const unavailable = state.loading || !state.level || !state.boardHistory;
  refs.undoButton.disabled = unavailable
    || !canUndoBoardHistory(state.boardHistory);
  refs.redoButton.disabled = unavailable
    || !canRedoBoardHistory(state.boardHistory);
}

function selectMarkTool(tool) {
  if (!Object.values(INPUT_TOOLS).includes(tool)) return;
  state.activeTool = tool;
  renderMarkTools();
}

function focusBoardCell(index, { focus = true } = {}) {
  const target = refs.board.querySelector(`[data-index="${index}"]`);
  if (!target) return false;
  state.activeCellIndex = index;
  for (const cell of refs.board.querySelectorAll(".cell")) {
    cell.tabIndex = cell === target ? 0 : -1;
  }
  if (focus) target.focus();
  return true;
}

function handleBoardKeydown(event) {
  const cell = event.target.closest?.(".cell");
  if (!cell || !state.level) return;
  const index = Number(cell.dataset.index);
  const targetIndex = gridTargetForKey(
    index,
    event.key,
    state.level.width,
    state.level.height,
    event,
  );
  if (targetIndex !== null) {
    event.preventDefault();
    focusBoardCell(targetIndex);
    return;
  }

  const tool = resolveKeyboardTool(state.activeTool, event.key);
  if (tool === null) return;
  event.preventDefault();
  if (event.repeat || state.loading) return;
  const region = regionFor(index);
  if (state.campaign.completedRegionIds.includes(region.id)) return;
  if (["1", "2", "3"].includes(event.key)) selectMarkTool(tool);
  setCell(index, markValueForTool(state.values[index], tool));
}

function renderBoard(focusIndex = null) {
  const { width, height, regionMap } = state.level;
  const shouldRestoreFocus = focusIndex !== null
    || document.activeElement?.classList?.contains("cell");
  const requestedIndex = Number(
    focusIndex ?? document.activeElement?.dataset?.index ?? state.activeCellIndex,
  );
  const activeIndex = Number.isInteger(requestedIndex)
    && requestedIndex >= 0
    && requestedIndex < width * height
    ? requestedIndex
    : 0;
  state.activeCellIndex = activeIndex;
  refs.board.style.setProperty("--columns", width);
  refs.board.style.setProperty("--board-min-width", `${Math.max(288, width * 34)}px`);
  refs.board.style.setProperty(
    "--board-max-width",
    width <= 10 ? `${width * 64}px` : "100%",
  );
  refs.board.setAttribute("aria-busy", String(state.loading));
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
    button.disabled = state.loading;
    button.dataset.index = String(index);
    button.tabIndex = index === activeIndex ? 0 : -1;
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
      button.setAttribute("aria-disabled", "true");
      const completionStatus = state.level.kind === "tutorial"
        ? i18n.t("cell.practiceCompleted")
        : i18n.t(
            countryArchived ? "cell.countryArchived" : "cell.countryStoryOpen",
          );
      button.setAttribute(
        "aria-label",
        i18n.t("cell.completedAria", {
          base: button.getAttribute("aria-label"),
          status: completionStatus,
        }),
      );
    }

    const clueSpan = document.createElement("span");
    clueSpan.className = "clue";
    clueSpan.textContent = clue === null ? "·" : String(clue);
    clueSpan.setAttribute("aria-hidden", "true");
    button.append(clueSpan);

    if (!state.loading && !countryComplete) {
      button.addEventListener("click", (event) => {
        const tool = resolvePointerTool(state.activeTool, event);
        setCell(index, markValueForTool(state.values[index], tool));
      });
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        const tool = resolvePointerTool(state.activeTool, event);
        setCell(index, markValueForTool(state.values[index], tool));
      });
    }
    refs.board.append(button);
  }

  if (shouldRestoreFocus) {
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
  renderMarkTools();
  renderHistoryControls();
  renderBoard(focusIndex);
  updateStats(currentAnalysis);
  renderCampaign();
}

function clearHint() {
  state.hintIndex = null;
  state.hintScopeIndices = new Set();
}

function renderLevelChrome() {
  if (!state.level || !state.currentEntry) return;
  const levelTitle = i18n.localize(state.currentEntry.title)
    || i18n.localize(state.level.title);
  refs.subtitle.textContent = i18n.localize(state.level.subtitle);
  refs.folioNumber.textContent = state.currentEntry.folio;
  refs.puzzleHeading.textContent = levelTitle;
  refs.puzzleDescription.textContent = i18n.t("puzzle.descriptionDynamic", {
    width: state.level.width,
    height: state.level.height,
    regions: state.level.regions.length,
  });
  refs.board.setAttribute(
    "aria-label",
    i18n.t("puzzle.boardFor", { title: levelTitle }),
  );
  refs.seedLabel.textContent = `SEED ${state.level.seed}`;
  document.title = i18n.t("meta.levelTitle", { level: levelTitle });

  const tutorial = state.level.tutorial;
  refs.lessonPanel.hidden = !tutorial;
  refs.lessonTitle.textContent = tutorial
    ? i18n.localize(tutorial.lessonTitle)
    : "";
  refs.lessonBody.textContent = tutorial
    ? i18n.localize(tutorial.lessonBody)
    : "";
  renderLevelBookState();
}

function renderCompletionDialog() {
  if (!state.level) return;
  const tutorial = state.level.tutorial;
  refs.completionTitle.textContent = tutorial
    ? i18n.localize(tutorial.completionTitle)
    : i18n.t("completion.defaultTitle");
  refs.completionBody.textContent = tutorial
    ? i18n.localize(tutorial.completionBody)
    : i18n.t("completion.defaultBody");
  refs.completionNextButton.hidden = state.nextLevelId === null;
}

function openCompletionDialog() {
  renderCompletionDialog();
  if (refs.levelBookDialog.open) refs.levelBookDialog.close();
  if (!refs.completionDialog.open) refs.completionDialog.showModal();
  queueMicrotask(() => {
    const target = state.nextLevelId
      ? refs.completionNextButton
      : refs.completionBookButton;
    target.focus();
  });
}

function recordLevelCompletion(analysis) {
  if (
    !state.manifest ||
    !state.bookProgress ||
    !state.currentEntry ||
    !analysis.results.every(isRegionComplete)
  ) {
    return false;
  }
  const completion = completeLevel(
    state.manifest,
    state.bookProgress,
    state.currentEntry.id,
  );
  state.bookProgress = completion.progress;
  state.nextLevelId = completion.nextLevelId;
  if (!completion.newlyCompleted) return false;

  persistLevelBookProgress();
  renderLevelBookState();
  if (state.level.kind === "tutorial") {
    setMessage(refs.statusNote, "message.tutorialCompleted", "success");
    queueMicrotask(openCompletionDialog);
  }
  return true;
}

function setLoading(loading) {
  state.loading = loading;
  refs.board.setAttribute("aria-busy", String(loading));
  const unavailable = loading || state.level === null;
  refs.hintButton.disabled = unavailable;
  refs.checkButton.disabled = unavailable;
  refs.resetButton.disabled = unavailable;
  refs.clearErrorsButton.disabled = unavailable || state.solution === null;
  renderMarkTools();
  renderHistoryControls();
  if (state.level) renderBoard();
}

function focusedBoardIndex() {
  const cell = document.activeElement?.closest?.(".cell");
  if (!cell) return null;
  const index = Number(cell.dataset.index);
  return Number.isInteger(index) ? index : null;
}

function hasOpenDialog() {
  return [...document.querySelectorAll("dialog")].some((dialog) => dialog.open);
}

function restoreBoardHistory(direction) {
  if (state.loading || !state.level || !state.boardHistory || hasOpenDialog()) {
    return false;
  }
  const canRestore = direction === "undo"
    ? canUndoBoardHistory(state.boardHistory)
    : canRedoBoardHistory(state.boardHistory);
  if (!canRestore) return false;

  const focusIndex = focusedBoardIndex();
  state.boardHistory = direction === "undo"
    ? undoBoardHistory(state.boardHistory)
    : redoBoardHistory(state.boardHistory);
  applyBoardSnapshot(state.boardHistory.present);
  clearHint();
  const analysis = analyseBoard();
  renderAll(focusIndex, analysis);
  persistProgress();
  const messageKey = direction === "undo"
    ? "message.undoDone"
    : "message.redoDone";
  setMessage(refs.statusNote, messageKey, "neutral");
  setMessage(refs.boardMessage, messageKey, "neutral");

  if (
    hasNarrativeCampaign(state.level) &&
    state.campaign.pendingStoryRegionIds.length > 0
  ) {
    queueMicrotask(() => showNextPendingStory(refs.archiveButton));
  } else if (isEpilogueReady(state.level, state.campaign)) {
    queueMicrotask(() => showEpilogueIfReady(refs.archiveButton));
  }
  return true;
}

function undoBoard() {
  return restoreBoardHistory("undo");
}

function redoBoard() {
  return restoreBoardHistory("redo");
}

function handleHistoryShortcut(event) {
  if (
    event.defaultPrevented ||
    event.altKey ||
    (!event.ctrlKey && !event.metaKey) ||
    hasOpenDialog()
  ) {
    return;
  }
  const target = event.target;
  if (
    target?.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName)
  ) {
    return;
  }

  const key = event.key.toLowerCase();
  const wantsUndo = key === "z" && !event.shiftKey;
  const wantsRedo = (
    key === "y" && event.ctrlKey && !event.metaKey && !event.shiftKey
  ) || (key === "z" && event.shiftKey);
  if (!wantsUndo && !wantsRedo) return;
  const changed = wantsUndo ? undoBoard() : redoBoard();
  if (changed) event.preventDefault();
}

function setCell(index, value) {
  const region = regionFor(index);
  if (state.campaign.completedRegionIds.includes(region.id)) return;
  if (state.values[index] === value) return;
  state.values[index] = value;
  clearHint();
  const analysis = analyseBoard();
  const transition = syncCampaignWithBoard(analysis);
  commitCurrentBoardHistory();
  renderAll(index, analysis);
  persistProgress();
  const completedLevelNow = recordLevelCompletion(analysis);
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
    if (hasNarrativeCampaign(state.level)) {
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
      setMessage(
        refs.boardMessage,
        completedLevelNow
          ? "message.tutorialCompleted"
          : "message.practiceRegionCompleted",
        "success",
      );
    }
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
    setMessage(
      refs.boardMessage,
      state.level.kind === "tutorial"
        ? "message.tutorialCompleted"
        : "message.mapRestored",
      "success",
    );
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
  if (cleanup.removedIndices.length > 0) commitCurrentBoardHistory();
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
  if (refs.completionDialog.open) refs.completionDialog.close();
  commitCurrentBoardHistory();
  removeStoredProgress();
  renderAll();
  setMessage(refs.statusNote, "message.reset", "neutral");
  setMessage(refs.boardMessage, "board.initial", "neutral");
}

function prepareLevel(level, entry) {
  if (level.levelId && level.levelId !== entry.id) {
    throw new TypeError(`level id ${level.levelId} does not match manifest entry ${entry.id}`);
  }
  state.level = level;
  state.currentEntry = entry;
  state.nextLevelId = null;
  state.activeCellIndex = 0;
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
  state.messages.clear();
  setMessage(refs.statusNote, "status.initial", "neutral");
  setMessage(refs.boardMessage, "board.initial", "neutral");
  state.loading = false;
  refs.hintButton.disabled = false;
  refs.checkButton.disabled = false;
  refs.resetButton.disabled = false;
  refs.clearErrorsButton.disabled = state.solution === null;
  state.bookProgress = selectLevel(
    state.manifest,
    state.bookProgress,
    entry.id,
  );
  persistLevelBookProgress();
  renderLevelChrome();
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
  state.boardHistory = createBoardHistory(currentBoardSnapshot());
  renderAll(null, initialAnalysis);
  persistProgress();
  recordLevelCompletion(initialAnalysis);
  const url = new URL(window.location.href);
  url.searchParams.set("level", entry.id);
  window.history.replaceState({}, "", url);
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  if (
    hasNarrativeCampaign(state.level) &&
    state.campaign.pendingStoryRegionIds.length > 0
  ) {
    queueMicrotask(() => showNextPendingStory(refs.archiveButton));
  } else if (isEpilogueReady(state.level, state.campaign)) {
    queueMicrotask(() => showEpilogueIfReady(refs.archiveButton));
  }
}

async function loadLevelById(levelId) {
  const entry = levelEntryFor(state.manifest, levelId);
  if (!entry || !isLevelUnlocked(state.manifest, state.bookProgress, levelId)) {
    return false;
  }
  const revision = ++state.loadRevision;
  setLoading(true);
  setMessage(
    refs.statusNote,
    () => i18n.t("message.loadingLevel", { level: i18n.localize(entry.title) }),
    "neutral",
  );
  try {
    const response = await fetch(entry.source, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const level = await response.json();
    if (revision !== state.loadRevision) return false;
    prepareLevel(level, entry);
    return true;
  } catch (error) {
    console.error(error);
    if (revision !== state.loadRevision) return false;
    setLoading(false);
    setMessage(refs.statusNote, "message.loadFailed", "error");
    setMessage(refs.boardMessage, "message.serveExample", "error");
    return false;
  }
}

async function chooseLevel(levelId) {
  if (!state.manifest || !state.bookProgress) return;
  if (!isLevelUnlocked(state.manifest, state.bookProgress, levelId)) return;
  if (refs.levelBookDialog.open) refs.levelBookDialog.close();
  if (refs.completionDialog.open) refs.completionDialog.close();
  if (state.currentEntry?.id === levelId) return;
  const loaded = await loadLevelById(levelId);
  if (loaded) refs.puzzleHeading.focus({ preventScroll: true });
}

async function loadCampaign() {
  try {
    const response = await fetch("./data/campaign.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.manifest = validateManifest(await response.json());
    state.bookSaveKey = saveKeyForLevelBook(state.manifest);
    state.bookProgress = restoreLevelBookProgress(
      state.manifest,
      readStoredProgress(state.bookSaveKey),
    ) ?? createLevelBookProgress(state.manifest);
    const requestedLevelId = new URL(window.location.href).searchParams.get("level");
    const initialLevelId = requestedLevelId && isLevelUnlocked(
      state.manifest,
      state.bookProgress,
      requestedLevelId,
    )
      ? requestedLevelId
      : firstPlayableLevelId(state.manifest, state.bookProgress);
    renderLevelBookState();
    await loadLevelById(initialLevelId);
  } catch (error) {
    console.error(error);
    setLoading(false);
    setMessage(refs.statusNote, "message.catalogLoadFailed", "error");
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
  renderLevelBookState();
  if (state.level) {
    renderLevelChrome();
    renderAll();
    renderOpenNarrative();
  }
  if (refs.completionDialog.open) renderCompletionDialog();
  renderMessages();
}

function chooseLocale(locale) {
  if (!i18n.setLocale(locale)) return;
  persistLocale(localeStorage, i18n.locale);
  applyLocale();
}

for (const button of refs.markTools) {
  button.addEventListener("click", () => selectMarkTool(button.dataset.tool));
}
refs.board.addEventListener("keydown", handleBoardKeydown);
refs.board.addEventListener("focusin", (event) => {
  const cell = event.target.closest?.(".cell");
  if (cell) focusBoardCell(Number(cell.dataset.index), { focus: false });
});
refs.hintButton.addEventListener("click", requestHint);
refs.checkButton.addEventListener("click", checkBoard);
refs.clearErrorsButton.addEventListener("click", clearErrors);
refs.resetButton.addEventListener("click", resetBoard);
refs.undoButton.addEventListener("click", undoBoard);
refs.redoButton.addEventListener("click", redoBoard);
document.addEventListener("keydown", handleHistoryShortcut);
refs.archiveButton.addEventListener("click", openArchive);
refs.levelBookButton.addEventListener("click", openLevelBook);
refs.levelBookDialogClose.addEventListener("click", () => refs.levelBookDialog.close());
refs.levelBookDialog.addEventListener("click", (event) => {
  if (event.target === refs.levelBookDialog) refs.levelBookDialog.close();
});
refs.completionDialogClose.addEventListener("click", () => refs.completionDialog.close());
refs.completionDialog.addEventListener("click", (event) => {
  if (event.target === refs.completionDialog) refs.completionDialog.close();
});
refs.completionDialog.addEventListener("close", () => {
  if (!refs.levelBookDialog.open) refs.levelBookButton.focus({ preventScroll: true });
});
refs.completionBookButton.addEventListener("click", () => {
  refs.completionDialog.close();
  queueMicrotask(openLevelBook);
});
refs.completionNextButton.addEventListener("click", () => {
  const nextLevelId = state.nextLevelId;
  refs.completionDialog.close();
  if (nextLevelId) queueMicrotask(() => chooseLevel(nextLevelId));
});
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
    replaceCurrentHistorySnapshot();
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
    replaceCurrentHistorySnapshot();
    renderCampaign();
    persistProgress();
  }
  state.archiveEpilogueOnClose = false;
  const returnFocus = state.epilogueReturnFocus;
  state.epilogueReturnFocus = null;
  if (returnFocus && !returnFocus.disabled) returnFocus.focus();
});

applyLocale();
loadCampaign();
