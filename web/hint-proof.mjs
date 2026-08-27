import { BRIGHT, DARK, UNKNOWN } from "./puzzle-logic.mjs";

function uniqueSorted(values) {
  return [...new Set(values)].sort((left, right) => left - right);
}

function cellToken(level, index) {
  const row = Math.floor(index / level.width) + 1;
  const column = (index % level.width) + 1;
  return `R${row}C${column}`;
}

function residualModel(level, clues, values, residual) {
  const cells = uniqueSorted(residual.originalCells ?? residual.cells ?? []);
  const unknownCells = uniqueSorted(residual.cells ?? []);
  const playerKnownCells = cells.filter((index) => values[index] !== UNKNOWN);
  return {
    clueIndex: residual.clueIndex,
    clueValue: residual.clueIndex === null ? null : clues[residual.clueIndex],
    total: residual.total,
    remaining: residual.remaining,
    knownBright: residual.knownBright,
    cells,
    unknownCells,
    playerKnownCells,
    label: residual.clueIndex === null ? "已推导约束" : cellToken(level, residual.clueIndex),
  };
}

export function proofCellIndices(hint) {
  if (!hint || hint.status !== "ok") return [];
  if (hint.derivation) {
    return uniqueSorted([
      ...(hint.derivation.left?.originalCells ?? []),
      ...(hint.derivation.right?.originalCells ?? []),
    ]);
  }
  return uniqueSorted(hint.sourceCells ?? []);
}

export function buildHintProof(level, clues, values, hint) {
  if (!hint || hint.status !== "ok" || hint.cell === null || hint.cell === undefined) return null;

  const proofIndices = proofCellIndices(hint);
  const prerequisiteCells = uniqueSorted(hint.prerequisiteCells ?? []);
  const playerKnownCells = uniqueSorted(
    [...proofIndices, ...prerequisiteCells].filter((index) => values[index] !== UNKNOWN),
  );
  const proof = {
    target: {
      index: hint.cell,
      value: hint.value,
      token: cellToken(level, hint.cell),
    },
    forcedCells: uniqueSorted(hint.forcedCells ?? []),
    sourceClueIndices: uniqueSorted(hint.sourceClueIndices ?? []),
    prerequisiteCells,
    proofIndices,
    playerKnownCells,
    dependsOnPlayerMarks: playerKnownCells.length > 0,
    reasoningLevel: hint.reasoningLevel ?? "basic",
  };

  if (hint.derivation) {
    const left = residualModel(level, clues, values, hint.derivation.left);
    const right = residualModel(level, clues, values, hint.derivation.right);
    const larger = left.cells.length >= right.cells.length ? left : right;
    const smaller = left.cells.length >= right.cells.length ? right : left;
    const sharedCells = larger.cells.filter((index) => smaller.cells.includes(index));
    const differenceCells = uniqueSorted(
      hint.derivation.differenceCells ?? larger.cells.filter((index) => !smaller.cells.includes(index)),
    );
    return {
      ...proof,
      kind: "subset-difference",
      larger,
      smaller,
      sharedCells,
      differenceCells,
      differenceTotal: Number(hint.derivation.differenceTotal),
    };
  }

  const sourceCells = uniqueSorted(hint.sourceCells ?? []);
  const clueIndex = hint.sourceClueIndices?.[0] ?? null;
  const clueValue = clueIndex === null ? null : clues[clueIndex];
  const unknownCells = sourceCells.filter((index) => values[index] === UNKNOWN);
  const knownBright = sourceCells.filter((index) => values[index] === BRIGHT).length;
  return {
    ...proof,
    kind: "single-clue",
    source: {
      clueIndex,
      clueValue,
      token: clueIndex === null ? "当前数字线索" : cellToken(level, clueIndex),
      cells: sourceCells,
      unknownCells,
      knownBright,
      remaining: hint.remaining ?? (clueValue === null ? null : clueValue - knownBright),
    },
  };
}

export function valueToken(value) {
  return value === DARK ? "暗格" : value === BRIGHT ? "亮格" : "未知";
}

export { cellToken };
