import {
  BRIGHT,
  DARK,
  UNKNOWN,
  analyseRegion,
} from "./puzzle-logic.mjs";
import { buildHintProof } from "./hint-proof.mjs";

const refs = {
  subtitle: document.querySelector("#levelSubtitle"),
  regionTabs: document.querySelector("#regionTabs"),
  board: document.querySelector("#board"),
  boardMessage: document.querySelector("#boardMessage"),
  statusNote: document.querySelector("#statusNote"),
  hintButton: document.querySelector("#hintButton"),
  checkButton: document.querySelector("#checkButton"),
  resetButton: document.querySelector("#resetButton"),
  regionCount: document.querySelector("#regionCount"),
  cellCount: document.querySelector("#cellCount"),
  clueCount: document.querySelector("#clueCount"),
  proofStatus: document.querySelector("#proofStatus"),
  hintProof: document.querySelector("#hintProof"),
  hintProofBody: document.querySelector("#hintProofBody"),
  reasoningBadge: document.querySelector("#reasoningBadge"),
  progressLabel: document.querySelector("#progressLabel"),
  seedLabel: document.querySelector("#seedLabel"),
};

const state = {
  level: null,
  values: [],
  clues: [],
  selectedRegion: null,
  hintIndex: null,
  hintResultIndices: new Set(),
  hintSourceIndices: new Set(),
  hintProofIndices: new Set(),
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
  return item?.hint ?? null;
}

function hintItems(analysis) {
  if (state.selectedRegion === null) return analysis.results;
  return analysis.results.filter((item) => item.region.id === state.selectedRegion);
}

function compareHintCandidates(left, right) {
  if (left.proof.dependsOnPlayerMarks !== right.proof.dependsOnPlayerMarks) {
    return left.proof.dependsOnPlayerMarks ? -1 : 1;
  }
  if (left.step.reasoningLevel !== right.step.reasoningLevel) {
    return left.step.reasoningLevel === "basic" ? -1 : 1;
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
      return step ? { item, step, proof: buildHintProof(state.level, state.clues, state.values, step) } : null;
    })
    .filter((candidate) => candidate?.proof);
}

function nextHintCandidate(analysis) {
  return hintCandidates(analysis)
    .filter((candidate) => candidate.proof.valid)
    .sort(compareHintCandidates)[0] ?? null;
}

function coordinateFor(index) {
  const row = Math.floor(index / state.level.width) + 1;
  const column = (index % state.level.width) + 1;
  return `第${row}行第${column}列`;
}

function cellDescription(index) {
  const clue = state.clues[index];
  return `${coordinateFor(index)}${clue === null ? "" : `（显示线索${clue}）`}`;
}

function cellListDescription(indices) {
  return indices.map((index) => cellDescription(index)).join("、");
}

function valueDescription(value) {
  return value === DARK ? "暗格" : "亮格";
}

function proofTokenList(indices, separator = " + ") {
  return indices.length ? indices.map((index) => `R${Math.floor(index / state.level.width) + 1}C${(index % state.level.width) + 1}`).join(separator) : "无";
}

function appendProofStep(parent, label, text, className = "") {
  const item = document.createElement("li");
  item.className = ["hint-proof-step", className].filter(Boolean).join(" ");
  const title = document.createElement("strong");
  title.textContent = label;
  const detail = document.createElement("span");
  detail.textContent = text;
  item.append(title, detail);
  parent.append(item);
}

function constraintDescription(model) {
  const source = model.clueIndex === null
    ? model.label
    : `${cellDescription(model.clueIndex)} = ${model.clueValue}`;
  const scope = model.cells.length === 9
    ? "同一区域内、包含数字格自身的完整 3×3 范围共 9 格"
    : `同一区域边界把包含数字格自身的 3×3 范围裁成 ${model.cells.length} 格`;
  const settled = model.knownBright + model.knownDark;
  const settledDescription = settled > 0
    ? `其中已有 ${model.knownBright} 格确定为亮、${model.knownDark} 格确定为暗；`
    : "其中还没有已确定格；";
  return `${source}；${scope}。${settledDescription}剩余未知集合 { ${proofTokenList(model.unknownCells, "、")} } 还需 ${model.remaining} 个亮格。`;
}

function renderHintProof(proof) {
  refs.hintProof.hidden = !proof;
  refs.hintProofBody.replaceChildren();
  if (!proof) return;

  if (!proof.valid) {
    const rejected = document.createElement("p");
    rejected.className = "hint-proof-invalid";
    rejected.textContent = `提示证明未通过一致性校验，已拒绝展示结论：${proof.error}`;
    refs.hintProofBody.append(rejected);
    return;
  }

  if (proof.reasoningLevel === "advanced") {
    const mode = document.createElement("p");
    mode.className = "hint-proof-mode";
    mode.textContent = "本作扩展：这是一条可审计的双线索差集分析，不冒充原版的单线索 Hint。";
    refs.hintProofBody.append(mode);
  }

  const conclusion = document.createElement("p");
  conclusion.className = "hint-proof-conclusion";
  conclusion.textContent = `结论：${cellListDescription(proof.forcedCells)} → ${valueDescription(proof.target.value)}`;
  refs.hintProofBody.append(conclusion);

  const steps = document.createElement("ol");
  steps.className = "hint-proof-steps";
  if (proof.kind === "subset-difference") {
    appendProofStep(
      steps,
      "S · 小集合",
      constraintDescription(proof.subset),
    );
    appendProofStep(
      steps,
      "L · 大集合",
      constraintDescription(proof.superset),
    );
    appendProofStep(
      steps,
      "包含关系",
      `S 的 ${proof.subset.unknownCells.length} 个未知格全部位于 L；L 比 S 多出 ${proofTokenList(proof.differenceCells, "、")}。`,
      "hint-proof-shared",
    );
    appendProofStep(
      steps,
      "L − S",
      `${proofTokenList(proof.differenceCells, " + ")} = ${proof.superset.remaining} − ${proof.subset.remaining} = ${proof.differenceTotal} 个亮格。`,
      "hint-proof-equation",
    );
    appendProofStep(
      steps,
      "因此",
      `${proof.differenceCells.length} 个未知格中恰有 ${proof.differenceTotal} 个亮格，所以它们全部是${valueDescription(proof.target.value)}。`,
      "hint-proof-conclusion-step",
    );
  } else {
    const source = proof.source;
    appendProofStep(
      steps,
      "唯一线索",
      constraintDescription(source),
    );
    appendProofStep(
      steps,
      "因此",
      source.remaining === 0
        ? "剩余亮格数为 0，所有未知格都是暗格。"
        : `剩余亮格数等于未知格数量 ${source.unknownCells.length}，所有未知格都是亮格。`,
      "hint-proof-conclusion-step",
    );
  }
  refs.hintProofBody.append(steps);

  const context = document.createElement("p");
  context.className = "hint-proof-context";
  const placed = state.values.filter((value) => value !== UNKNOWN).length;
  if (proof.playerKnownCells.length > 0) {
    const participants = [
      proof.playerKnownBrightCells.length > 0
        ? `亮格 ${cellListDescription(proof.playerKnownBrightCells)}`
        : "",
      proof.playerKnownDarkCells.length > 0
        ? `暗格 ${cellListDescription(proof.playerKnownDarkCells)}`
        : "",
    ].filter(Boolean).join("；");
    context.textContent = `当前已落笔 ${placed} 格；其中 ${participants} 参与了这条证明。`;
  } else if (placed > 0) {
    context.textContent = `当前已落笔 ${placed} 格，但它们不在这条证明的范围内；这一步由题面线索自身推出，并没有冒充成由这 ${placed} 格新推出的结论。`;
  } else {
    context.textContent = "当前还没有玩家落子；这是一条由题面线索直接推出的必然关系。";
  }
  refs.hintProofBody.append(context);
}

function regionHasAdvancedReasoning(region) {
  return region.metrics?.reasoningLevel === "advanced" || region.metrics?.advancedSteps > 0;
}

function levelHasAdvancedReasoning() {
  return (
    state.level.reasoningLevel === "advanced" ||
    state.level.regions.some(regionHasAdvancedReasoning)
  );
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
      state.hintResultIndices.has(index) ? "is-hint-result" : "",
      state.hintSourceIndices.has(index) ? "is-hint-source" : "",
      state.hintProofIndices.has(index) ? "is-hint-proof" : "",
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
      `${region.name}，第 ${y + 1} 行第 ${x + 1} 列，${clue === null ? "没有数字线索" : `线索 ${clue}`}，当前${valueLabel(value)}`,
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
  const advancedLevel = levelHasAdvancedReasoning();
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
    if (nextStep.reasoningLevel === "advanced") {
      refs.reasoningBadge.textContent = "高级分析 · 扩展";
      refs.reasoningBadge.dataset.level = "advanced";
    } else if (advancedLevel) {
      refs.reasoningBadge.textContent = "含高级推理";
      refs.reasoningBadge.dataset.level = "advanced";
    } else {
      refs.reasoningBadge.textContent = "基础推理";
      refs.reasoningBadge.dataset.level = "basic";
    }
  } else if (advancedLevel) {
    refs.reasoningBadge.textContent = "含高级推理";
    refs.reasoningBadge.dataset.level = "advanced";
  } else {
    refs.reasoningBadge.textContent = "等待标记";
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
  state.hintResultIndices = new Set();
  state.hintSourceIndices = new Set();
  state.hintProofIndices = new Set();
  renderHintProof(null);
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
    const { item, step, proof } = candidate;
    state.hintIndex = step.cell;
    state.hintResultIndices = new Set(proof.forcedCells);
    state.hintSourceIndices = new Set(step.sourceClueIndices);
    state.hintProofIndices = new Set(proof.proofIndices);
    renderAll(null, analysis);
    renderHintProof(proof);
    const proofKind = proof.kind === "subset-difference" ? "两个剩余未知集合的差集" : "单条数字线索";
    setMessage(
      refs.statusNote,
      `${item.region.name} · ${step.reasoningLevel === "advanced" ? "高级分析（本作扩展）" : "基础推理"}：已生成一张可核对的${proofKind}证明。`,
      "success",
    );
    setMessage(
      refs.boardMessage,
      `橙色外圈标出这一步推出的全部结论格，脉冲格只是其中的落笔起点；细线框是数字线索，淡色内框是证明覆盖范围。${
        proof.dependsOnPlayerMarks ? "这条证明使用了当前已落笔格。" : "当前已落笔格不在这条证明中，结论来自题面本身。"
      }`,
      "neutral",
    );
    return;
  }

  const rejected = hintCandidates(analysis).find((item) => !item.proof.valid);
  if (rejected) {
    renderAll(null, analysis);
    renderHintProof(rejected.proof);
    setMessage(refs.statusNote, "提示器发现了一条候选推理，但证明校验未通过，因此没有给出结论。", "error");
    setMessage(refs.boardMessage, "这不是玩家需要判断的步骤；提示器已主动拒绝不自洽的证明。", "error");
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
    setMessage(refs.statusNote, `${scope}暂时找不到仅凭已落笔状态可以说明的下一条必然关系；请检查是否漏看了边界。`, "neutral");
    setMessage(refs.boardMessage, "没有猜测分支，提示器只接受当前盘面已经提供的已知格。", "neutral");
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
    setMessage(refs.boardMessage, "箴言残卷的这一页，落印。", "success");
    return;
  }
  const remaining = state.values.filter((value) => value === UNKNOWN).length;
  setMessage(refs.statusNote, `没有发现矛盾，还有 ${remaining} 格未知。继续找 0 或“剩余数等于未知数”的线索。`, "neutral");
  setMessage(refs.boardMessage, "检查通过：目前的标记仍然可能成立。", "neutral");
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
  state.clues = new Array(level.width * level.height).fill(null);
  for (const region of level.regions) {
    for (const [rawIndex, clue] of Object.entries(region.clues)) {
      state.clues[Number(rawIndex)] = clue;
    }
  }
  state.selectedRegion = null;
  clearHint();
  state.conflictIndices = new Set();
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
refs.resetButton.addEventListener("click", resetBoard);

loadLevel();
