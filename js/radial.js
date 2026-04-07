import { track } from "./analytics.js";
import { resumeSection } from "./sections/resume-section.js";
import { creativeSection } from "./sections/creative-section.js";

const root = document.documentElement;
const radial = document.getElementById("radial");
const centerHub = document.getElementById("centerHub");
const homeButton = document.getElementById("homeButton");
const spaceView = document.querySelector(".space-view");
const spaceCamera = document.querySelector(".space-camera");

const slices = [...document.querySelectorAll(".slice-group")];
const labels = [...document.querySelectorAll(".slice-label")];
const panels = [...document.querySelectorAll(".section-panel")];

let activeSection = null;

const baseCamera = { x: 0, y: 0 };
const panOffset = { x: 0, y: 0 };

let isMiddlePanning = false;
let middlePanPointerId = null;
let lastPanPoint = { x: 0, y: 0 };

const slideshowRegistry = new Map();

const sectionContent = {
  marketing: {
    title: "marketing",
    kicker: "strategy, positioning, audience, direction",
    modules: [
      {
        type: "text",
        title: "brand thinking",
        copy: "Messaging, identity shaping, and the structure behind how things are perceived. This module can hold longer writing instead of just a tiny card."
      },
      {
        type: "two-up",
        items: [
          {
            title: "campaign notes",
            copy: "Audience insight, positioning studies, launch ideas, and case-style breakdowns."
          },
          {
            title: "image block",
            mediaLabel: "place campaign still / poster / chart here"
          }
        ]
      },
      {
        type: "embed",
        title: "live embed",
        mediaLabel: "embed prototype, analytics view, external module, or interactive"
      }
    ]
  },

  creative: creativeSection,

  resume: resumeSection,

  writing: {
    title: "writing",
    kicker: "history, identity, cinema, interpretation",
    modules: [
      {
        type: "text",
        title: "critical work",
        copy: "Long-form writing, historical analysis, and interpretation."
      },
      {
        type: "embed",
        title: "essay or publication",
        mediaLabel: "article embed / pdf window"
      }
    ]
  },

  film: {
    title: "film",
    kicker: "cinema, criticism, sequencing, archive",
    modules: [
      {
        type: "slideshow",
        title: "frames / posters / stills",
        description: "Film stills, posters, or visual sequences can use the same slideshow system.",
        series: [
          {
            id: "film-series-placeholder",
            label: "series one",
            cover: "https://pub-REPLACE_WITH_YOUR_R2_DOMAIN/film/series-one/cover.jpg",
            slides: [
              {
                src: "https://pub-REPLACE_WITH_YOUR_R2_DOMAIN/film/series-one/placeholder-01.jpg",
                alt: "Film placeholder still 1",
                pieceTitle: "placeholder still 01",
                meta: "film / year / format",
                caption: "Replace with your still, poster, or frame."
              },
              {
                src: "https://pub-REPLACE_WITH_YOUR_R2_DOMAIN/film/series-one/placeholder-02.jpg",
                alt: "Film placeholder still 2",
                pieceTitle: "placeholder still 02",
                meta: "film / year / format",
                caption: "Replace with your still, poster, or frame."
              }
            ]
          }
        ]
      },
      {
        type: "text",
        title: "notes",
        copy: "Reviews, national cinema work, and visual arguments."
      }
    ]
  },

  about: {
    title: "about",
    kicker: "identity, direction, contact",
    modules: [
      {
        type: "text",
        title: "approach",
        copy: "A portfolio built around strategy, creativity, and digital presentation."
      },
      {
        type: "two-up",
        items: [
          {
            title: "background",
            copy: "Marketing, creative work, technical experimentation, and writing."
          },
          {
            title: "contact / links",
            copy: "Social links, contact details, or intro."
          }
        ]
      }
    ]
  }
};

const desktopCameraTargets = {
  1: { x: 0, y: 250 },
  2: { x: -320, y: 200 },
  3: { x: -320, y: -180 },
  4: { x: 145, y: -110 },
  5: { x: 320, y: -180 },
  6: { x: 320, y: 200 }
};

const mobileCameraTargets = {
  1: { x: 0, y: 220 },
  2: { x: -205, y: 175 },
  3: { x: -205, y: -160 },
  4: { x: 92, y: -88 },
  5: { x: 205, y: -160 },
  6: { x: 205, y: 175 }
};

function getCameraTargets() {
  return window.innerWidth <= 760 ? mobileCameraTargets : desktopCameraTargets;
}

function getLabel(section) {
  return labels.find(label => label.dataset.section === section) ?? null;
}

function getPanel(section) {
  return panels.find(panel => panel.dataset.section === section) ?? null;
}

function getSliceBySection(section) {
  return slices.find(slice => slice.dataset.section === section) ?? null;
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function applyCombinedCamera() {
  root.style.setProperty("--camera-x", `${baseCamera.x + panOffset.x}px`);
  root.style.setProperty("--camera-y", `${baseCamera.y + panOffset.y}px`);
}

function setBaseCamera(slot) {
  if (!slot) {
    baseCamera.x = 0;
    baseCamera.y = 0;
    applyCombinedCamera();
    return;
  }

  const targets = getCameraTargets();
  const target = targets[slot] ?? { x: 0, y: 0 };

  baseCamera.x = target.x;
  baseCamera.y = target.y;
  applyCombinedCamera();
}

function applyCamera(slot) {
  setBaseCamera(slot);
}

function setPanTransitionEnabled(enabled) {
  if (!spaceCamera) return;
  spaceCamera.style.transition = enabled ? "" : "none";
}

function resetPanOffset() {
  panOffset.x = 0;
  panOffset.y = 0;
  applyCombinedCamera();
}

function centerRadialView() {
  resetPanOffset();
  applyCamera(null);
}

function setPanTransitionForReset() {
  setPanTransitionEnabled(true);
}

function startMiddlePan(event) {
  if (event.button !== 1) return;

  event.preventDefault();

  isMiddlePanning = true;
  middlePanPointerId = event.pointerId;
  lastPanPoint.x = event.clientX;
  lastPanPoint.y = event.clientY;

  setPanTransitionEnabled(false);

  if (spaceView && typeof spaceView.setPointerCapture === "function") {
    try {
      spaceView.setPointerCapture(event.pointerId);
    } catch (_) {}
  }
}

function moveMiddlePan(event) {
  if (!isMiddlePanning || event.pointerId !== middlePanPointerId) return;

  const deltaX = event.clientX - lastPanPoint.x;
  const deltaY = event.clientY - lastPanPoint.y;

  panOffset.x += deltaX;
  panOffset.y += deltaY;

  lastPanPoint.x = event.clientX;
  lastPanPoint.y = event.clientY;

  applyCombinedCamera();
}

function endMiddlePan(event) {
  if (!isMiddlePanning) return;
  if (event.pointerId !== middlePanPointerId) return;

  isMiddlePanning = false;

  if (spaceView && typeof spaceView.releasePointerCapture === "function") {
    try {
      spaceView.releasePointerCapture(event.pointerId);
    } catch (_) {}
  }

  middlePanPointerId = null;
  setPanTransitionEnabled(true);
}

function renderHeaderActions(actions = []) {
  if (!actions.length) return "";

  return `
    <div class="panel-header-actions">
      ${actions.map(action => {
        const href = action.href ?? "#";
        const label = action.label ?? "";
        const icon = action.icon ?? "";
        return `
          <a
            class="panel-action-link"
            href="${href}"
            aria-label="${label}"
            title="${label}"
            ${href === "#" ? 'onclick="event.preventDefault()"' : ""}
          >
            <span class="panel-action-icon" aria-hidden="true">${icon}</span>
            <span class="panel-action-text">${label}</span>
          </a>
        `;
      }).join("")}
    </div>
  `;
}

function renderResumeIntroModule(module) {
  return `
    <div class="resume-main-copy">
      <div class="resume-intro-grid">
        <article class="resume-intro-card">
          <div class="stack-card-inner">
            <h4 class="stack-card-title">${module.profile.title}</h4>
            <p class="module-copy">${module.profile.copy}</p>
          </div>
        </article>
        <article class="resume-intro-card">
          <div class="stack-card-inner">
            <h4 class="stack-card-title">${module.skills.title}</h4>
            <p class="module-copy">${module.skills.copy}</p>
          </div>
        </article>
      </div>
    </div>
  `;
}

function renderResumeWorkCard(module) {
  return `
    <section class="resume-card resume-card-work">
      <div class="module-inner">
        <h3 class="module-title">${module.title}</h3>
      </div>
      <div class="stack-module-list">
        ${module.items.map(item => `
          <article class="stack-card resume-work-item">
            <div class="stack-card-inner">
              <h4 class="stack-card-title">${item.title}</h4>
              <p class="module-copy resume-work-summary">${item.summary}</p>
              <ul class="resume-bullet-list">
                ${item.bullets.map(bullet => `<li>${bullet}</li>`).join("")}
              </ul>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderResumeEducationCard(module) {
  return `
    <section class="resume-card resume-card-education">
      <div class="module-inner">
        <h3 class="module-title">${module.title}</h3>
        <div class="paired-stacks-grid">
          ${module.items.map(item => `
            <article class="stack-card paired-stack-card">
              <div class="stack-card-inner">
                <h4 class="stack-card-title">${item.title}</h4>
                <p class="module-copy">${item.copy}</p>
                <div class="module-subsection">
                  <h4 class="module-subtitle">${item.subTitle}</h4>
                  <p class="module-copy">${item.subCopy}</p>
                </div>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderResumeListCard(module, className) {
  return `
    <section class="resume-card ${className}">
      <div class="module-inner">
        <h3 class="module-title">${module.title}</h3>
        <div class="resume-pill-list">
          ${module.items.map(item => `
            <div class="resume-pill-item">
              <span>${item}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderTextModule(module) {
  return `
    <section class="module">
      <div class="module-inner">
        <h3 class="module-title">${module.title}</h3>
        <p class="module-copy">${module.copy}</p>
      </div>
    </section>
  `;
}

function renderEmbedModule(module) {
  return `
    <section class="module">
      <div class="module-inner">
        <h3 class="module-title">${module.title}</h3>
      </div>
      <div class="embed-placeholder">${module.mediaLabel}</div>
    </section>
  `;
}

function renderSlideshowModule(module, section, moduleIndex) {
  const key = `${section}-slideshow-${moduleIndex}`;
  const series = Array.isArray(module.series) ? module.series : [];

  slideshowRegistry.set(key, {
    key,
    title: module.title ?? "",
    series,
    activeSeriesIndex: 0,
    activeSlideIndex: 0
  });

  const firstSeries = series[0] ?? null;
  const firstSlide = firstSeries?.slides?.[0] ?? null;

  return `
    <section class="module slideshow-module" data-slideshow-key="${escapeHTML(key)}">
      <div class="module-inner">
        <div class="slideshow-heading">
          <div class="slideshow-heading-copy">
            <h3 class="module-title">${module.title}</h3>
            ${module.description ? `<p class="module-copy slideshow-description">${module.description}</p>` : ""}
          </div>
          <div class="slideshow-series-switch" role="tablist" aria-label="${escapeHTML(module.title)} series">
            ${series.map((item, index) => `
              <button
                class="slideshow-series-tab ${index === 0 ? "is-active" : ""}"
                type="button"
                role="tab"
                aria-selected="${index === 0 ? "true" : "false"}"
                data-series-index="${index}"
              >
                ${escapeHTML(item.label ?? `series ${index + 1}`)}
              </button>
            `).join("")}
          </div>
        </div>
      </div>

      <div class="slideshow-frame">
        <button class="slideshow-arrow slideshow-arrow-left" type="button" aria-label="Previous slide">
          <span aria-hidden="true">‹</span>
        </button>

        <div class="slideshow-stage">
          <div class="slideshow-image-shell">
            ${
              firstSlide
                ? `<img class="slideshow-image" src="${escapeHTML(firstSlide.src)}" alt="${escapeHTML(firstSlide.alt ?? firstSlide.pieceTitle ?? "")}" loading="lazy">`
                : `<div class="slideshow-empty">add slideshow images</div>`
            }
          </div>

          <div class="slideshow-overlay">
            <div class="slideshow-meta">
              <p class="slideshow-series-label">${escapeHTML(firstSeries?.label ?? "")}</p>
              <h4 class="slideshow-piece-title">${escapeHTML(firstSlide?.pieceTitle ?? "untitled")}</h4>
              <p class="slideshow-piece-meta">${escapeHTML(firstSlide?.meta ?? "")}</p>
              <p class="slideshow-piece-caption">${escapeHTML(firstSlide?.caption ?? "")}</p>
            </div>
            <div class="slideshow-counter">
              <span class="slideshow-counter-current">1</span>
              <span class="slideshow-counter-separator">/</span>
              <span class="slideshow-counter-total">${firstSeries?.slides?.length ?? 0}</span>
            </div>
          </div>
        </div>

        <button class="slideshow-arrow slideshow-arrow-right" type="button" aria-label="Next slide">
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  `;
}

function renderTwoUpModule(module) {
  return `
    <section class="module module-grid-2">
      ${module.items.map(item => `
        <div class="module">
          ${
            item.mediaLabel
              ? `<div class="media-placeholder">${item.mediaLabel}</div>`
              : `
                <div class="module-inner">
                  <h3 class="module-title">${item.title}</h3>
                  <p class="module-copy">${item.copy}</p>
                </div>
              `
          }
        </div>
      `).join("")}
    </section>
  `;
}

function renderModule(module, section, moduleIndex) {
  switch (module.type) {
    case "text":
      return renderTextModule(module);
    case "embed":
      return renderEmbedModule(module);
    case "slideshow":
      return renderSlideshowModule(module, section, moduleIndex);
    case "two-up":
      return renderTwoUpModule(module);
    default:
      return "";
  }
}

function applyPanelSectionClass(panel, section) {
  if (!panel) return;

  const removableClasses = [...panel.classList].filter(className =>
    className.startsWith("panel-") && className !== "section-panel"
  );

  removableClasses.forEach(className => panel.classList.remove(className));

  if (section) {
    panel.classList.add(`panel-${section}`);
  }
}

function buildResumePanel(panel, data, section) {
  const introModule = data.modules[0];
  const workModule = data.modules[1];
  const educationModule = data.modules[2];
  const languagesModule = data.modules[3];
  const certsAwardsModule = data.modules[4];
  const interestsModule = data.modules[5];

  panel.innerHTML = `
    <div class="resume-layout">
      ${renderResumeWorkCard(workModule)}

      <div class="resume-center-stack">
        <section class="resume-card resume-card-main">
          <header class="panel-header ${data.headerActions?.length ? "has-actions" : ""}">
            <div class="panel-header-main">
              <h2 class="panel-title" id="panel-title-${section}">${data.title}</h2>
              <p class="panel-kicker">${data.kicker}</p>
            </div>
            ${renderHeaderActions(data.headerActions)}
          </header>
          ${renderResumeIntroModule(introModule)}
        </section>

        ${renderResumeEducationCard(educationModule)}
      </div>

      <div class="resume-right-stack">
        ${renderResumeListCard(languagesModule, "resume-card-lang")}
        ${renderResumeListCard(certsAwardsModule, "resume-card-certs-awards")}
        ${renderResumeListCard(interestsModule, "resume-card-interest")}
      </div>
    </div>
  `;
}

function buildPanel(section, data) {
  const panel = getPanel(section);
  if (!panel || !data) return;

  applyPanelSectionClass(panel, section);

  if (section === "resume") {
    buildResumePanel(panel, data, section);
    return;
  }

  panel.innerHTML = `
    <header class="panel-header ${data.headerActions?.length ? "has-actions" : ""}">
      <div class="panel-header-main">
        <h2 class="panel-title" id="panel-title-${section}">${data.title}</h2>
        <p class="panel-kicker">${data.kicker}</p>
      </div>
      ${renderHeaderActions(data.headerActions)}
    </header>
    <div class="panel-content">
      ${data.modules.map((module, moduleIndex) => renderModule(module, section, moduleIndex)).join("")}
    </div>
  `;
}

function buildAllPanels() {
  slideshowRegistry.clear();

  Object.entries(sectionContent).forEach(([section, data]) => {
    buildPanel(section, data);
  });
}

function getSlideshowState(key) {
  return slideshowRegistry.get(key) ?? null;
}

function getSeriesForState(state) {
  if (!state) return null;
  return state.series[state.activeSeriesIndex] ?? null;
}

function normalizeSlideIndex(series, index) {
  const total = series?.slides?.length ?? 0;
  if (!total) return 0;
  return ((index % total) + total) % total;
}

function preloadImage(src) {
  if (!src) return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
}

function updateSlideshowUI(moduleEl) {
  if (!moduleEl) return;

  const key = moduleEl.dataset.slideshowKey;
  const state = getSlideshowState(key);
  if (!state) return;

  const series = getSeriesForState(state);
  const slides = series?.slides ?? [];

  if (!slides.length) return;

  state.activeSlideIndex = normalizeSlideIndex(series, state.activeSlideIndex);

  const slide = slides[state.activeSlideIndex];

  const imageEl = moduleEl.querySelector(".slideshow-image");
  const emptyEl = moduleEl.querySelector(".slideshow-empty");
  const seriesLabelEl = moduleEl.querySelector(".slideshow-series-label");
  const pieceTitleEl = moduleEl.querySelector(".slideshow-piece-title");
  const pieceMetaEl = moduleEl.querySelector(".slideshow-piece-meta");
  const pieceCaptionEl = moduleEl.querySelector(".slideshow-piece-caption");
  const counterCurrentEl = moduleEl.querySelector(".slideshow-counter-current");
  const counterTotalEl = moduleEl.querySelector(".slideshow-counter-total");
  const leftArrow = moduleEl.querySelector(".slideshow-arrow-left");
  const rightArrow = moduleEl.querySelector(".slideshow-arrow-right");
  const seriesTabs = [...moduleEl.querySelectorAll(".slideshow-series-tab")];

  if (imageEl) {
    imageEl.src = slide.src ?? "";
    imageEl.alt = slide.alt ?? slide.pieceTitle ?? series?.label ?? "slide image";
  }

  if (emptyEl) {
    emptyEl.style.display = "none";
  }

  if (seriesLabelEl) {
    seriesLabelEl.textContent = series?.label ?? "";
  }

  if (pieceTitleEl) {
    pieceTitleEl.textContent = slide.pieceTitle ?? "untitled";
  }

  if (pieceMetaEl) {
    pieceMetaEl.textContent = slide.meta ?? "";
  }

  if (pieceCaptionEl) {
    pieceCaptionEl.textContent = slide.caption ?? "";
  }

  if (counterCurrentEl) {
    counterCurrentEl.textContent = String(state.activeSlideIndex + 1);
  }

  if (counterTotalEl) {
    counterTotalEl.textContent = String(slides.length);
  }

  const shouldDisableNav = slides.length <= 1;

  if (leftArrow) leftArrow.disabled = shouldDisableNav;
  if (rightArrow) rightArrow.disabled = shouldDisableNav;

  seriesTabs.forEach((tab, index) => {
    const isActive = index === state.activeSeriesIndex;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  const nextIndex = normalizeSlideIndex(series, state.activeSlideIndex + 1);
  const prevIndex = normalizeSlideIndex(series, state.activeSlideIndex - 1);

  const nextSlide = slides[nextIndex];
  const prevSlide = slides[prevIndex];

  if (nextIndex !== state.activeSlideIndex) {
    preloadImage(nextSlide?.src);
  }

  if (prevIndex !== state.activeSlideIndex && prevIndex !== nextIndex) {
    preloadImage(prevSlide?.src);
  }
}

function switchSlideshowSeries(moduleEl, nextSeriesIndex) {
  if (!moduleEl) return;

  const key = moduleEl.dataset.slideshowKey;
  const state = getSlideshowState(key);
  if (!state) return;

  if (!state.series[nextSeriesIndex]) return;

  state.activeSeriesIndex = nextSeriesIndex;
  state.activeSlideIndex = 0;

  updateSlideshowUI(moduleEl);

  track("slideshow_series_change", {
    section: activeSection ?? "unknown",
    slideshow: key,
    series: state.series[nextSeriesIndex]?.id ?? nextSeriesIndex
  });
}

function stepSlideshow(moduleEl, direction) {
  if (!moduleEl) return;

  const key = moduleEl.dataset.slideshowKey;
  const state = getSlideshowState(key);
  if (!state) return;

  const series = getSeriesForState(state);
  const slides = series?.slides ?? [];
  if (!slides.length) return;

  state.activeSlideIndex = normalizeSlideIndex(series, state.activeSlideIndex + direction);
  updateSlideshowUI(moduleEl);

  track("slideshow_slide_change", {
    section: activeSection ?? "unknown",
    slideshow: key,
    series: series?.id ?? state.activeSeriesIndex,
    slideIndex: state.activeSlideIndex
  });
}

function initSlideshows() {
  const slideshowModules = [...document.querySelectorAll(".slideshow-module")];

  slideshowModules.forEach(moduleEl => {
    updateSlideshowUI(moduleEl);

    const leftArrow = moduleEl.querySelector(".slideshow-arrow-left");
    const rightArrow = moduleEl.querySelector(".slideshow-arrow-right");
    const seriesTabs = [...moduleEl.querySelectorAll(".slideshow-series-tab")];

    leftArrow?.addEventListener("click", () => stepSlideshow(moduleEl, -1));
    rightArrow?.addEventListener("click", () => stepSlideshow(moduleEl, 1));

    seriesTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const nextSeriesIndex = Number(tab.dataset.seriesIndex);
        switchSlideshowSeries(moduleEl, nextSeriesIndex);
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
  });
}

function clearSelectedState() {
  slices.forEach(slice => slice.classList.remove("is-selected"));
  labels.forEach(label => label.classList.remove("is-selected", "is-hovered"));
  panels.forEach(panel => panel.classList.remove("is-active"));
}

function openSection(section, clickedSlice) {
  if (!section || !clickedSlice) return;

  const slot = clickedSlice.dataset.slot;
  if (!slot) return;

  activeSection = section;
  clearSelectedState();

  clickedSlice.classList.add("is-selected");

  const label = getLabel(section);
  if (label) label.classList.add("is-selected");

  const panel = getPanel(section);
  if (panel) panel.classList.add("is-active");

  radial.classList.add("is-active");
  applyCamera(slot);

  track("slice_click", { section });
  track("section_open", { section });
}

function resetView() {
  if (activeSection) {
    track("section_close", { section: activeSection });
  }

  activeSection = null;
  clearSelectedState();
  radial.classList.remove("is-active");
  setPanTransitionForReset();
  centerRadialView();
}

function handleSliceActivate(slice) {
  const section = slice.dataset.section;
  if (!section) return;

  if (activeSection === section) {
    resetView();
    return;
  }

  openSection(section, slice);
}

function bindHoverEvents() {
  slices.forEach(slice => {
    const section = slice.dataset.section;
    const label = getLabel(section);
    if (!label) return;

    slice.addEventListener("mouseenter", () => {
      if (!activeSection) label.classList.add("is-hovered");
    });

    slice.addEventListener("mouseleave", () => {
      if (!activeSection) label.classList.remove("is-hovered");
    });

    slice.addEventListener("focus", () => {
      if (!activeSection) label.classList.add("is-hovered");
    });

    slice.addEventListener("blur", () => {
      if (!activeSection) label.classList.remove("is-hovered");
    });
  });
}

function bindDevPanEvents() {
  if (!spaceView) return;

  spaceView.addEventListener("pointerdown", startMiddlePan);
  spaceView.addEventListener("pointermove", moveMiddlePan);
  spaceView.addEventListener("pointerup", endMiddlePan);
  spaceView.addEventListener("pointercancel", endMiddlePan);

  spaceView.addEventListener("auxclick", event => {
    if (event.button === 1) {
      event.preventDefault();
    }
  });

  spaceView.addEventListener("mousedown", event => {
    if (event.button === 1) {
      event.preventDefault();
    }
  });
}

function bindEvents() {
  slices.forEach(slice => {
    slice.addEventListener("click", () => handleSliceActivate(slice));

    slice.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSliceActivate(slice);
      }
    });
  });

  centerHub.addEventListener("click", resetView);

  if (homeButton) {
    homeButton.addEventListener("click", resetView);
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      resetView();
    }
  });

  window.addEventListener("resize", () => {
    if (!activeSection) {
      centerRadialView();
      return;
    }

    const activeSlice = getSliceBySection(activeSection);
    const activeSlot = activeSlice?.dataset.slot ?? null;
    applyCamera(activeSlot);
  });

  bindDevPanEvents();
}

buildAllPanels();
initSlideshows();
bindHoverEvents();
bindEvents();
centerRadialView();
