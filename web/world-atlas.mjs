import {
  WORLD_CELL_SIZE,
  WORLD_COLUMNS,
  WORLD_COPY,
  WORLD_COUNTRIES,
  WORLD_ROWS,
  buildWorldCells,
  countryCenter,
  interpolateAtlas,
  localizeAtlas,
  normalizeAtlasLocale,
} from "./world-atlas-data.mjs";

const PAN_STEP = 84;
const DEFAULT_SCALE = 1.08;
const MAX_SCALE = 2.15;
const VIEW_MARGIN = 28;

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function text(key, locale, replacements) {
  return interpolateAtlas(localizeAtlas(WORLD_COPY[key], locale), replacements);
}

function createElement(tagName, className, content = null) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (content !== null) element.textContent = content;
  return element;
}

function mapKey(x, y) {
  return `${x}:${y}`;
}

function sealClass(country) {
  return `seal-${country.seal}`;
}

/**
 * Creates the map-navigation shell. The returned focusCountry and getState
 * methods are intentionally small integration points for the later puzzle
 * layer: a gameplay controller can subscribe to `atlas:countrychange` and
 * mount the country-level board without taking ownership of camera state.
 */
export function createWorldAtlas({
  initialCountryId = null,
  locale = "en",
  onLocaleChange = () => {},
} = {}) {
  const refs = {
    root: document.querySelector("#atlasExperience"),
    tabs: document.querySelector("#atlasCountryTabs"),
    viewport: document.querySelector("#atlasViewport"),
    world: document.querySelector("#atlasWorld"),
    mapKicker: document.querySelector("#atlasMapKicker"),
    mapHeading: document.querySelector("#atlasMapHeading"),
    mapDescription: document.querySelector("#atlasMapDescription"),
    mapHelp: document.querySelector("#atlasMapHelp"),
    mapCurrentCountry: document.querySelector("#atlasCurrentCountry"),
    mapCurrentMeta: document.querySelector("#atlasCurrentMeta"),
    zoomLabel: document.querySelector("#atlasZoomLabel"),
    zoomReadout: document.querySelector("#atlasZoomReadout"),
    resetView: document.querySelector("#atlasResetView"),
    title: document.querySelector("#atlasTitle"),
    subtitle: document.querySelector("#atlasSubtitle"),
    toolKicker: document.querySelector("#atlasToolKicker"),
    hintButton: document.querySelector("#atlasHintButton"),
    checkButton: document.querySelector("#atlasCheckButton"),
    toolStatus: document.querySelector("#atlasToolStatus"),
    toolButtons: [...document.querySelectorAll("[data-atlas-tool]")],
    storyKicker: document.querySelector("#atlasStoryKicker"),
    storyCountry: document.querySelector("#atlasStoryCountry"),
    storyDistrict: document.querySelector("#atlasStoryDistrict"),
    storyPhase: document.querySelector("#atlasStoryPhase"),
    storyTitle: document.querySelector("#atlasStoryTitle"),
    storyBody: document.querySelector("#atlasStoryBody"),
    storyProgress: document.querySelector("#atlasStoryProgress"),
    storyTimeline: document.querySelector("#atlasStoryTimeline"),
    eventPrevious: document.querySelector("#atlasEventPrevious"),
    eventNext: document.querySelector("#atlasEventNext"),
    playLayer: document.querySelector("#atlasPlayLayer"),
    announcer: document.querySelector("#atlasAnnouncer"),
    languageButtons: [...document.querySelectorAll("[data-atlas-locale]")],
  };

  const required = [refs.root, refs.tabs, refs.viewport, refs.world];
  if (required.some((reference) => !reference)) {
    throw new Error("World atlas markup is incomplete.");
  }

  const countriesById = new Map(WORLD_COUNTRIES.map((country) => [country.id, country]));
  const worldCells = buildWorldCells();
  const cellsByCoordinate = new Map(
    worldCells
      .filter(Boolean)
      .map((cell) => [mapKey(cell.x, cell.y), cell]),
  );
  const centers = new Map(
    WORLD_COUNTRIES.map((country) => [country.id, countryCenter(country, worldCells)]),
  );
  const cellsByCountry = new Map(WORLD_COUNTRIES.map((country) => [country.id, []]));
  const labelsByCountry = new Map();
  const tabButtons = new Map();

  const requestedCountry = countriesById.has(initialCountryId)
    ? initialCountryId
    : WORLD_COUNTRIES[0].id;
  const state = {
    locale: normalizeAtlasLocale(locale),
    activeCountryId: requestedCountry,
    activeTool: "bright",
    eventIndexByCountry: new Map(WORLD_COUNTRIES.map((country) => [country.id, 0])),
    scale: DEFAULT_SCALE,
    offsetX: 0,
    offsetY: 0,
    pointerDrag: null,
    resizeObserver: null,
    pendingCountrySync: 0,
  };

  function activeCountry() {
    return countriesById.get(state.activeCountryId) ?? WORLD_COUNTRIES[0];
  }

  function countryCellAt(worldX, worldY) {
    const x = Math.floor(worldX / WORLD_CELL_SIZE);
    const y = Math.floor(worldY / WORLD_CELL_SIZE);
    return cellsByCoordinate.get(mapKey(x, y)) ?? null;
  }

  function minimumScale() {
    const rectangle = refs.viewport.getBoundingClientRect();
    const worldWidth = WORLD_COLUMNS * WORLD_CELL_SIZE;
    const worldHeight = WORLD_ROWS * WORLD_CELL_SIZE;
    const widthScale = rectangle.width / worldWidth;
    const heightScale = rectangle.height / worldHeight;
    return Math.max(0.44, Math.max(widthScale, heightScale) * 1.04);
  }

  function clampOffset(offsetX, offsetY) {
    const rectangle = refs.viewport.getBoundingClientRect();
    const worldWidth = WORLD_COLUMNS * WORLD_CELL_SIZE * state.scale;
    const worldHeight = WORLD_ROWS * WORLD_CELL_SIZE * state.scale;

    const clampAxis = (offset, viewportSize, contentSize) => {
      if (contentSize <= viewportSize - VIEW_MARGIN * 2) {
        return (viewportSize - contentSize) / 2;
      }
      return clamp(
        offset,
        viewportSize - contentSize - VIEW_MARGIN,
        VIEW_MARGIN,
      );
    };

    return {
      x: clampAxis(offsetX, rectangle.width, worldWidth),
      y: clampAxis(offsetY, rectangle.height, worldHeight),
    };
  }

  function renderTransform() {
    const clamped = clampOffset(state.offsetX, state.offsetY);
    state.offsetX = clamped.x;
    state.offsetY = clamped.y;
    refs.world.style.transform = `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`;
    refs.zoomReadout.textContent = `${Math.round(state.scale * 100)}%`;
  }

  function viewportCenterWorldPoint() {
    const rectangle = refs.viewport.getBoundingClientRect();
    return {
      x: (rectangle.width / 2 - state.offsetX) / state.scale,
      y: (rectangle.height / 2 - state.offsetY) / state.scale,
    };
  }

  function centerOnWorldPoint(point) {
    const rectangle = refs.viewport.getBoundingClientRect();
    state.offsetX = rectangle.width / 2 - point.x * state.scale;
    state.offsetY = rectangle.height / 2 - point.y * state.scale;
    renderTransform();
  }

  function countryCenterPoint(countryId) {
    const center = centers.get(countryId) ?? centers.get(WORLD_COUNTRIES[0].id);
    return {
      x: (center.x + 0.5) * WORLD_CELL_SIZE,
      y: (center.y + 0.5) * WORLD_CELL_SIZE,
    };
  }

  function renderTabState() {
    for (const [countryId, button] of tabButtons) {
      const selected = countryId === state.activeCountryId;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
  }

  function renderMapState() {
    for (const [countryId, elements] of cellsByCountry) {
      const selected = countryId === state.activeCountryId;
      for (const element of elements) element.classList.toggle("is-active-country", selected);
      labelsByCountry.get(countryId)?.classList.toggle("is-active-country", selected);
    }

    const country = activeCountry();
    refs.mapCurrentCountry.textContent = localizeAtlas(country.name, state.locale);
    refs.mapCurrentMeta.textContent = `${localizeAtlas(country.mapNote, state.locale)} · ${country.districts.length} ${text("districtCount", state.locale)}`;
  }

  function renderStory() {
    const country = activeCountry();
    const eventIndex = state.eventIndexByCountry.get(country.id) ?? 0;
    const event = country.events[eventIndex];
    const accent = country.accent;

    refs.root.style.setProperty("--atlas-active-accent", accent);
    refs.storyCountry.textContent = localizeAtlas(country.name, state.locale);
    refs.storyDistrict.textContent = `${localizeAtlas(country.shortName, state.locale)} · ${localizeAtlas(country.districts[eventIndex % country.districts.length], state.locale)}`;
    refs.storyPhase.textContent = localizeAtlas(event.phase, state.locale);
    refs.storyTitle.textContent = localizeAtlas(event.title, state.locale);
    refs.storyBody.textContent = localizeAtlas(event.body, state.locale);
    refs.storyProgress.textContent = text("eventOf", state.locale, {
      current: eventIndex + 1,
      total: country.events.length,
    });
    refs.eventPrevious.disabled = eventIndex === 0;
    refs.eventNext.disabled = eventIndex === country.events.length - 1;
    refs.eventPrevious.setAttribute("aria-label", text("previousEvent", state.locale));
    refs.eventNext.setAttribute("aria-label", text("nextEvent", state.locale));

    refs.storyTimeline.replaceChildren();
    country.events.forEach((entry, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "atlas-story-step";
      button.classList.toggle("is-current", index === eventIndex);
      button.setAttribute("aria-current", index === eventIndex ? "step" : "false");
      button.setAttribute(
        "aria-label",
        `${localizeAtlas(entry.phase, state.locale)} · ${localizeAtlas(entry.title, state.locale)}`,
      );
      button.addEventListener("click", () => {
        state.eventIndexByCountry.set(country.id, index);
        renderStory();
      });
      refs.storyTimeline.append(button);
    });
  }

  function announce(message) {
    refs.announcer.textContent = "";
    requestAnimationFrame(() => {
      refs.announcer.textContent = message;
    });
  }

  function updateCountryUrl(countryId) {
    const url = new URL(window.location.href);
    url.searchParams.delete("mode");
    url.searchParams.set("country", countryId);
    window.history.replaceState({}, "", url);
  }

  function selectCountry(countryId, { center = false, announceChange = false } = {}) {
    if (!countriesById.has(countryId)) return false;
    const changed = countryId !== state.activeCountryId;
    state.activeCountryId = countryId;
    renderTabState();
    renderMapState();
    renderStory();
    if (center) centerOnWorldPoint(countryCenterPoint(countryId));

    if (changed) {
      const country = activeCountry();
      updateCountryUrl(country.id);
      refs.root.dispatchEvent(new CustomEvent("atlas:countrychange", {
        bubbles: true,
        detail: {
          countryId: country.id,
          country,
          source: center ? "tab" : "map",
        },
      }));
      if (announceChange) {
        announce(text("movedTo", state.locale, {
          country: localizeAtlas(country.name, state.locale),
        }));
      }
    }
    return true;
  }

  function syncCountryToViewport() {
    state.pendingCountrySync = 0;
    const cell = countryCellAt(
      viewportCenterWorldPoint().x,
      viewportCenterWorldPoint().y,
    );
    if (cell && cell.countryId !== state.activeCountryId) {
      selectCountry(cell.countryId, { announceChange: true });
    }
  }

  function queueViewportCountrySync() {
    if (state.pendingCountrySync) return;
    state.pendingCountrySync = requestAnimationFrame(syncCountryToViewport);
  }

  function selectTool(tool) {
    if (!["bright", "dark", "erase"].includes(tool)) return;
    state.activeTool = tool;
    for (const button of refs.toolButtons) {
      const selected = button.dataset.atlasTool === tool;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
    const key = tool === "bright" ? "bright" : tool === "dark" ? "dark" : "erase";
    const toolLabel = text(key, state.locale);
    const message = text("selectedTool", state.locale, { tool: toolLabel });
    refs.toolStatus.textContent = message;
    announce(message);
  }

  function renderCopy() {
    document.documentElement.lang = state.locale;
    refs.title.textContent = text("title", state.locale);
    refs.subtitle.textContent = text("subtitle", state.locale);
    refs.mapKicker.textContent = text("mapKicker", state.locale);
    refs.mapHeading.textContent = text("mapTitle", state.locale);
    refs.mapDescription.textContent = text("mapDescription", state.locale);
    refs.mapHelp.textContent = text("mapHelp", state.locale);
    refs.zoomLabel.textContent = text("zoom", state.locale);
    refs.resetView.textContent = text("resetView", state.locale);
    refs.toolKicker.textContent = text("toolKicker", state.locale);
    refs.hintButton.textContent = text("hint", state.locale);
    refs.checkButton.textContent = text("check", state.locale);
    refs.storyKicker.textContent = text("storyKicker", state.locale);
    refs.playLayer.textContent = text("playLayer", state.locale);
    refs.viewport.setAttribute("aria-label", text("worldLabel", state.locale));
    refs.viewport.setAttribute("aria-description", text("worldHelp", state.locale));

    for (const button of refs.toolButtons) {
      const label = button.querySelector("[data-atlas-tool-label]");
      if (label) label.textContent = text(button.dataset.atlasTool, state.locale);
    }
    for (const button of refs.languageButtons) {
      const buttonLocale = button.dataset.atlasLocale;
      button.setAttribute("aria-pressed", String(buttonLocale === state.locale));
    }
    for (const country of WORLD_COUNTRIES) {
      const label = labelsByCountry.get(country.id);
      if (!label) continue;
      const [name, detail] = label.children;
      if (name) name.textContent = localizeAtlas(country.name, state.locale);
      if (detail) detail.textContent = localizeAtlas(country.shortName, state.locale);
    }
    renderTabs();
    renderMapState();
    renderStory();
    selectTool(state.activeTool);
  }

  function renderTabs() {
    refs.tabs.replaceChildren();
    tabButtons.clear();
    for (const country of WORLD_COUNTRIES) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "atlas-country-tab";
      button.dataset.countryId = country.id;
      button.style.setProperty("--seal-accent", country.accent);
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "atlasViewport");
      button.setAttribute(
        "aria-label",
        `${text("marker", state.locale)} · ${localizeAtlas(country.name, state.locale)} · ${localizeAtlas(country.shortName, state.locale)}`,
      );
      button.title = `${localizeAtlas(country.name, state.locale)} · ${localizeAtlas(country.sealLabel, state.locale)}`;
      const seal = createElement("span", `atlas-country-seal ${sealClass(country)}`);
      seal.setAttribute("aria-hidden", "true");
      const name = createElement("span", "atlas-country-tab-name", localizeAtlas(country.name, state.locale));
      button.append(seal, name);
      button.addEventListener("click", () => selectCountry(country.id, {
        center: true,
        announceChange: true,
      }));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const currentIndex = WORLD_COUNTRIES.findIndex((item) => item.id === country.id);
        let nextIndex = currentIndex;
        if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + WORLD_COUNTRIES.length) % WORLD_COUNTRIES.length;
        if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % WORLD_COUNTRIES.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = WORLD_COUNTRIES.length - 1;
        const nextCountry = WORLD_COUNTRIES[nextIndex];
        selectCountry(nextCountry.id, { center: true, announceChange: true });
        tabButtons.get(nextCountry.id)?.focus();
      });
      tabButtons.set(country.id, button);
      refs.tabs.append(button);
    }
    renderTabState();
  }

  function renderWorld() {
    refs.world.style.setProperty("--world-columns", WORLD_COLUMNS);
    refs.world.style.setProperty("--world-rows", WORLD_ROWS);
    refs.world.style.setProperty("--world-cell-size", `${WORLD_CELL_SIZE}px`);
    const fragment = document.createDocumentFragment();

    for (let y = 0; y < WORLD_ROWS; y += 1) {
      for (let x = 0; x < WORLD_COLUMNS; x += 1) {
        const cellData = cellsByCoordinate.get(mapKey(x, y));
        const cell = createElement("span", "atlas-world-cell");
        cell.style.gridColumnStart = String(x + 1);
        cell.style.gridRowStart = String(y + 1);
        if (cellData) {
          const country = countriesById.get(cellData.countryId);
          const north = cellsByCoordinate.get(mapKey(x, y - 1));
          const west = cellsByCoordinate.get(mapKey(x - 1, y));
          const east = cellsByCoordinate.get(mapKey(x + 1, y));
          const south = cellsByCoordinate.get(mapKey(x, y + 1));
          cell.classList.add("is-land", `country-${country.id}`);
          cell.dataset.countryId = country.id;
          cell.dataset.districtIndex = String(cellData.districtIndex);
          cell.style.setProperty("--country-accent", country.accent);
          cell.style.setProperty("--district-index", String(cellData.districtIndex));

          const hasSameCountry = (neighbor) => neighbor?.countryId === country.id;
          const hasSameDistrict = (neighbor) => hasSameCountry(neighbor)
            && neighbor.districtIndex === cellData.districtIndex;
          if (!hasSameCountry(north)) cell.classList.add("country-edge-top");
          else if (!hasSameDistrict(north)) cell.classList.add("district-edge-top");
          if (!hasSameCountry(west)) cell.classList.add("country-edge-left");
          else if (!hasSameDistrict(west)) cell.classList.add("district-edge-left");
          if (!hasSameCountry(east)) cell.classList.add("country-edge-right");
          if (!hasSameCountry(south)) cell.classList.add("country-edge-bottom");
          cellsByCountry.get(country.id).push(cell);
        } else {
          cell.classList.add("is-sea");
        }
        fragment.append(cell);
      }
    }

    for (const country of WORLD_COUNTRIES) {
      const center = centers.get(country.id);
      const label = createElement("span", "atlas-country-label");
      label.dataset.countryId = country.id;
      label.style.left = `${(center.x + 0.5) * WORLD_CELL_SIZE}px`;
      label.style.top = `${(center.y + 0.5) * WORLD_CELL_SIZE}px`;
      label.append(
        createElement("strong", null, localizeAtlas(country.name, state.locale)),
        createElement("small", null, localizeAtlas(country.shortName, state.locale)),
      );
      labelsByCountry.set(country.id, label);
      fragment.append(label);
    }

    refs.world.replaceChildren(fragment);
    renderMapState();
  }

  function panBy(deltaX, deltaY) {
    state.offsetX += deltaX;
    state.offsetY += deltaY;
    renderTransform();
    queueViewportCountrySync();
  }

  function zoomAt(clientX, clientY, factor) {
    const rectangle = refs.viewport.getBoundingClientRect();
    const viewportX = clientX - rectangle.left;
    const viewportY = clientY - rectangle.top;
    const worldX = (viewportX - state.offsetX) / state.scale;
    const worldY = (viewportY - state.offsetY) / state.scale;
    state.scale = clamp(state.scale * factor, minimumScale(), MAX_SCALE);
    state.offsetX = viewportX - worldX * state.scale;
    state.offsetY = viewportY - worldY * state.scale;
    renderTransform();
    queueViewportCountrySync();
  }

  function handleWheel(event) {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAt(event.clientX, event.clientY, factor);
  }

  function handlePointerDown(event) {
    if (![0, 1].includes(event.button)) return;
    refs.viewport.setPointerCapture?.(event.pointerId);
    state.pointerDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: state.offsetX,
      offsetY: state.offsetY,
      moved: false,
    };
    refs.viewport.classList.add("is-panning");
  }

  function handlePointerMove(event) {
    const drag = state.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) drag.moved = true;
    state.offsetX = drag.offsetX + deltaX;
    state.offsetY = drag.offsetY + deltaY;
    renderTransform();
    queueViewportCountrySync();
  }

  function handlePointerEnd(event) {
    const drag = state.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    state.pointerDrag = null;
    refs.viewport.classList.remove("is-panning");
    if (refs.viewport.hasPointerCapture?.(event.pointerId)) {
      refs.viewport.releasePointerCapture(event.pointerId);
    }
    if (drag.moved) return;
    const rectangle = refs.viewport.getBoundingClientRect();
    const cell = countryCellAt(
      (event.clientX - rectangle.left - state.offsetX) / state.scale,
      (event.clientY - rectangle.top - state.offsetY) / state.scale,
    );
    if (cell) selectCountry(cell.countryId, { announceChange: true });
  }

  function handleMapKeydown(event) {
    if (["+", "="].includes(event.key)) {
      event.preventDefault();
      const rectangle = refs.viewport.getBoundingClientRect();
      zoomAt(rectangle.left + rectangle.width / 2, rectangle.top + rectangle.height / 2, 1.12);
      return;
    }
    if (["-", "_"].includes(event.key)) {
      event.preventDefault();
      const rectangle = refs.viewport.getBoundingClientRect();
      zoomAt(rectangle.left + rectangle.width / 2, rectangle.top + rectangle.height / 2, 1 / 1.12);
      return;
    }
    if (event.key === "0") {
      event.preventDefault();
      state.scale = Math.max(minimumScale(), DEFAULT_SCALE);
      centerOnWorldPoint(countryCenterPoint(state.activeCountryId));
      return;
    }
    const moves = {
      ArrowLeft: [-PAN_STEP, 0],
      ArrowRight: [PAN_STEP, 0],
      ArrowUp: [0, -PAN_STEP],
      ArrowDown: [0, PAN_STEP],
    };
    if (moves[event.key]) {
      event.preventDefault();
      panBy(...moves[event.key]);
    }
  }

  function resizeWorld() {
    const point = viewportCenterWorldPoint();
    state.scale = Math.max(state.scale, minimumScale());
    centerOnWorldPoint(point);
  }

  function bindEvents() {
    refs.viewport.addEventListener("wheel", handleWheel, { passive: false });
    refs.viewport.addEventListener("pointerdown", handlePointerDown);
    refs.viewport.addEventListener("pointermove", handlePointerMove);
    refs.viewport.addEventListener("pointerup", handlePointerEnd);
    refs.viewport.addEventListener("pointercancel", handlePointerEnd);
    refs.viewport.addEventListener("lostpointercapture", handlePointerEnd);
    refs.viewport.addEventListener("keydown", handleMapKeydown);
    refs.resetView.addEventListener("click", () => {
      state.scale = Math.max(minimumScale(), DEFAULT_SCALE);
      centerOnWorldPoint(countryCenterPoint(state.activeCountryId));
      announce(text("movedTo", state.locale, {
        country: localizeAtlas(activeCountry().name, state.locale),
      }));
    });
    for (const button of refs.toolButtons) {
      button.addEventListener("click", () => selectTool(button.dataset.atlasTool));
    }
    refs.hintButton.addEventListener("click", () => {
      const message = text("checkMessage", state.locale);
      refs.toolStatus.textContent = message;
      announce(message);
    });
    refs.checkButton.addEventListener("click", () => {
      const message = text("checkMessage", state.locale);
      refs.toolStatus.textContent = message;
      announce(message);
    });
    refs.eventPrevious.addEventListener("click", () => {
      const country = activeCountry();
      const current = state.eventIndexByCountry.get(country.id) ?? 0;
      if (current === 0) return;
      state.eventIndexByCountry.set(country.id, current - 1);
      renderStory();
    });
    refs.eventNext.addEventListener("click", () => {
      const country = activeCountry();
      const current = state.eventIndexByCountry.get(country.id) ?? 0;
      if (current >= country.events.length - 1) return;
      state.eventIndexByCountry.set(country.id, current + 1);
      renderStory();
    });
    for (const button of refs.languageButtons) {
      button.addEventListener("click", () => onLocaleChange(button.dataset.atlasLocale));
    }
    if ("ResizeObserver" in window) {
      state.resizeObserver = new ResizeObserver(resizeWorld);
      state.resizeObserver.observe(refs.viewport);
    } else {
      window.addEventListener("resize", resizeWorld);
    }
  }

  function setLocale(nextLocale) {
    state.locale = normalizeAtlasLocale(nextLocale);
    renderCopy();
  }

  function focusCountry(countryId, { scale = null } = {}) {
    if (!countriesById.has(countryId)) return false;
    if (Number.isFinite(scale)) {
      state.scale = clamp(scale, minimumScale(), MAX_SCALE);
    }
    selectCountry(countryId, { center: true, announceChange: true });
    return true;
  }

  function getState() {
    return {
      activeCountryId: state.activeCountryId,
      activeTool: state.activeTool,
      scale: state.scale,
      eventIndexByCountry: Object.fromEntries(state.eventIndexByCountry),
    };
  }

  renderWorld();
  bindEvents();
  renderCopy();
  state.scale = Math.max(minimumScale(), DEFAULT_SCALE);
  centerOnWorldPoint(countryCenterPoint(state.activeCountryId));

  return Object.freeze({
    focusCountry,
    getState,
    setLocale,
    destroy() {
      state.resizeObserver?.disconnect();
      if (state.pendingCountrySync) cancelAnimationFrame(state.pendingCountrySync);
    },
  });
}
