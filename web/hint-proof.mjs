import { BRIGHT, DARK, UNKNOWN } from "./puzzle-logic.mjs";

function uniqueSorted(values) {
  return [...new Set(values)].sort((left, right) => left - right);
}

function sameCells(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function cellToken(level, index) {
  const row = Math.floor(index / level.width) + 1;
  const column = (index % level.width) + 1;
  return `R${row}C${column}`;
}

function residualModel(level, clues, values, residual) {
  if (!residual) return null;
  const cells = uniqueSorted(residual.originalCells ?? residual.cells ?? []);
  const unknownCells = uniqueSorted(residual.cells ?? []);
  const playerKnownCells = cells.filter((index) => values[index] !== UNKNOWN);
  const knownBrightCells = cells.filter((index) => values[index] === BRIGHT);
  const knownDarkCells = cells.filter((index) => values[index] === DARK);
  const settledCount = cells.length - unknownCells.length;
  const knownBright = Number(residual.knownBright);
  return {
    clueIndex: residual.clueIndex,
    clueValue: residual.clueIndex === null ? null : clues[residual.clueIndex],
    total: Number(residual.total),
    remaining: Number(residual.remaining),
    knownBright,
    knownDark: settledCount - knownBright,
    cells,
    unknownCells,
    playerKnownCells,
    knownBrightCells,
    knownDarkCells,
    label: residual.clueIndex === null ? "derived-constraint" : cellToken(level, residual.clueIndex),
  };
}

function invalidProof(proof, errorKey) {
  return {
    ...proof,
    kind: "invalid",
    valid: false,
    errorKey,
  };
}

function residualError(model) {
  if (!model.unknownCells.every((index) => model.cells.includes(index))) {
    return "proof.error.unknownOutsideConstraint";
  }
  if (
    !Number.isInteger(model.total) ||
    !Number.isInteger(model.remaining) ||
    !Number.isInteger(model.knownBright) ||
    model.knownBright < 0 ||
    model.knownDark < 0 ||
    model.total !== model.knownBright + model.remaining
  ) {
    return "proof.error.inconsistentTotals";
  }
  if (model.clueIndex !== null && model.clueValue !== model.total) {
    return "proof.error.clueMismatch";
  }
  return null;
}

export function proofCellIndices(hint) {
  if (!hint || hint.status !== "ok") return [];
  if (hint.derivation) {
    const subset = hint.derivation.subset ?? hint.derivation.left;
    const superset = hint.derivation.superset ?? hint.derivation.right;
    return uniqueSorted([
      ...(subset?.originalCells ?? []),
      ...(superset?.originalCells ?? []),
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
  const playerKnownBrightCells = playerKnownCells.filter((index) => values[index] === BRIGHT);
  const playerKnownDarkCells = playerKnownCells.filter((index) => values[index] === DARK);
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
    playerKnownBrightCells,
    playerKnownDarkCells,
    dependsOnPlayerMarks: playerKnownCells.length > 0,
    reasoningLevel: hint.reasoningLevel ?? "basic",
    valid: true,
  };

  if (hint.derivation) {
    const subset = residualModel(
      level,
      clues,
      values,
      hint.derivation.subset ?? hint.derivation.left,
    );
    const superset = residualModel(
      level,
      clues,
      values,
      hint.derivation.superset ?? hint.derivation.right,
    );
    if (!subset || !superset) return invalidProof(proof, "proof.error.missingSubsetConstraints");
    const malformedResidual = residualError(subset) ?? residualError(superset);
    if (malformedResidual) return invalidProof(proof, malformedResidual);

    const subsetCells = new Set(subset.unknownCells);
    const isStrictSubset =
      subset.unknownCells.length < superset.unknownCells.length &&
      subset.unknownCells.every((index) => superset.unknownCells.includes(index));
    if (!isStrictSubset) {
      return invalidProof(proof, "proof.error.notStrictSubset");
    }

    const expectedDifferenceCells = superset.unknownCells.filter((index) => !subsetCells.has(index));
    const differenceCells = uniqueSorted(
      hint.derivation.differenceCells ?? expectedDifferenceCells,
    );
    if (!sameCells(differenceCells, expectedDifferenceCells)) {
      return invalidProof(proof, "proof.error.differenceCellsMismatch");
    }

    const differenceTotal = Number(hint.derivation.differenceTotal);
    const expectedDifferenceTotal = superset.remaining - subset.remaining;
    if (!Number.isInteger(differenceTotal) || differenceTotal !== expectedDifferenceTotal) {
      return invalidProof(proof, "proof.error.differenceTotalMismatch");
    }
    if (differenceTotal < 0 || differenceTotal > differenceCells.length) {
      return invalidProof(proof, "proof.error.differenceTotalOutOfRange");
    }

    const forcedCells = uniqueSorted(hint.forcedCells ?? []);
    const expectedForcedTotal = hint.value === BRIGHT ? differenceCells.length : 0;
    if (
      !sameCells(forcedCells, differenceCells) ||
      !forcedCells.includes(hint.cell) ||
      differenceTotal !== expectedForcedTotal
    ) {
      return invalidProof(proof, "proof.error.differenceCannotForceCells");
    }

    return {
      ...proof,
      kind: "subset-difference",
      subset,
      superset,
      sharedCells: [...subset.unknownCells],
      differenceCells,
      differenceTotal,
    };
  }

  const sourceCells = uniqueSorted(hint.sourceCells ?? []);
  const clueIndex = hint.sourceClueIndices?.[0] ?? null;
  const clueValue = clueIndex === null ? null : clues[clueIndex];
  const unknownCells = sourceCells.filter((index) => values[index] === UNKNOWN);
  const knownBright = sourceCells.filter((index) => values[index] === BRIGHT).length;
  const knownDark = sourceCells.filter((index) => values[index] === DARK).length;
  const remaining = clueValue === null ? null : clueValue - knownBright;
  const forcedCells = uniqueSorted(hint.forcedCells ?? []);
  const expectedForcedValue = remaining === 0 ? DARK : remaining === unknownCells.length ? BRIGHT : null;
  if (
    clueIndex === null ||
    !Number.isInteger(clueValue) ||
    remaining < 0 ||
    remaining > unknownCells.length ||
    (hint.remaining !== undefined && Number(hint.remaining) !== remaining) ||
    expectedForcedValue !== hint.value ||
    !sameCells(forcedCells, unknownCells) ||
    !forcedCells.includes(hint.cell)
  ) {
    return invalidProof(proof, "proof.error.singleClueCannotForceCells");
  }
  return {
    ...proof,
    kind: "single-clue",
    source: {
      clueIndex,
      clueValue,
      token: clueIndex === null ? "current-clue" : cellToken(level, clueIndex),
      cells: sourceCells,
      unknownCells,
      knownBright,
      knownDark,
      remaining,
    },
  };
}

export function valueToken(value) {
  return value === DARK ? "dark" : value === BRIGHT ? "bright" : "unknown";
}

export { cellToken };
