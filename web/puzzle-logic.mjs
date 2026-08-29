export const UNKNOWN = -1;
export const BRIGHT = 1;
export const DARK = 0;

function uniqueSorted(values) {
  return [...new Set(values)].sort((left, right) => left - right);
}

export function neighboursForCell(level, index) {
  const { width, height, regionMap } = level;
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

export function findDirectClueHint(level, region, values) {
  const candidates = [];

  for (const [rawIndex, rawClue] of Object.entries(region.clues)) {
    const clueIndex = Number(rawIndex);
    const clueValue = Number(rawClue);
    const scopeCells = neighboursForCell(level, clueIndex);
    const unknownCells = scopeCells.filter((index) => values[index] === UNKNOWN);
    const knownBright = scopeCells.filter((index) => values[index] === BRIGHT).length;
    const knownDark = scopeCells.filter((index) => values[index] === DARK).length;
    const remaining = clueValue - knownBright;

    if (remaining < 0 || remaining > unknownCells.length) {
      return {
        status: "contradiction",
        kind: "direct-clue",
        cell: null,
        clueIndex,
        scopeCells,
        unknownCells,
        forcedCells: [],
        messageKey: "logic.directContradiction",
        messageParams: {
          clueValue,
          remaining,
          unknownCount: unknownCells.length,
        },
      };
    }
    if (unknownCells.length === 0) continue;

    const value = remaining === 0
      ? DARK
      : remaining === unknownCells.length
        ? BRIGHT
        : null;
    if (value === null) continue;

    candidates.push({
      status: "ok",
      kind: "direct-clue",
      rule: value === DARK ? "zero" : "full",
      cell: clueIndex,
      clueIndex,
      clueValue,
      value,
      scopeCells,
      sourceCells: scopeCells,
      sourceClueIndices: [clueIndex],
      unknownCells,
      forcedCells: unknownCells,
      knownBright,
      knownDark,
      remaining,
      prerequisiteCells: scopeCells.filter((index) => values[index] !== UNKNOWN),
      dependsOnPlayerMarks: knownBright + knownDark > 0,
      reasoningLevel: "basic",
      clipped: scopeCells.length < 9,
      explanationKey: value === DARK ? "logic.directDark" : "logic.directBright",
    });
  }

  candidates.sort((left, right) => {
    if (left.dependsOnPlayerMarks !== right.dependsOnPlayerMarks) {
      return left.dependsOnPlayerMarks ? -1 : 1;
    }
    const leftKnown = left.knownBright + left.knownDark;
    const rightKnown = right.knownBright + right.knownDark;
    if (leftKnown !== rightKnown) return rightKnown - leftKnown;
    if (left.unknownCells.length !== right.unknownCells.length) {
      return left.unknownCells.length - right.unknownCells.length;
    }
    return left.clueIndex - right.clueIndex;
  });

  return candidates[0] ?? {
    status: "stalled",
    kind: "direct-clue",
    cell: null,
    clueIndex: null,
    scopeCells: [],
    unknownCells: [],
    forcedCells: [],
    messageKey: "logic.noDirectStep",
    messageParams: {},
  };
}

function normalizeConstraint(cells, total, metadata = {}) {
  const clueIndex = metadata.clueIndex ?? null;
  const sourceClueIndices = metadata.sourceClueIndices ?? (clueIndex === null ? [] : [clueIndex]);
  return {
    cells: uniqueSorted(cells),
    total: Number(total),
    advanced: Boolean(metadata.advanced),
    clueIndex,
    sourceClueIndices: uniqueSorted(sourceClueIndices),
    derivation: metadata.derivation ?? null,
    prerequisiteCells: uniqueSorted(metadata.prerequisiteCells ?? []),
  };
}

function constraintKey(constraint) {
  return `${constraint.cells.join(",")}|${constraint.total}`;
}

function regionConstraints(level, region) {
  const localIndex = new Map(region.cells.map((globalIndex, localIndex) => [globalIndex, localIndex]));
  const constraints = Object.entries(region.clues).map(([rawIndex, clue]) => {
    const clueIndex = Number(rawIndex);
    const cells = neighboursForCell(level, clueIndex)
      .map((globalIndex) => localIndex.get(globalIndex))
      .filter((localIndex) => localIndex !== undefined);
    return normalizeConstraint(cells, clue, { clueIndex });
  });
  return { localIndex, constraints };
}

function normalizeInputConstraint(constraint) {
  return normalizeConstraint(constraint.cells, constraint.total, constraint);
}

function residualSummary(residual) {
  return {
    clueIndex: residual.constraint.clueIndex,
    sourceClueIndices: [...residual.constraint.sourceClueIndices],
    total: residual.constraint.total,
    remaining: residual.remaining,
    knownBright: residual.knownSum,
    cells: [...residual.unknownCells],
    originalCells: [...residual.constraint.cells],
    prerequisiteCells: [...residual.prerequisiteCells],
  };
}

function mapSummaryToGlobal(region, summary) {
  if (!summary) return null;
  return {
    ...summary,
    cells: summary.cells.map((localIndex) => region.cells[localIndex]),
    originalCells: summary.originalCells.map((localIndex) => region.cells[localIndex]),
    prerequisiteCells: summary.prerequisiteCells.map((localIndex) => region.cells[localIndex]),
  };
}

function mapDerivationToGlobal(region, derivation) {
  if (!derivation) return null;
  const subset = derivation.subset ?? derivation.left;
  const superset = derivation.superset ?? derivation.right;
  const globalSubset = mapSummaryToGlobal(region, subset);
  const globalSuperset = mapSummaryToGlobal(region, superset);
  return {
    // Keep these aliases for old saved/debug data; new proof code uses the explicit names below.
    left: globalSubset,
    right: globalSuperset,
    subset: globalSubset,
    superset: globalSuperset,
    differenceCells: derivation.differenceCells.map((localIndex) => region.cells[localIndex]),
    differenceTotal: derivation.differenceTotal,
  };
}

function globalizeStep(region, step) {
  return {
    status: "ok",
    ...step,
    localCell: step.cell,
    cell: region.cells[step.cell],
    sourceCells: step.sourceCells.map((localIndex) => region.cells[localIndex]),
    forcedCells: step.forcedCells.map((localIndex) => region.cells[localIndex]),
    prerequisiteCells: step.prerequisiteCells.map((localIndex) => region.cells[localIndex]),
    derivation: mapDerivationToGlobal(region, step.derivation),
  };
}

function nextActionableStep(region, result, initialValues) {
  if (result.status === "contradiction") return null;
  const step = result.steps.find(
    (candidate) =>
      initialValues[candidate.cell] === UNKNOWN &&
      candidate.prerequisiteCells.every((localIndex) => initialValues[localIndex] !== UNKNOWN),
  );
  return step ? globalizeStep(region, step) : null;
}

export function solveDeterministically(cellCount, inputConstraints, initialValues) {
  const values = [...initialValues];
  const startingValues = [...initialValues];
  const constraints = inputConstraints.map(normalizeInputConstraint);
  const constraintKeys = new Set(constraints.map(constraintKey));
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
          messageKey: "logic.solverContradiction",
          messageParams: {
            remaining,
            unknownCount: unknownCells.length,
          },
        };
      }
      if (unknownCells.length === 0) continue;

      const internallyKnownCells = constraint.cells.filter(
        (cell) => values[cell] !== UNKNOWN && startingValues[cell] === UNKNOWN,
      );
      const prerequisiteCells = uniqueSorted([
        ...constraint.prerequisiteCells,
        ...internallyKnownCells,
      ]);
      residuals.push({
        constraint,
        unknownCells,
        remaining,
        knownSum,
        prerequisiteCells,
      });

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
            forcedCells: unknownCells,
            sourceClueIndices: constraint.sourceClueIndices,
            prerequisiteCells,
            derivation: constraint.derivation,
            remaining,
            explanationKey: reasoningLevel === "advanced"
              ? forcedValue === DARK
                ? "logic.advancedDark"
                : "logic.advancedBright"
              : forcedValue === DARK
                ? "logic.basicDark"
                : "logic.basicBright",
            reasoningLevel,
          });
          changed = true;
        }
      }
    }

    if (changed) continue;

    let derivedConstraintAdded = false;
    for (let leftIndex = 0; leftIndex < residuals.length; leftIndex += 1) {
      const left = residuals[leftIndex];
      const leftSet = new Set(left.unknownCells);
      for (const right of residuals.slice(leftIndex + 1)) {
        const rightSet = new Set(right.unknownCells);
        let subset;
        let superset;
        if (leftSet.size < rightSet.size && left.unknownCells.every((cell) => rightSet.has(cell))) {
          subset = left;
          superset = right;
        } else if (rightSet.size < leftSet.size && right.unknownCells.every((cell) => leftSet.has(cell))) {
          subset = right;
          superset = left;
        } else {
          continue;
        }

        const subsetCells = new Set(subset.unknownCells);
        const difference = superset.unknownCells.filter((cell) => !subsetCells.has(cell));
        const differenceTotal = superset.remaining - subset.remaining;
        if (differenceTotal < 0 || differenceTotal > difference.length) {
          return {
            status: "contradiction",
            values,
            steps,
            messageKey: "logic.overlapContradiction",
            messageParams: {},
          };
        }

        const subsetSummary = residualSummary(subset);
        const supersetSummary = residualSummary(superset);
        const derivedConstraint = normalizeConstraint(difference, differenceTotal, {
          advanced: true,
          sourceClueIndices: uniqueSorted([
            ...subset.constraint.sourceClueIndices,
            ...superset.constraint.sourceClueIndices,
          ]),
          prerequisiteCells: uniqueSorted([
            ...subset.prerequisiteCells,
            ...superset.prerequisiteCells,
          ]),
          derivation: {
            subset: subsetSummary,
            superset: supersetSummary,
            differenceCells: difference,
            differenceTotal,
          },
        });
        const key = constraintKey(derivedConstraint);
        if (!constraintKeys.has(key) && difference.length > 0) {
          constraintKeys.add(key);
          constraints.push(derivedConstraint);
          derivedConstraintAdded = true;
        }
      }
    }

    if (derivedConstraintAdded) continue;
    if (values.every((value) => value !== UNKNOWN)) return { status: "solved", values, steps };
    return { status: "stalled", values, steps };
  }
}

export function analyseRegion(level, region, values) {
  const { localIndex, constraints } = regionConstraints(level, region);
  const initialValues = region.cells.map((globalIndex) => values[globalIndex]);
  const result = solveDeterministically(region.cells.length, constraints, initialValues);
  return {
    localIndex,
    constraints,
    initialValues,
    result,
    hint: nextActionableStep(region, result, initialValues),
    directHint: findDirectClueHint(level, region, values),
  };
}

export function findNextHint(level, region, values) {
  const analysis = analyseRegion(level, region, values);
  return analysis.hint ?? {
    status: analysis.result.status,
    cell: null,
    forcedCells: [],
    sourceCells: [],
    sourceClueIndices: [],
    derivation: null,
    messageKey: analysis.result.messageKey ?? null,
    messageParams: analysis.result.messageParams ?? {},
  };
}

export function deriveDirectSolution(level) {
  const values = Array(level.width * level.height).fill(UNKNOWN);

  while (true) {
    let applied = false;
    for (const region of level.regions) {
      const hint = findDirectClueHint(level, region, values);
      if (hint.status === "contradiction") return null;
      if (hint.status !== "ok") continue;
      for (const index of hint.forcedCells) values[index] = hint.value;
      applied = true;
      break;
    }
    if (applied) continue;
    return values.every((value) => value !== UNKNOWN) ? values : null;
  }
}

export function clearIncorrectValues(values, solution) {
  if (!Array.isArray(values) || !Array.isArray(solution) || values.length !== solution.length) {
    throw new TypeError("values and solution must be arrays of the same length");
  }
  if (solution.some((value) => value !== BRIGHT && value !== DARK)) {
    throw new TypeError("solution must contain only bright or dark values");
  }

  const nextValues = [...values];
  const removedIndices = [];
  for (let index = 0; index < nextValues.length; index += 1) {
    if (nextValues[index] === UNKNOWN || nextValues[index] === solution[index]) continue;
    nextValues[index] = UNKNOWN;
    removedIndices.push(index);
  }
  return { values: nextValues, removedIndices };
}
