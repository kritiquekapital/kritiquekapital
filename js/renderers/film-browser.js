import { escapeHTML }          from "../utils.js";
import { track }               from "../analytics.js";
import { activeSection }       from "../state.js";
import {
  filmCollectionRegistry,
  getFilmBrowserState,
  initSlideshows,
  initPosterStudies,
  updateSlideDescriptionModules
} from "./slideshow.js";

// Circular import with module.js — safe because renderModule is only ever
// called inside function bodies, never at module-evaluation time.
import { renderModule } from "./module.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCollectionModuleById(collection, id) {
  return (collection.modules ?? []).find(m => m.id === id) ?? null;
}

// ── Render: collection content grid ──────────────────────────────────────────

export function renderFilmCollectionModules(collection, parentKey) {
  const modules  = Array.isArray(collection.modules) ? collection.modules : [];
  const layout   = Array.isArray(collection.layout)  ? collection.layout  : [];
  const keyPrefix = `${parentKey}collection-${collection.id}-`;

  if (!layout.length) {
    return modules
      .map((module, moduleIndex) => renderModule(module, "film", moduleIndex, keyPrefix))
      .join("");
  }

  let fallbackIndex = 0;

  return layout
    .map((row, rowIndex) => {
      const rowCells = Array.isArray(row) ? row : [row];

      // single-cell row  OR  both cells reference the same module → span full width
      if (rowCells.length === 1 || (rowCells.length === 2 && rowCells[0] === rowCells[1])) {
        const moduleId = rowCells[0];
        const module   = getCollectionModuleById(collection, moduleId);
        if (!module) return "";

        return `
          <div
            class="film-collection-cell film-collection-span-2"
            data-row-index="${rowIndex}"
            data-module-id="${escapeHTML(moduleId)}"
          >
            ${renderModule(module, "film", fallbackIndex++, keyPrefix)}
          </div>
        `;
      }

      return rowCells
        .map(moduleId => {
          const module = getCollectionModuleById(collection, moduleId);
          if (!module) return "";

          return `
            <div
              class="film-collection-cell"
              data-row-index="${rowIndex}"
              data-module-id="${escapeHTML(moduleId)}"
            >
              ${renderModule(module, "film", fallbackIndex++, keyPrefix)}
            </div>
          `;
        })
        .join("");
    })
    .join("");
}

// ── Render: film collection browser ──────────────────────────────────────────

export function renderFilmCollectionBrowserModule(module, section, moduleIndex) {
  const collections = Array.isArray(module.collections) ? module.collections : [];
  const browserKey  = `${section}-film-browser-${moduleIndex}`;

  filmCollectionRegistry.set(browserKey, {
    key: browserKey,
    collections,
    activeCollectionIndex: 0
  });

  const firstCollection = collections[0] ?? null;

  return `
    <section
      class="module film-collection-browser"
      data-film-browser-key="${escapeHTML(browserKey)}"
      data-active-collection-id="${escapeHTML(firstCollection?.id ?? "")}"
    >
      <div class="module-inner">
        <div class="film-collection-header">
          <h3 class="module-title">${escapeHTML(module.title ?? "")}</h3>
          ${module.description
            ? `<p class="film-collection-description">${escapeHTML(module.description)}</p>`
            : ""}
        </div>
      </div>

      <div class="film-collection-tabs-wrap">
        <div
          class="film-collection-tabs"
          role="tablist"
          aria-label="${escapeHTML(module.title ?? "film collections")}"
        >
          ${collections
            .map(
              (collection, index) => `
              <button
                class="film-collection-tab ${index === 0 ? "is-active" : ""}"
                type="button"
                role="tab"
                aria-selected="${index === 0 ? "true" : "false"}"
                data-collection-index="${index}"
              >
                ${escapeHTML(collection.label ?? `collection ${index + 1}`)}
              </button>
            `
            )
            .join("")}
        </div>
      </div>

      <div class="film-collection-stage">
        <div class="film-collection-shell">
          <div class="film-collection-intro">
            ${firstCollection?.eyebrow
              ? `<p class="film-collection-eyebrow">${escapeHTML(firstCollection.eyebrow)}</p>`
              : ""}
            <h4 class="film-collection-title">${escapeHTML(firstCollection?.title ?? "")}</h4>
            ${firstCollection?.dek
              ? `<p class="film-collection-dek">${escapeHTML(firstCollection.dek)}</p>`
              : ""}
          </div>
          <div class="film-collection-content">
            ${firstCollection
              ? renderFilmCollectionModules(firstCollection, `${browserKey}-`)
              : ""}
          </div>
        </div>
      </div>
    </section>
  `;
}

// ── UI update ─────────────────────────────────────────────────────────────────

export function updateFilmCollectionBrowser(moduleEl) {
  if (!moduleEl) return;

  const key   = moduleEl.dataset.filmBrowserKey;
  const state = getFilmBrowserState(key);
  if (!state) return;

  const collection = state.collections[state.activeCollectionIndex];
  if (!collection) return;

  const introEl   = moduleEl.querySelector(".film-collection-intro");
  const contentEl = moduleEl.querySelector(".film-collection-content");
  const tabs      = [...moduleEl.querySelectorAll(".film-collection-tab")];

  moduleEl.dataset.activeCollectionId = collection.id ?? "";

  if (introEl) {
    introEl.innerHTML = `
      ${collection.eyebrow
        ? `<p class="film-collection-eyebrow">${escapeHTML(collection.eyebrow)}</p>`
        : ""}
      <h4 class="film-collection-title">${escapeHTML(collection.title ?? "")}</h4>
      ${collection.dek
        ? `<p class="film-collection-dek">${escapeHTML(collection.dek)}</p>`
        : ""}
    `;
  }

  if (contentEl) {
    contentEl.innerHTML = renderFilmCollectionModules(collection, `${key}-`);
  }

  tabs.forEach((tab, index) => {
    const isActive = index === state.activeCollectionIndex;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  initPosterStudies(moduleEl);
  initSlideshows(moduleEl);
  updateSlideDescriptionModules(moduleEl);
}

// ── Switch + init ─────────────────────────────────────────────────────────────

export function switchFilmCollection(moduleEl, nextCollectionIndex) {
  if (!moduleEl) return;

  const key   = moduleEl.dataset.filmBrowserKey;
  const state = getFilmBrowserState(key);
  if (!state || !state.collections[nextCollectionIndex]) return;

  state.activeCollectionIndex = nextCollectionIndex;
  updateFilmCollectionBrowser(moduleEl);

  track("film_collection_change", {
    section:    activeSection ?? "unknown",
    browser:    key,
    collection: state.collections[nextCollectionIndex]?.id ?? nextCollectionIndex
  });
}

export function initFilmCollectionBrowsers(scope = document) {
  [...scope.querySelectorAll(".film-collection-browser")].forEach(moduleEl => {
    if (moduleEl.dataset.filmBrowserBound !== "true") {
      [...moduleEl.querySelectorAll(".film-collection-tab")].forEach(tab => {
        tab.addEventListener("click", () =>
          switchFilmCollection(moduleEl, Number(tab.dataset.collectionIndex))
        );
      });
      moduleEl.dataset.filmBrowserBound = "true";
    }

    updateFilmCollectionBrowser(moduleEl);
  });
}
