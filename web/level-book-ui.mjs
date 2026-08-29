import { isLevelUnlocked, levelEntries } from "./level-book.mjs";

function difficultyLabel(entry, i18n) {
  return i18n.t(`levelBook.difficulty.${entry.difficulty ?? "standard"}`);
}

function statusLabel(entry, progress, unlocked, currentLevelId, i18n) {
  if (progress.completedLevelIds.includes(entry.id)) return i18n.t("levelBook.status.complete");
  if (entry.id === currentLevelId) return i18n.t("levelBook.status.current");
  if (!unlocked) return i18n.t("levelBook.status.locked");
  return i18n.t("levelBook.status.open");
}

export function renderLevelBook(
  manifest,
  progress,
  currentLevelId,
  elements,
  onSelect,
  i18n,
) {
  const entries = levelEntries(manifest);
  const completed = progress.completedLevelIds.length;
  elements.progress.textContent = i18n.t("levelBook.progress", {
    completed,
    total: entries.length,
  });
  elements.buttonCount.textContent = `${completed}/${entries.length}`;
  elements.chapters.replaceChildren();

  for (const chapter of manifest.chapters) {
    const section = document.createElement("section");
    section.className = "level-book-chapter";

    const header = document.createElement("header");
    header.className = "level-book-chapter-header";
    const number = document.createElement("span");
    number.textContent = chapter.number;
    const headingGroup = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = i18n.localize(chapter.title);
    const description = document.createElement("p");
    description.textContent = i18n.localize(chapter.description);
    headingGroup.append(heading, description);
    header.append(number, headingGroup);

    const list = document.createElement("ol");
    list.className = "level-book-list";
    for (const entry of chapter.levels) {
      const unlocked = isLevelUnlocked(manifest, progress, entry.id);
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "level-book-entry";
      button.disabled = !unlocked;
      button.dataset.levelId = entry.id;
      if (entry.id === currentLevelId) button.setAttribute("aria-current", "page");

      const folio = document.createElement("span");
      folio.className = "level-book-entry-folio";
      folio.textContent = entry.folio;
      const copy = document.createElement("span");
      copy.className = "level-book-entry-copy";
      const title = document.createElement("strong");
      title.textContent = i18n.localize(entry.title);
      const summary = document.createElement("span");
      summary.textContent = i18n.localize(entry.summary);
      copy.append(title, summary);
      const meta = document.createElement("span");
      meta.className = "level-book-entry-meta";
      const status = statusLabel(entry, progress, unlocked, currentLevelId, i18n);
      meta.textContent = `${entry.width}×${entry.height} · ${difficultyLabel(entry, i18n)} · ${status}`;
      button.setAttribute(
        "aria-label",
        i18n.t("levelBook.entryAria", {
          title: i18n.localize(entry.title),
          size: `${entry.width}×${entry.height}`,
          difficulty: difficultyLabel(entry, i18n),
          status,
        }),
      );
      button.append(folio, copy, meta);
      if (unlocked) button.addEventListener("click", () => onSelect(entry.id));
      item.append(button);
      list.append(item);
    }

    section.append(header, list);
    elements.chapters.append(section);
  }
}
