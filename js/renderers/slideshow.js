import { escapeHTML, preloadImage } from "../utils.js";
import { track }                    from "../analytics.js";
import { activeSection }            from "../state.js";

// ── Registries ────────────────────────────────────────────────────────────────

export const slideshowRegistry      = new Map();
export const posterStudyRegistry    = new Map();
export const filmCollectionRegistry = new Map();

export function clearRegistries() {
  slideshowRegistry.clear();
  posterStudyRegistry.clear();
  filmCollectionRegistry.clear();
}

// ── State getters ─────────────────────────────────────────────────────────────

export function getSlideshowState(key)   { return slideshowRegistry.get(key)      ?? null; }
export function getPosterStudyState(key) { return posterStudyRegistry.get(key)    ?? null; }
export function getFilmBrowserState(key) { return filmCollectionRegistry.get(key) ?? null; }

export function getSeriesForState(state) {
  if (!state) return null;
  return state.series[state.activeSeriesIndex] ?? null;
}

export function normalizeSlideIndex(series, index) {
  const total = series?.slides?.length ?? 0;
  if (!total) return 0;
  return ((index % total) + total) % total;
}

export function normalizePosterIndex(total, index) {
  if (!total) return 0;
  return ((index % total) + total) % total;
}

// ── Media element factory ─────────────────────────────────────────────────────

export function createSlideshowMediaElement(slide = {}) {
  if (slide.mediaType === "video" && slide.videoSrc) {
    const video = document.createElement("video");
    video.className = "slideshow-media";
    video.controls  = true;
    video.preload   = "metadata";
    if (slide.poster) video.poster = slide.poster;

    const source = document.createElement("source");
    source.src = slide.videoSrc;
    video.appendChild(source);
    return video;
  }

  const img = document.createElement("img");
  img.className = "slideshow-media";
  img.src       = slide.src ?? "";
  img.alt       = slide.alt ?? slide.pieceTitle ?? "slide image";
  img.loading   = "lazy";
  img.decoding  = "async";
  return img;
}

// ── Render: poster study ──────────────────────────────────────────────────────

export function renderPosterStudyFacts(slide = {}) {
  const facts = Array.isArray(slide.facts) ? slide.facts : [];
  if (!facts.length) return `<div class="poster-study-facts"></div>`;

  return `
    <div class="poster-study-facts">
      ${facts
        .map(
          fact => `
          <div class="poster-study-fact">
            <p class="poster-study-fact-label">${escapeHTML(fact.label ?? "")}</p>
            <p class="poster-study-fact-value">${escapeHTML(fact.value ?? "")}</p>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

export function renderPosterStudyModule(module, keyPrefix, moduleIndex) {
  const key    = `${keyPrefix}poster-study-${moduleIndex}`;
  const slides = Array.isArray(module.slides) ? module.slides : [];

  posterStudyRegistry.set(key, { key, slides, activeSlideIndex: 0 });

  const firstSlide = slides[0] ?? null;

  return `
    <section
      class="module poster-study-module"
      data-poster-study-key="${escapeHTML(key)}"
      tabindex="0"
    >
      <div class="poster-study-stage">
        <div class="poster-study-poster-pane">
          <div class="poster-study-image-shell">
            ${firstSlide
              ? `<img
                   class="poster-study-image"
                   src="${escapeHTML(firstSlide.src ?? "")}"
                   alt="${escapeHTML(firstSlide.alt ?? firstSlide.pieceTitle ?? "")}"
                   loading="lazy"
                 >`
              : `<div class="slideshow-empty">add poster image</div>`}

            <button class="poster-study-arrow poster-study-arrow-left" type="button" aria-label="Previous poster">
              <span aria-hidden="true">‹</span>
            </button>
            <button class="poster-study-arrow poster-study-arrow-right" type="button" aria-label="Next poster">
              <span aria-hidden="true">›</span>
            </button>

            <div class="poster-study-counter">
              <span class="poster-study-counter-current">1</span>
              <span class="poster-study-counter-separator">/</span>
              <span class="poster-study-counter-total">${slides.length}</span>
            </div>
          </div>

          <div class="poster-study-release">
            <p class="poster-study-release-title">release</p>
            ${renderPosterStudyFacts(firstSlide)}
          </div>
        </div>

        <div class="poster-study-copy">
          ${module.kicker ? `<p class="poster-study-eyebrow">${escapeHTML(module.kicker)}</p>` : ""}
          ${module.title  ? `<h3 class="poster-study-title">${escapeHTML(module.title)}</h3>`  : ""}
          <p class="poster-study-current">${escapeHTML(firstSlide?.pieceTitle ?? "")}</p>

          <article class="poster-study-text-card">
            <h4 class="poster-study-text-card-title">background</h4>
            <p class="module-copy poster-study-background">${escapeHTML(firstSlide?.background ?? "")}</p>
          </article>

          <article class="poster-study-text-card">
            <h4 class="poster-study-text-card-title">thesis</h4>
            <p class="module-copy poster-study-thesis">${escapeHTML(firstSlide?.thesis ?? "")}</p>
          </article>
        </div>
      </div>
    </section>
  `;
}

// ── Render: slideshow ─────────────────────────────────────────────────────────

export function renderSlideshowModule(module, keyPrefix, moduleIndex) {
  const key           = `${keyPrefix}slideshow-${moduleIndex}`;
  const series        = Array.isArray(module.series) ? module.series : [];
  const isCreative    = keyPrefix.startsWith("creative-");
  const creativeClass = isCreative ? " slideshow-module-creative-split" : "";

  slideshowRegistry.set(key, {
    key,
    series,
    activeSeriesIndex: 0,
    activeSlideIndex:  0
  });

  if (isCreative) {
    return `
      <section
        class="module slideshow-module${creativeClass}"
        data-slideshow-key="${escapeHTML(key)}"
        tabindex="0"
      >
        <div class="creative-slideshow-shell">
          <section class="creative-stage-card">
            <div class="module-inner">
              <div class="slideshow-heading">
                <div class="slideshow-heading-copy">
                  <h3 class="module-title">${escapeHTML(module.title ?? "")}</h3>
                  ${module.description
                    ? `<p class="module-copy slideshow-description">${escapeHTML(module.description)}</p>`
                    : ""}
                </div>
                ${series.length > 1
                  ? `<div class="slideshow-series-switch" role="tablist">
                       ${series
                         .map(
                           (s, i) => `
                           <button
                             class="slideshow-series-tab ${i === 0 ? "is-active" : ""}"
                             type="button"
                             role="tab"
                             aria-selected="${i === 0 ? "true" : "false"}"
                             data-series-index="${i}"
                           >
                             ${escapeHTML(s.label ?? `series ${i + 1}`)}
                           </button>
                         `
                         )
                         .join("")}
                     </div>`
                  : ""}
              </div>
            </div>

            <div class="slideshow-frame">
              <div class="slideshow-stage">
                <div class="slideshow-image-shell">
                  <div class="slideshow-empty">loading…</div>
                </div>

                <button class="slideshow-arrow slideshow-arrow-left" type="button" aria-label="Previous slide">
                  <span aria-hidden="true">‹</span>
                </button>
                <button class="slideshow-arrow slideshow-arrow-right" type="button" aria-label="Next slide">
                  <span aria-hidden="true">›</span>
                </button>

                <div class="slideshow-counter">
                  <span class="slideshow-counter-current">1</span>
                  <span>/</span>
                  <span class="slideshow-counter-total">1</span>
                </div>
              </div>
            </div>
          </section>

          <section class="creative-info-card">
            <div class="module-inner">
              <div class="slideshow-info">
                <p class="slideshow-series-label"></p>

                <div class="slideshow-meta-stack">
                  <div class="slideshow-meta-row slideshow-meta-row-title">
                    <p class="slideshow-piece-title"></p>
                    <p class="slideshow-piece-artist"></p>
                  </div>

                  <div class="slideshow-meta-row slideshow-meta-row-secondary">
                    <p class="slideshow-piece-size"></p>
                    <p class="slideshow-piece-year"></p>
                  </div>

                  <div class="slideshow-meta-row slideshow-meta-row-secondary">
                    <p class="slideshow-piece-medium"></p>
                    <p class="slideshow-piece-location"></p>
                  </div>
                </div>

                <div class="slideshow-facts"></div>
              </div>
            </div>
          </section>
        </div>
      </section>
    `;
  }

  return `
    <section
      class="module slideshow-module"
      data-slideshow-key="${escapeHTML(key)}"
      tabindex="0"
    >
      <div class="module-inner">
        <div class="slideshow-heading">
          <div class="slideshow-heading-copy">
            <h3 class="module-title">${escapeHTML(module.title ?? "")}</h3>
            ${module.description
              ? `<p class="module-copy slideshow-description">${escapeHTML(module.description)}</p>`
              : ""}
          </div>
          ${series.length > 1
            ? `<div class="slideshow-series-switch" role="tablist">
                 ${series
                   .map(
                     (s, i) => `
                     <button
                       class="slideshow-series-tab ${i === 0 ? "is-active" : ""}"
                       type="button"
                       role="tab"
                       aria-selected="${i === 0 ? "true" : "false"}"
                       data-series-index="${i}"
                     >
                       ${escapeHTML(s.label ?? `series ${i + 1}`)}
                     </button>
                   `
                   )
                   .join("")}
               </div>`
            : ""}
        </div>
      </div>

      <div class="slideshow-frame">
        <div class="slideshow-stage">
          <div class="slideshow-image-shell">
            <div class="slideshow-empty">loading…</div>
          </div>

          <button class="slideshow-arrow slideshow-arrow-left" type="button" aria-label="Previous slide">
            <span aria-hidden="true">‹</span>
          </button>
          <button class="slideshow-arrow slideshow-arrow-right" type="button" aria-label="Next slide">
            <span aria-hidden="true">›</span>
          </button>

          <div class="slideshow-counter">
            <span class="slideshow-counter-current">1</span>
            <span>/</span>
            <span class="slideshow-counter-total">1</span>
          </div>
        </div>

        <div class="slideshow-info">
          <p class="slideshow-series-label"></p>

          <div class="slideshow-meta-grid">
            <div class="slideshow-meta-left">
              <p class="slideshow-piece-title"></p>
              <p class="slideshow-piece-size"></p>
              <p class="slideshow-piece-medium"></p>
            </div>

            <div class="slideshow-meta-right">
              <p class="slideshow-piece-artist"></p>
              <p class="slideshow-piece-year"></p>
              <p class="slideshow-piece-location"></p>
            </div>
          </div>

          <p class="slideshow-piece-description"></p>
          <div class="slideshow-facts"></div>
        </div>
      </div>
    </section>
  `;
}

// ── Render: slide description ─────────────────────────────────────────────────

export function renderSlideDescriptionModule(module, section, moduleIndex, keyPrefix) {
  const linkedIndex = Number.isFinite(module.slideshowModuleIndex)
    ? module.slideshowModuleIndex
    : 0;
  const linkedKey = `${keyPrefix}slideshow-${linkedIndex}`;

  return `
    <section
      class="module slide-description-module"
      data-slide-description-key="${escapeHTML(`${section}-slide-description-${moduleIndex}`)}"
      data-linked-slideshow-key="${escapeHTML(linkedKey)}"
    >
      <div class="module-inner">
        <h3 class="module-title">${escapeHTML(module.title ?? "direction")}</h3>
        <p class="module-copy slide-description-copy">${escapeHTML(module.placeholder ?? "Select a work to view the fuller description.")}</p>
      </div>
    </section>
  `;
}

// ── UI update: slide description ──────────────────────────────────────────────

export function updateSlideDescriptionModules(scope = document) {
  [...scope.querySelectorAll(".slide-description-module")].forEach(moduleEl => {
    const linkedKey = moduleEl.dataset.linkedSlideshowKey;
    if (!linkedKey) return;

    const state  = getSlideshowState(linkedKey);
    const copyEl = moduleEl.querySelector(".slide-description-copy");
    if (!copyEl) return;

    if (!copyEl.dataset.placeholder) {
      copyEl.dataset.placeholder =
        copyEl.textContent ?? "Select a work to view the fuller description.";
    }

    if (!state) {
      copyEl.textContent = copyEl.dataset.placeholder;
      return;
    }

    const series = getSeriesForState(state);
    const slide  = series?.slides?.[state.activeSlideIndex] ?? null;
    copyEl.textContent = slide?.fullDescription ?? copyEl.dataset.placeholder;
  });
}

// ── UI update: slideshow ──────────────────────────────────────────────────────

export function updateSlideshowUI(moduleEl) {
  if (!moduleEl) return;

  const key   = moduleEl.dataset.slideshowKey;
  const state = getSlideshowState(key);
  if (!state) return;

  const series = getSeriesForState(state);
  const slides = series?.slides ?? [];
  if (!slides.length) return;

  state.activeSlideIndex = normalizeSlideIndex(series, state.activeSlideIndex);
  const slide = slides[state.activeSlideIndex];

  const imageShellEl    = moduleEl.querySelector(".slideshow-image-shell");
  const existingMediaEl = moduleEl.querySelector(".slideshow-media");
  const emptyEl         = moduleEl.querySelector(".slideshow-empty");

  if (imageShellEl) {
    const nextMediaEl = createSlideshowMediaElement(slide);
    if (existingMediaEl) existingMediaEl.replaceWith(nextMediaEl);
    else if (emptyEl) emptyEl.replaceWith(nextMediaEl);
    else imageShellEl.prepend(nextMediaEl);
  }

  const q = sel => moduleEl.querySelector(sel);

  const seriesLabelEl      = q(".slideshow-series-label");
  const pieceTitleEl       = q(".slideshow-piece-title");
  const pieceDescriptionEl = q(".slideshow-piece-description");
  const pieceSizeEl        = q(".slideshow-piece-size");
  const pieceArtistEl      = q(".slideshow-piece-artist");
  const pieceMediumEl      = q(".slideshow-piece-medium");
  const pieceYearEl        = q(".slideshow-piece-year");
  const pieceLocationEl    = q(".slideshow-piece-location");
  const counterCurrentEl   = q(".slideshow-counter-current");
  const counterTotalEl     = q(".slideshow-counter-total");
  const leftArrow          = q(".slideshow-arrow-left");
  const rightArrow         = q(".slideshow-arrow-right");
  const factsEl            = q(".slideshow-facts");

  if (seriesLabelEl)       seriesLabelEl.textContent      = series?.label ?? "";
  if (pieceTitleEl)        pieceTitleEl.textContent       = slide.pieceTitle ?? "untitled";
  if (pieceDescriptionEl)  pieceDescriptionEl.textContent = slide.fullDescription ?? "";
  if (pieceSizeEl)         pieceSizeEl.textContent        = slide.size ?? "";
  if (pieceArtistEl)       pieceArtistEl.textContent      = slide.artist ?? ".oCam";
  if (pieceMediumEl)       pieceMediumEl.textContent      = slide.medium ?? "";
  if (pieceYearEl)         pieceYearEl.textContent        = slide.year ?? "";
  if (pieceLocationEl)     pieceLocationEl.textContent    = slide.location ?? "";

  if (factsEl) {
    factsEl.innerHTML = (slide.facts ?? [])
      .map(
        fact => `
        <div class="slideshow-fact">
          <p class="slideshow-fact-label">${escapeHTML(fact.label ?? "")}</p>
          <p class="slideshow-fact-value">${escapeHTML(fact.value ?? "")}</p>
        </div>
      `
      )
      .join("");
  }

  if (counterCurrentEl) counterCurrentEl.textContent = String(state.activeSlideIndex + 1);
  if (counterTotalEl)   counterTotalEl.textContent   = String(slides.length);

  const shouldDisableNav = slides.length <= 1;
  if (leftArrow)  leftArrow.disabled  = shouldDisableNav;
  if (rightArrow) rightArrow.disabled = shouldDisableNav;

  [...moduleEl.querySelectorAll(".slideshow-series-tab")].forEach((tab, index) => {
    const isActive = index === state.activeSeriesIndex;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  const nextIndex = normalizeSlideIndex(series, state.activeSlideIndex + 1);
  const prevIndex = normalizeSlideIndex(series, state.activeSlideIndex - 1);
  const nextSlide = slides[nextIndex];
  const prevSlide = slides[prevIndex];

  if (nextSlide?.mediaType !== "video" && nextIndex !== state.activeSlideIndex) {
    preloadImage(nextSlide?.src);
  }
  if (
    prevSlide?.mediaType !== "video" &&
    prevIndex !== state.activeSlideIndex &&
    prevIndex !== nextIndex
  ) {
    preloadImage(prevSlide?.src);
  }

  updateSlideDescriptionModules(document);
}

// ── UI update: poster study ───────────────────────────────────────────────────

export function updatePosterStudyUI(moduleEl) {
  if (!moduleEl) return;

  const key   = moduleEl.dataset.posterStudyKey;
  const state = getPosterStudyState(key);
  if (!state) return;

  const slides = state.slides ?? [];
  if (!slides.length) return;

  state.activeSlideIndex = normalizePosterIndex(slides.length, state.activeSlideIndex);
  const slide = slides[state.activeSlideIndex];

  const q = sel => moduleEl.querySelector(sel);

  const imageEl          = q(".poster-study-image");
  const currentEl        = q(".poster-study-current");
  const backgroundEl     = q(".poster-study-background");
  const thesisEl         = q(".poster-study-thesis");
  const factsEl          = q(".poster-study-facts");
  const counterCurrentEl = q(".poster-study-counter-current");
  const counterTotalEl   = q(".poster-study-counter-total");
  const leftArrow        = q(".poster-study-arrow-left");
  const rightArrow       = q(".poster-study-arrow-right");

  if (imageEl) {
    imageEl.src = slide.src ?? "";
    imageEl.alt = slide.alt ?? slide.pieceTitle ?? "poster image";
  }

  if (currentEl)    currentEl.textContent    = slide.pieceTitle ?? "";
  if (backgroundEl) backgroundEl.textContent = slide.background ?? "";
  if (thesisEl)     thesisEl.textContent     = slide.thesis ?? "";

  if (factsEl) {
    factsEl.innerHTML = (slide.facts ?? [])
      .map(
        fact => `
        <div class="poster-study-fact">
          <p class="poster-study-fact-label">${escapeHTML(fact.label ?? "")}</p>
          <p class="poster-study-fact-value">${escapeHTML(fact.value ?? "")}</p>
        </div>
      `
      )
      .join("");
  }

  if (counterCurrentEl) counterCurrentEl.textContent = String(state.activeSlideIndex + 1);
  if (counterTotalEl)   counterTotalEl.textContent   = String(slides.length);

  const shouldDisableNav = slides.length <= 1;
  if (leftArrow)  leftArrow.disabled  = shouldDisableNav;
  if (rightArrow) rightArrow.disabled = shouldDisableNav;

  const nextIndex = normalizePosterIndex(slides.length, state.activeSlideIndex + 1);
  const prevIndex = normalizePosterIndex(slides.length, state.activeSlideIndex - 1);
  if (nextIndex !== state.activeSlideIndex) preloadImage(slides[nextIndex]?.src);
  if (prevIndex !== state.activeSlideIndex && prevIndex !== nextIndex) preloadImage(slides[prevIndex]?.src);
}

// ── Step / switch controllers ─────────────────────────────────────────────────

export function switchSlideshowSeries(moduleEl, nextSeriesIndex) {
  if (!moduleEl) return;
  const key   = moduleEl.dataset.slideshowKey;
  const state = getSlideshowState(key);
  if (!state || !state.series[nextSeriesIndex]) return;

  state.activeSeriesIndex = nextSeriesIndex;
  state.activeSlideIndex  = 0;
  updateSlideshowUI(moduleEl);

  track("slideshow_series_change", {
    section:   activeSection ?? "unknown",
    slideshow: key,
    series:    state.series[nextSeriesIndex]?.id ?? nextSeriesIndex
  });
}

export function stepSlideshow(moduleEl, direction) {
  if (!moduleEl) return;
  const key   = moduleEl.dataset.slideshowKey;
  const state = getSlideshowState(key);
  if (!state) return;

  const series = getSeriesForState(state);
  const slides = series?.slides ?? [];
  if (!slides.length) return;

  state.activeSlideIndex = normalizeSlideIndex(series, state.activeSlideIndex + direction);
  updateSlideshowUI(moduleEl);

  track("slideshow_slide_change", {
    section:    activeSection ?? "unknown",
    slideshow:  key,
    series:     series?.id ?? state.activeSeriesIndex,
    slideIndex: state.activeSlideIndex
  });
}

export function stepPosterStudy(moduleEl, direction) {
  if (!moduleEl) return;
  const key   = moduleEl.dataset.posterStudyKey;
  const state = getPosterStudyState(key);
  if (!state) return;

  const slides = state.slides ?? [];
  if (!slides.length) return;

  state.activeSlideIndex = normalizePosterIndex(slides.length, state.activeSlideIndex + direction);
  updatePosterStudyUI(moduleEl);

  track("poster_study_change", {
    section:     activeSection ?? "unknown",
    posterStudy: key,
    slideIndex:  state.activeSlideIndex
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initSlideshows(scope = document) {
  [...scope.querySelectorAll(".slideshow-module")].forEach(moduleEl => {
    if (moduleEl.dataset.slideshowBound === "true") {
      updateSlideshowUI(moduleEl);
      return;
    }

    updateSlideshowUI(moduleEl);

    const leftArrow  = moduleEl.querySelector(".slideshow-arrow-left");
    const rightArrow = moduleEl.querySelector(".slideshow-arrow-right");

    leftArrow?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      stepSlideshow(moduleEl, -1);
    });

    rightArrow?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      stepSlideshow(moduleEl, 1);
    });

    [...moduleEl.querySelectorAll(".slideshow-series-tab")].forEach(tab => {
      tab.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        switchSlideshowSeries(moduleEl, Number(tab.dataset.seriesIndex));
      });
    });

    moduleEl.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepSlideshow(moduleEl, -1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepSlideshow(moduleEl, 1);
      }
    });

    moduleEl.dataset.slideshowBound = "true";
  });
}

export function initPosterStudies(scope = document) {
  [...scope.querySelectorAll(".poster-study-module")].forEach(moduleEl => {
    if (moduleEl.dataset.posterStudyBound === "true") {
      updatePosterStudyUI(moduleEl);
      return;
    }

    updatePosterStudyUI(moduleEl);

    const leftArrow  = moduleEl.querySelector(".poster-study-arrow-left");
    const rightArrow = moduleEl.querySelector(".poster-study-arrow-right");

    leftArrow?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      stepPosterStudy(moduleEl, -1);
    });

    rightArrow?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      stepPosterStudy(moduleEl, 1);
    });

    moduleEl.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepPosterStudy(moduleEl, -1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepPosterStudy(moduleEl, 1);
      }
    });

    moduleEl.dataset.posterStudyBound = "true";
  });
}
