import { markValueForTool } from "./input-tools.mjs";


export function createPaintStroke(startValue, tool) {
  return {
    targetValue: markValueForTool(startValue, tool),
    visitedIndices: new Set(),
    changedIndices: [],
  };
}


export function extendPaintStroke(
  stroke,
  values,
  index,
  { editable = true } = {},
) {
  if (stroke.visitedIndices.has(index)) return { stroke, values };

  const visitedIndices = new Set(stroke.visitedIndices);
  visitedIndices.add(index);
  if (!editable || values[index] === stroke.targetValue) {
    return {
      stroke: { ...stroke, visitedIndices },
      values,
    };
  }

  const nextValues = [...values];
  nextValues[index] = stroke.targetValue;
  return {
    stroke: {
      ...stroke,
      visitedIndices,
      changedIndices: [...stroke.changedIndices, index],
    },
    values: nextValues,
  };
}


export function gridLineIndices(startIndex, endIndex, width) {
  let x = startIndex % width;
  let y = Math.floor(startIndex / width);
  const endX = endIndex % width;
  const endY = Math.floor(endIndex / width);
  const deltaX = Math.abs(endX - x);
  const deltaY = -Math.abs(endY - y);
  const stepX = x < endX ? 1 : -1;
  const stepY = y < endY ? 1 : -1;
  const indices = [];
  let error = deltaX + deltaY;

  while (true) {
    indices.push(y * width + x);
    if (x === endX && y === endY) break;
    const doubledError = 2 * error;
    if (doubledError >= deltaY) {
      error += deltaY;
      x += stepX;
    }
    if (doubledError <= deltaX) {
      error += deltaX;
      y += stepY;
    }
  }
  return indices;
}
