import { currentBanquetBeat } from "./campaign-state.mjs";

function regionForId(level, regionId) {
  return level.regions.find((region) => region.id === regionId) ?? null;
}

export function renderBanquetPanel(level, progress, elements, i18n) {
  const completedCount = progress.completedRegionIds.length;
  const beat = currentBanquetBeat(level, completedCount);
  elements.progress.textContent = i18n.t("banquet.progress", {
    completed: completedCount,
    total: level.regions.length,
  });
  elements.heading.textContent = beat
    ? i18n.localize(beat.title)
    : i18n.t("banquet.missingTitle");
  elements.body.textContent = beat
    ? i18n.localize(beat.body)
    : i18n.t("banquet.missingBody");

  const latestRegionId = progress.completedRegionIds.at(-1);
  const latestRegion = latestRegionId === undefined
    ? null
    : regionForId(level, latestRegionId);
  const insert = i18n.localize(latestRegion?.country?.banquetInsert);
  elements.insert.textContent = insert;
  elements.insert.hidden = insert.length === 0;
}

export function archiveEntries(
  level,
  progress,
  onSelectRegion = () => {},
  onSelectEpilogue = () => {},
  i18n,
) {
  const entries = (progress.revealedRegionIds ?? [])
    .map((regionId) => {
      const region = regionForId(level, regionId);
      if (!region) return null;
      const countryName = i18n.localize(region.name);
      const city = i18n.localize(region.country.capitalOrFocusCity);
      const fallTitle = i18n.localize(region.country.fallCardTitle);
      return {
        kind: "country",
        regionId,
        title: countryName,
        subtitle: `${city} · ${fallTitle}`,
        ariaLabel: i18n.t("archive.replayCountry", {
          country: countryName,
          title: fallTitle,
        }),
        className: "archive-entry",
        onSelect: () => onSelectRegion(regionId),
      };
    })
    .filter(Boolean);

  const epilogue = level.campaign?.epilogue;
  if (progress.epilogueRevealed && epilogue) {
    entries.push({
      kind: "epilogue",
      title: i18n.localize(epilogue.archiveLabel),
      subtitle: i18n.localize(epilogue.archiveSummary),
      ariaLabel: i18n.t("archive.replayEpilogue", {
        summary: i18n.localize(epilogue.archiveSummary),
      }),
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
  i18n,
) {
  elements.list.replaceChildren();
  const archivedRegionIds = progress.revealedRegionIds;
  const archivedCount = archivedRegionIds.length;
  elements.button.disabled = archivedCount === 0;
  elements.buttonLabel.textContent = archivedCount === 0
    ? i18n.t("archive.buttonEmpty")
    : progress.epilogueRevealed
      ? i18n.t("archive.buttonComplete")
      : i18n.t("archive.buttonRecords");
  elements.count.hidden = archivedCount === 0;
  elements.count.textContent = String(archivedCount);
  elements.count.setAttribute(
    "aria-label",
    progress.epilogueRevealed
      ? i18n.t("archive.countWithEpilogue", { count: archivedCount })
      : i18n.t("archive.countCountries", { count: archivedCount }),
  );
  elements.empty.hidden = archivedCount > 0;

  for (const entry of archiveEntries(
    level,
    progress,
    onSelectRegion,
    onSelectEpilogue,
    i18n,
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

export function populateFallDialog(level, regionId, elements, i18n) {
  const region = regionForId(level, regionId);
  if (!region) return false;

  elements.country.textContent = i18n.localize(region.name);
  elements.title.textContent = i18n.localize(region.country.fallCardTitle);
  elements.place.textContent = `${i18n.localize(region.country.capitalOrFocusCity)} · ${i18n.localize(region.country.geography)}`;
  elements.body.textContent = i18n.localize(region.country.fallCardBody);
  elements.trace.textContent = i18n.localize(region.country.survivingTrace);
  return true;
}

export function populateEpilogueDialog(level, elements, i18n) {
  const epilogue = level.campaign?.epilogue;
  if (!epilogue) return false;

  elements.eyebrow.textContent = i18n.localize(epilogue.eyebrow);
  elements.title.textContent = i18n.localize(epilogue.title);
  elements.body.textContent = i18n.localize(epilogue.body);
  elements.trace.textContent = i18n.localize(epilogue.survivingTrace);
  return true;
}
