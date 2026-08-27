const UNKNOWN = -1;
const BRIGHT = 1;
const DARK = 0;

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
  hintSourceIndices: new Set(),
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

function neighboursForCell(index) {
  const { width, height, regionMap } = state.level;
  const regionId = regionMap[index];
  const x = index % width;
  const y = Math.floor(index / width);
  const result = [];

  for (let neighbourY = Math.max(0, y - 1); neighbourY < Math.min(height, y + 2); neighbourY += 1) {
    for (let neighbourX = Math.max(0, x - 1); neighbourX < Math.min(width, x + 2); neighbourX += 1) {
      const neighbour = neighbourY * width + neighbourX;
      if (regionMap[neighbour] === regionId) result.push(neighbour);
    }
  }
  return result;
}

function normalizeConstraint(cells, total, advanced = false) {
  return {
    cells: [...new Set(cells)].sort((a, b) => a - b),
    total,
    advanced,
  };
}

function constraintKey(constraint) {
  return `${constraint.cells.join(",")}|${constraint.total}`;
}

function solveDeterministically(cellCount, inputConstraints, initialValues) {
  const values = [...initialValues];
  const constraints = inputConstraints.map((constraint) =>
    normalizeConstraint(constraint.cells, constraint.total, constraint.advanced),
  );
  const keys = new Set(constraints.map(constraintKey));
  const steps = [];

  while (true) {
    const residuals = [];
    let changed = false;

    for (const constraint of constraints) {
      const knownSum = constraint.cells.reduce(
        (sum, cell) => sum + (values[cell] === UNKNOWN ? 0 : values[cell]),
        0,
      );
      const unknownCells = constraint.cells.filter((cell) => values[cell] === UNKNOWN);
      const remaining = constraint.total - knownSum;

      if (remaining < 0 || remaining > unknownCells.length) {
        return {
          status: "contradiction",
          values,
          steps,
          message: `线索需要 ${remaining} 个亮格，但只剩 ${unknownCells.length} 个未知格。`,
        };
      }
      if (unknownCells.length === 0) continue;

      residuals.push({ unknownCells, remaining, sourceCells: constraint.cells });
      const forcedValue = remaining === 0 ? DARK : remaining === unknownCells.length ? BRIGHT : null;
      if (forcedValue === null) continue;

      const basicRule = forcedValue === DARK ? "zero" : "full";
      const reasoningLevel = constraint.advanced ? "advanced" : "basic";

      for (const cell of unknownCells) {
        if (values[cell] === UNKNOWN) {
          values[cell] = forcedValue;
          steps.push({
            rule: reasoningLevel === "advanced" ? `advanced_${basicRule}` : basicRule,
            cell,
            value: forcedValue,
            sourceCells: constraint.cells,
            explanation:
              reasoningLevel === "advanced"
                ? `高级推理：通过重叠线索的差集得到约束；${
                    forcedValue === DARK
                      ? "剩余亮格数为 0，未知格必为暗格。"
                      : "剩余亮格数等于未知格数，未知格必为亮格。"
                  }`
                : forcedValue === DARK
                  ? "剩余亮格数为 0，未知格必为暗格。"
                  : "剩余亮格数等于未知格数，未知格必为亮格。",
            reasoningLevel,
          });
          changed = true;
        }
      }
    }

    if (changed) continue;

    let derived = false;
    for (let leftIndex = 0; leftIndex < residuals.length; leftIndex += 1) {
      const left = residuals[leftIndex];
      const leftSet = new Set(left.unknownCells);
      for (const right of residuals.slice(leftIndex + 1)) {
        const rightSet = new Set(right.unknownCells);
        let difference;
        let differenceTotal;
        if (left.unknownCells.every((cell) => rightSet.has(cell)) && leftSet.size < rightSet.size) {
          difference = right.unknownCells.filter((cell) => !leftSet.has(cell));
          differenceTotal = right.remaining - left.remaining;
        } else if (
          right.unknownCells.every((cell) => leftSet.has(cell)) &&
          rightSet.size < leftSet.size
        ) {
          difference = left.unknownCells.filter((cell) => !rightSet.has(cell));
          differenceTotal = left.remaining - right.remaining;
        } else {
          continue;
        }

        if (differenceTotal < 0 || differenceTotal > difference.length) {
          return {
            status: "contradiction",
            values,
            steps,
            message: "两条重叠线索推出了矛盾。",
          };
        }

        const derivedConstraint = normalizeConstraint(difference, differenceTotal, true);
        const key = constraintKey(derivedConstraint);
        if (!keys.has(key) && difference.length > 0) {
          keys.add(key);
          constraints.push(derivedConstraint);
          derived = true;
        }
      }
    }

    if (derived) continue;
    if (values.every((value) => value !== UNKNOWN)) return { status: "solved", values, steps };
    return { status: "stalled", values, steps };
  }
}

function regionProblem(region) {
  const localIndex = new Map(region.cells.map((globalIndex, local) => [globalIndex, local]));
  const constraints = Object.entries(region.clues).map(([rawIndex, clue]) => {
    const index = Number(rawIndex);
    return normalizeConstraint(
      neighboursForCell(index).map((globalIndex) => localIndex.get(globalIndex)),
      clue,
    );
  });
  const initial = region.cells.map((globalIndex) => state.values[globalIndex]);
  return { localIndex, result: solveDeterministically(region.cells.length, constraints, initial) };
}

function analyseBoard() {
  const results = state.level.regions.map((region) => ({ region, ...regionProblem(region) }));
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
  return item?.result?.steps.find(
    (candidate) => state.values[item.region.cells[candidate.cell]] === UNKNOWN,
  );
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
      state.hintSourceIndices.has(index) ? "is-hint-source" : "",
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
  const nextStep = analysis.results.map(nextStepFor).find(Boolean);
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
      refs.reasoningBadge.textContent = "高级推理";
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

function setCell(index, value) {
  state.values[index] = value;
  state.hintIndex = null;
  state.hintSourceIndices = new Set();
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
  if (analysis.conflicts.size > 0) {
    state.hintIndex = null;
    state.hintSourceIndices = new Set();
    renderAll(null, analysis);
    setMessage(
      refs.statusNote,
      `${analysis.contradictionMessage ?? "当前盘面有矛盾。"} 先把橙色边框附近的标记改回未知。`,
      "error",
    );
    setMessage(refs.boardMessage, "提示器不会跨过矛盾替你猜。", "error");
    return;
  }

  for (const item of analysis.results) {
    const step = nextStepFor(item);
    if (step) {
      const globalIndex = item.region.cells[step.cell];
      state.hintIndex = globalIndex;
      state.hintSourceIndices = new Set(
        step.sourceCells.map((localIndex) => item.region.cells[localIndex]),
      );
      renderAll(null, analysis);
      const explanation =
        step.reasoningLevel === "advanced"
          ? step.explanation.replace(/^高级推理：/, "")
          : step.explanation;
      setMessage(
        refs.statusNote,
        `${item.region.name} · ${step.reasoningLevel === "advanced" ? "高级推理" : "基础推理"}：${explanation} 橙色边框是必然可落笔的位置。`,
        "success",
      );
      setMessage(refs.boardMessage, "橙色外圈是必然落笔的位置，细线框是本步推导所涉及的关联格。", "neutral");
      return;
    }
  }

  const solved = analysis.results.every(isRegionComplete);
  if (solved) {
    state.hintIndex = null;
    state.hintSourceIndices = new Set();
    renderAll(null, analysis);
    setMessage(refs.statusNote, "这一页已经被完整解开。", "success");
    setMessage(refs.boardMessage, "所有区域都通过了确定性推导。", "success");
  } else {
    setMessage(refs.statusNote, "当前规则集找不到下一条直接必然关系；请检查是否漏看了边界。", "neutral");
    setMessage(refs.boardMessage, "没有猜测分支，提示器在等待新的已知格。", "neutral");
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
    state.hintIndex = null;
    state.hintSourceIndices = new Set();
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
  state.hintIndex = null;
  state.hintSourceIndices = new Set();
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
  state.hintIndex = null;
  state.hintSourceIndices = new Set();
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
