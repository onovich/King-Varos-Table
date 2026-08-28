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

export function archiveEntries(
  level,
  progress,
  onSelectRegion = () => {},
  onSelectEpilogue = () => {},
) {
  const entries = (progress.revealedRegionIds ?? [])
    .map((regionId) => {
      const region = regionForId(level, regionId);
      if (!region) return null;
      return {
        kind: "country",
        regionId,
        title: region.name,
        subtitle: `${region.country.capitalOrFocusCity} · ${region.country.fallCardTitle}`,
        ariaLabel: `重读${region.name}亡国档案：${region.country.fallCardTitle}`,
        className: "archive-entry",
        onSelect: () => onSelectRegion(regionId),
      };
    })
    .filter(Boolean);

  const epilogue = level.campaign?.epilogue;
  if (progress.epilogueRevealed && epilogue) {
    entries.push({
      kind: "epilogue",
      title: epilogue.archiveLabel,
      subtitle: epilogue.archiveSummary,
      ariaLabel: `重读后世尾声：${epilogue.archiveSummary}`,
      className: "archive-entry archive-entry-epilogue",
      onSelect: onSelectEpilogue,
    });
  }
  return entries;
}

export function renderArchiveList(
  level,
  progress,
  elements,
  onSelectRegion,
  onSelectEpilogue,
) {
  elements.list.replaceChildren();
  const archivedRegionIds = progress.revealedRegionIds;
  const archivedCount = archivedRegionIds.length;
  elements.button.disabled = archivedCount === 0;
  elements.buttonLabel.textContent = archivedCount === 0
    ? "地图档案尚未整理"
    : progress.epilogueRevealed
      ? "查看完整地图档案"
      : "查看亡国档案";
  elements.count.hidden = archivedCount === 0;
  elements.count.textContent = String(archivedCount);
  elements.count.setAttribute(
    "aria-label",
    progress.epilogueRevealed
      ? `已归档 ${archivedCount} 个国家及后世尾声`
      : `已归档 ${archivedCount} 个国家`,
  );
  elements.empty.hidden = archivedCount > 0;

  for (const entry of archiveEntries(
    level,
    progress,
    onSelectRegion,
    onSelectEpilogue,
  )) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = entry.className;
    button.setAttribute("aria-label", entry.ariaLabel);

    const title = document.createElement("strong");
    title.textContent = entry.title;
    const subtitle = document.createElement("span");
    subtitle.textContent = entry.subtitle;
    button.append(title, subtitle);
    button.addEventListener("click", entry.onSelect);
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

export function populateEpilogueDialog(level, elements) {
  const epilogue = level.campaign?.epilogue;
  if (!epilogue) return false;

  elements.eyebrow.textContent = epilogue.eyebrow;
  elements.title.textContent = epilogue.title;
  elements.body.textContent = epilogue.body;
  elements.trace.textContent = epilogue.survivingTrace;
  return true;
}
