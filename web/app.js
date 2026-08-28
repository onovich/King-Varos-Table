import {
  BRIGHT,
  DARK,
  UNKNOWN,
  analyseRegion,
  clearIncorrectValues,
  deriveDirectSolution,
} from "./puzzle-logic.mjs";

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
};

function stateName(value) {
  if (value === BRIGHT) return "light";
  if (value === DARK) return "dark";
  return "unknown";
}

function valueLabel(value) {
  if (value === BRIGHT) return "亮格";
  if (value === DARK) return "暗格";
  return "未知";
}

function setMessage(element, text, tone = "neutral") {
  element.textContent = text;
  element.dataset.tone = tone;
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
    contradictionMessage: contradiction
      ? `${contradiction.region.name}：${contradiction.result.message}`
      : null,
  };
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
  return `第${row}行第${column}列`;
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
  allButton.textContent = "整页";
  allButton.addEventListener("click", () => {
    state.selectedRegion = null;
    clearHint();
    renderAll();
  });
  refs.regionTabs.append(allButton);

  for (const region of regions) {
    const button = document.createElement("button");
    const item = analysis?.results.find((candidate) => candidate.region.id === region.id);
    const advanced = regionHasAdvancedReasoning(region) || nextStepFor(item)?.reasoningLevel === "advanced";
    const suffix = item
      ? isRegionComplete(item)
        ? " · 已完成"
        : advanced
          ? " · 高级"
          : ""
      : "";
    button.type = "button";
    button.className = "region-tab";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(state.selectedRegion === region.id));
    button.innerHTML = `<span class="tab-dot" aria-hidden="true"></span>${region.name}${suffix}`;
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
    button.dataset.index = String(index);
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-rowindex", String(y + 1));
    button.setAttribute("aria-colindex", String(x + 1));
    button.setAttribute(
      "aria-label",
      `${region.name}，第 ${y + 1} 行第 ${x + 1} 列，${clue === null ? "没有数字线索" : `线索 ${clue}`}，当前${valueLabel(value)}${
        state.hintIndex === index
          ? "，当前提示数字，强高亮"
          : state.hintScopeIndices.has(index)
            ? "，当前提示范围，弱高亮"
            : ""
      }`,
    );

    const clueSpan = document.createElement("span");
    clueSpan.className = "clue";
    clueSpan.textContent = clue === null ? "·" : String(clue);
    clueSpan.setAttribute("aria-hidden", "true");
    button.append(clueSpan);

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
    refs.board.append(button);
  }

  if (activeIndex !== undefined && activeIndex !== null) {
    const focusTarget = refs.board.querySelector(`[data-index="${activeIndex}"]`);
    focusTarget?.focus({ preventScroll: true });
  }
}

function updateStats(analysis) {
  const placed = state.values.filter((value) => value !== UNKNOWN).length;
  const solved = analysis.results.filter(isRegionComplete).length;
  const total = state.level.width * state.level.height;
  const clueCount = state.level.regions.reduce((sum, region) => sum + Object.keys(region.clues).length, 0);
  const nextStep = nextHintCandidate(analysis)?.step ?? null;
  refs.regionCount.textContent = String(state.level.regions.length);
  refs.cellCount.textContent = String(total);
  refs.clueCount.textContent = String(clueCount);
  refs.progressLabel.textContent = `${placed} / ${total}`;
  refs.proofStatus.textContent = solved === state.level.regions.length ? "已完成" : "唯一已证";
  if (analysis.conflicts.size > 0) {
    refs.reasoningBadge.textContent = "先处理矛盾";
    refs.reasoningBadge.dataset.level = "waiting";
  } else if (solved === state.level.regions.length) {
    refs.reasoningBadge.textContent = "本页完成";
    refs.reasoningBadge.dataset.level = "complete";
  } else if (nextStep) {
    refs.reasoningBadge.textContent = "基础提示可用";
    refs.reasoningBadge.dataset.level = "basic";
  } else {
    refs.reasoningBadge.textContent = "暂无基础提示";
    refs.reasoningBadge.dataset.level = "waiting";
  }
}

function renderAll(focusIndex = null, analysis = null) {
  const currentAnalysis = analysis ?? analyseBoard();
  state.conflictIndices = currentAnalysis.conflicts;
  renderTabs(currentAnalysis);
  renderBoard(focusIndex);
  updateStats(currentAnalysis);
}

function clearHint() {
  state.hintIndex = null;
  state.hintScopeIndices = new Set();
}

function setCell(index, value) {
  state.values[index] = value;
  clearHint();
  const analysis = analyseBoard();
  renderAll(index, analysis);
  if (analysis.conflicts.size > 0) {
    setMessage(
      refs.boardMessage,
      `${analysis.contradictionMessage ?? "这一步让某个数字超出可能范围。"} 橙色边框标出了受影响区域。`,
      "error",
    );
  } else {
    setMessage(refs.boardMessage, "记录已更新。需要时可以让提示器寻找下一条必然关系。", "neutral");
  }
}

function requestHint() {
  const analysis = analyseBoard();
  clearHint();
  if (analysis.conflicts.size > 0) {
    renderAll(null, analysis);
    setMessage(
      refs.statusNote,
      `${analysis.contradictionMessage ?? "当前盘面有矛盾。"} 先把橙色边框附近的标记改回未知。`,
      "error",
    );
    setMessage(refs.boardMessage, "提示器不会跨过矛盾替你猜。", "error");
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
      `${item.region.name} · 基础提示：请看${coordinateFor(step.clueIndex)}的数字 ${step.clueValue}。`,
      "success",
    );
    setMessage(
      refs.boardMessage,
      `粗橙框是提示数字；弱橙框是它在同一区域内的有效 3×3 范围。只根据这个数字就能处理整个高亮范围。`,
      "neutral",
    );
    return;
  }

  const solved = analysis.results.every(isRegionComplete);
  if (solved) {
    clearHint();
    renderAll(null, analysis);
    setMessage(refs.statusNote, "这一页已经被完整解开。", "success");
    setMessage(refs.boardMessage, "所有区域都通过了确定性推导。", "success");
  } else {
    const scope = state.selectedRegion === null ? "当前盘面" : "当前区域";
    renderAll(null, analysis);
    setMessage(refs.statusNote, `${scope}暂时没有能由单个数字直接结算的范围。`, "neutral");
    setMessage(refs.boardMessage, "提示不会悄悄升级成双线索作差；继续落笔，或切换到另一个区域。", "neutral");
  }
}

function checkBoard() {
  const analysis = analyseBoard();
  renderAll(null, analysis);
  if (analysis.conflicts.size > 0) {
    setMessage(
      refs.statusNote,
      `${analysis.contradictionMessage ?? "发现矛盾。"} 橙色边框所在区域里，至少有一个标记与数字范围冲突。`,
      "error",
    );
    setMessage(refs.boardMessage, "把可疑标记改回未知，再继续推理。", "error");
    return;
  }
  if (analysis.results.every(isRegionComplete)) {
    clearHint();
    renderAll(null, analysis);
    setMessage(refs.statusNote, "完成。每个区域都被纯逻辑解开，且题面只有这一组答案。", "success");
    setMessage(refs.boardMessage, "瓦罗王的第一张版图，已经复原。", "success");
    return;
  }
  const remaining = state.values.filter((value) => value === UNKNOWN).length;
  setMessage(refs.statusNote, `没有发现矛盾，还有 ${remaining} 格未知。继续找 0 或“剩余数等于未知数”的线索。`, "neutral");
  setMessage(refs.boardMessage, "检查通过：目前的标记仍然可能成立。", "neutral");
}

function clearErrors() {
  if (!state.solution) {
    setMessage(refs.statusNote, "当前关卡无法重建完整答案，不能安全地清除错误标记。", "error");
    setMessage(refs.boardMessage, "题面保持不变。", "neutral");
    return;
  }

  const cleanup = clearIncorrectValues(state.values, state.solution);
  state.values = cleanup.values;
  clearHint();
  const analysis = analyseBoard();
  renderAll(null, analysis);

  if (cleanup.removedIndices.length > 0) {
    setMessage(
      refs.statusNote,
      `已清除 ${cleanup.removedIndices.length} 个错误标记；正确标记和未知格均保持不变。`,
      "success",
    );
    setMessage(refs.boardMessage, "错误答案已全部移除，可以从当前正确进度继续。", "success");
  } else {
    setMessage(refs.statusNote, "当前没有错误标记，无需清除。", "neutral");
    setMessage(refs.boardMessage, "棋盘没有发生变化。", "neutral");
  }
}

function resetBoard() {
  state.values = new Array(state.level.width * state.level.height).fill(UNKNOWN);
  clearHint();
  state.conflictIndices = new Set();
  renderAll();
  setMessage(refs.statusNote, "棋盘已清空。你不需要猜，只需要找出下一条必然关系。", "neutral");
  setMessage(refs.boardMessage, "先选择一个数字，看看它的 3×3 范围。", "neutral");
}

function prepareLevel(level) {
  state.level = level;
  state.values = new Array(level.width * level.height).fill(UNKNOWN);
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
  refs.subtitle.textContent = level.subtitle;
  refs.seedLabel.textContent = `SEED ${level.seed}`;
  const initialAnalysis = analyseBoard();
  renderAll(null, initialAnalysis);
}

async function loadLevel() {
  try {
    const response = await fetch("./data/demo-level.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    prepareLevel(await response.json());
  } catch (error) {
    console.error(error);
    setMessage(refs.statusNote, "关卡文件没有载入。请使用本地静态服务器打开 web/ 目录。", "error");
    setMessage(refs.boardMessage, "例如：python -m http.server 4173 --directory web", "error");
  }
}

refs.hintButton.addEventListener("click", requestHint);
refs.checkButton.addEventListener("click", checkBoard);
refs.clearErrorsButton.addEventListener("click", clearErrors);
refs.resetButton.addEventListener("click", resetBoard);

loadLevel();
