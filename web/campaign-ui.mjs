import { currentBanquetBeat } from "./campaign-state.mjs";

function regionForId(level, regionId) {
  return level.regions.find((region) => region.id === regionId) ?? null;
}

export function renderBanquetPanel(level, progress, elements) {
  const completedCount = progress.completedRegionIds.length;
  const beat = currentBanquetBeat(level, completedCount);
  elements.progress.textContent = `${completedCount} / ${level.regions.length} 国`;
  elements.heading.textContent = beat?.title ?? "宴席未载入";
  elements.body.textContent = beat?.body ?? "这页档案没有保存宴席记录。";

  const latestRegionId = progress.completedRegionIds.at(-1);
  const latestRegion = latestRegionId === undefined
    ? null
    : regionForId(level, latestRegionId);
  const insert = latestRegion?.country?.banquetInsert ?? "";
  elements.insert.textContent = insert;
  elements.insert.hidden = insert.length === 0;
}

export function renderArchiveList(level, progress, elements, onSelectRegion) {
  elements.list.replaceChildren();
  const archivedRegionIds = progress.revealedRegionIds;
  const archivedCount = archivedRegionIds.length;
  elements.button.disabled = archivedCount === 0;
  elements.buttonLabel.textContent = archivedCount === 0
    ? "地图档案尚未整理"
    : "查看亡国档案";
  elements.count.hidden = archivedCount === 0;
  elements.count.textContent = String(archivedCount);
  elements.count.setAttribute("aria-label", `已归档 ${archivedCount} 个国家`);
  elements.empty.hidden = archivedCount > 0;

  for (const regionId of archivedRegionIds) {
    const region = regionForId(level, regionId);
    if (!region) continue;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "archive-entry";
    button.setAttribute(
      "aria-label",
      `重读${region.name}亡国档案：${region.country.fallCardTitle}`,
    );

    const title = document.createElement("strong");
    title.textContent = region.name;
    const subtitle = document.createElement("span");
    subtitle.textContent = `${region.country.capitalOrFocusCity} · ${region.country.fallCardTitle}`;
    button.append(title, subtitle);
    button.addEventListener("click", () => onSelectRegion(regionId));
    const listItem = document.createElement("div");
    listItem.setAttribute("role", "listitem");
    listItem.append(button);
    elements.list.append(listItem);
  }
}

export function populateFallDialog(level, regionId, elements) {
  const region = regionForId(level, regionId);
  if (!region) return false;

  elements.country.textContent = region.name;
  elements.title.textContent = region.country.fallCardTitle;
  elements.place.textContent = `${region.country.capitalOrFocusCity} · ${region.country.geography}`;
  elements.body.textContent = region.country.fallCardBody;
  elements.trace.textContent = region.country.survivingTrace;
  return true;
}
