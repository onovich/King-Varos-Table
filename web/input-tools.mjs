import { BRIGHT, DARK, UNKNOWN } from "./puzzle-logic.mjs";


export const INPUT_TOOLS = Object.freeze({
  BRIGHT: "bright",
  DARK: "dark",
  ERASE: "erase",
});


export function resolvePointerTool(selectedTool, event) {
  if (event.button === 2 || event.shiftKey) return INPUT_TOOLS.DARK;
  return selectedTool;
}


export function markValueForTool(currentValue, tool) {
  if (tool === INPUT_TOOLS.ERASE) return UNKNOWN;
  const nextValue = tool === INPUT_TOOLS.DARK ? DARK : BRIGHT;
  return currentValue === nextValue ? UNKNOWN : nextValue;
}


export function gridTargetForKey(
  currentIndex,
  key,
  width,
  height,
  { ctrlKey = false, metaKey = false } = {},
) {
  const column = currentIndex % width;
  const row = Math.floor(currentIndex / width);
  if (key === "ArrowLeft") return column === 0 ? currentIndex : currentIndex - 1;
  if (key === "ArrowRight") return column === width - 1 ? currentIndex : currentIndex + 1;
  if (key === "ArrowUp") return row === 0 ? currentIndex : currentIndex - width;
  if (key === "ArrowDown") return row === height - 1 ? currentIndex : currentIndex + width;
  if (key === "Home") return ctrlKey || metaKey ? 0 : row * width;
  if (key === "End") {
    return ctrlKey || metaKey ? width * height - 1 : row * width + width - 1;
  }
  return null;
}


export function resolveKeyboardTool(selectedTool, key) {
  if (key === "Enter" || key === " ") return selectedTool;
  if (key === "1") return INPUT_TOOLS.BRIGHT;
  if (key === "2") return INPUT_TOOLS.DARK;
  if (["0", "3", "Backspace", "Delete"].includes(key)) return INPUT_TOOLS.ERASE;
  return null;
}
