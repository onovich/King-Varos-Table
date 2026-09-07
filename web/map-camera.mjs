export const CELL_SIZE = 44;
export const MIN_EDIT_SIZE = 28;
export const MAX_SCALE = 2.4;

export function canEditAtScale(scale) {
  return scale * CELL_SIZE >= MIN_EDIT_SIZE;
}

export function countryBounds(level, cells) {
  const xs = cells.map(index => index % level.width);
  const ys = cells.map(index => Math.floor(index / level.width));
  return {left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs) + 1, bottom: Math.max(...ys) + 1};
}

export function fitMap(level, viewport, cells = null) {
  const bounds = cells?.length ? countryBounds(level, cells) : {left: 0, top: 0, right: level.width, bottom: level.height};
  const w = (bounds.right - bounds.left) * CELL_SIZE;
  const h = (bounds.bottom - bounds.top) * CELL_SIZE;
  const fitted = Math.min((viewport.width - 40) / w, (viewport.height - 40) / h, 1.2);
  const scale = cells?.length
    ? Math.max(MIN_EDIT_SIZE / CELL_SIZE, fitted)
    : Math.max(0.08, Math.min((MIN_EDIT_SIZE - 1) / CELL_SIZE, fitted));
  return {
    scale,
    x: viewport.width / 2 - (bounds.left + bounds.right) * CELL_SIZE * scale / 2,
    y: viewport.height / 2 - (bounds.top + bounds.bottom) * CELL_SIZE * scale / 2,
  };
}

export function cellAtPoint(level, camera, point) {
  const x = Math.floor((point.x - camera.x) / (CELL_SIZE * camera.scale));
  const y = Math.floor((point.y - camera.y) / (CELL_SIZE * camera.scale));
  return x >= 0 && x < level.width && y >= 0 && y < level.height ? y * level.width + x : null;
}

export function zoomAtPoint(camera, point, factor) {
  const scale = Math.max(0.08, Math.min(MAX_SCALE, camera.scale * factor));
  const ratio = scale / camera.scale;
  return {scale, x: point.x - (point.x - camera.x) * ratio, y: point.y - (point.y - camera.y) * ratio};
}

export function clampCamera(level, camera, viewport) {
  const scale = Math.max(0.08, Math.min(MAX_SCALE, Number(camera.scale) || 1));
  const clampAxis = (offset, count, size) => {
    const extent = count * CELL_SIZE * scale;
    // Keep some map reachable without forcing a small/edge country off center.
    return Math.min(size - 44, Math.max(44 - extent, Number(offset) || 0));
  };
  return {scale, x: clampAxis(camera.x, level.width, viewport.width), y: clampAxis(camera.y, level.height, viewport.height)};
}
