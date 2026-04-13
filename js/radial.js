import { track } from "./analytics.js";
import { resumeSection } from "./sections/resume-section.js";
import { creativeSection } from "./sections/creative-section.js";
import { filmSection } from "./sections/film-section.js";
import { musicSection } from "./sections/music-section.js";

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

let isPrimaryPanning = false;
let primaryPanPointerId = null;
let primaryPanExceededThreshold = false;
let primaryPanStartPoint = { x: 0, y: 0 };
let primaryPanLastPoint = { x: 0, y: 0 };
let suppressClickUntil = 0;

const PAN_DRAG_THRESHOLD = 7;
const slideshowRegistry = new Map();
const posterStudyRegistry = new Map();
const filmCollectionRegistry = new Map();

const sectionContent = {
  marketing: {
    title: "marketing",
    kicker: "strategy, positioning, audience, direction",
    modules: [
      {
        type: "text",
        title: "brand thinking",
        copy:
          "Messaging, identity shaping, and the structure behind how things are perceived. This module can hold longer writing instead of just a tiny card."
      },
      {
        type: "two-up",
        items: [
          {
            title: "campaign notes",
            copy:
              "Audience insight, positioning studies, launch ideas, and case-style breakdowns."
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
  music: musicSection,
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

  film: filmSection
};

const desktopCameraTargets = {
  1: { x: 0, y: 250 },
  2: { x: -320, y: 400 },
  3: { x: -320, y: -180 },
  4: { x: 850, y: -410 },
  5: { x: 620, y: 200 },
  6: { x: 360, y: -700 }
};

const mobileCameraTargets = {
  1: { x: 0, y: 220 },
  2: { x: -205, y: 175 },
  3: { x: -205, y: -160 },
  4: { x: 92, y: -88 },
  5: { x: 205, y: 175 },
  6: { x: 205, y: -160 }
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

function isMobileViewport() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function isTouchLikePointer(event) {
  return event.pointerType === "touch" || event.pointerType === "pen";
}

function isPrimaryPointer(event) {
  if (event.pointerType === "mouse") {
    return event.button === 0;
  }
  return true;
}

function isInteractiveTarget(target) {
  if (!(target instanceof Element)) return false;

  return Boolean(
    target.closest(
      [
        ".slice-group",
        "#centerHub",
        "#homeButton",
        "a",
        "button",
        "input",
        "textarea",
        "select",
        "option",
        "label",
        "video",
        "audio",
        "summary",
        "[role='button']",
        ".slideshow-arrow",
        ".slideshow-series-tab",
        ".film-collection-tab",
        ".poster-study-arrow"
      ].join(", ")
    )
  );
}

function isLikelyTextSelectionTarget(target) {
  if (!(target instanceof Element)) return false;
  if (isMobileViewport()) return false;

  return Boolean(
    target.closest(
      [
        ".panel-title",
        ".panel-kicker",
        ".module-title",
        ".module-subtitle",
        ".module-copy",
        ".stack-card-title",
        ".resume-bullet-list li",
        ".resume-pill-item span",
        ".panel-action-text",
        ".film-analysis-list li",
        ".slideshow-piece-title",
        ".slideshow-piece-description",
        ".poster-study-title",
        ".poster-study-current",
        ".poster-study-fact-value",
        ".film-triptych-card-title",
        ".film-triptych-card-meta",
        ".film-triptych-card-copy",
        ".slide-description-copy",
        "p",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6"
      ].join(", ")
    )
  );
}

function hasActiveTextSelection() {
  const selection = window.getSelection?.();
  if (!selection) return false;
  return !selection.isCollapsed && String(selection).trim().length > 0;
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

function markDraggingState(enabled) {
  if (!spaceView) return;
  spaceView.classList.toggle("is-dragging", enabled);
}

function releasePointerCaptureSafe(pointerId) {
  if (!spaceView || typeof spaceView.releasePointerCapture !== "function") return;
  try {
    spaceView.releasePointerCapture(pointerId);
  } catch (_) {}
}

function setPointerCaptureSafe(pointerId) {
  if (!spaceView || typeof spaceView.setPointerCapture !== "function") return;
  try {
    spaceView.setPointerCapture(pointerId);
  } catch (_) {}
}

function startMiddlePan(event) {
  if (event.button !== 1) return;

  event.preventDefault();

  isMiddlePanning = true;
  middlePanPointerId = event.pointerId;
  lastPanPoint.x = event.clientX;
  lastPanPoint.y = event.clientY;

  setPanTransitionEnabled(false);
  markDraggingState(true);
  setPointerCaptureSafe(event.pointerId);
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
  releasePointerCaptureSafe(event.pointerId);
  middlePanPointerId = null;
  setPanTransitionEnabled(true);
  markDraggingState(isPrimaryPanning);
}

function startPrimaryPan(event) {
  if (!isPrimaryPointer(event)) return;
  if (isInteractiveTarget(event.target)) return;
  if (isLikelyTextSelectionTarget(event.target) && !isTouchLikePointer(event)) return;

  isPrimaryPanning = true;
  primaryPanPointerId = event.pointerId;
  primaryPanExceededThreshold = false;
  primaryPanStartPoint.x = event.clientX;
  primaryPanStartPoint.y = event.clientY;
  primaryPanLastPoint.x = event.clientX;
  primaryPanLastPoint.y = event.clientY;

  setPanTransitionEnabled(false);
  setPointerCaptureSafe(event.pointerId);
}

function movePrimaryPan(event) {
  if (!isPrimaryPanning || event.pointerId !== primaryPanPointerId) return;

  const totalDeltaX = event.clientX - primaryPanStartPoint.x;
  const totalDeltaY = event.clientY - primaryPanStartPoint.y;

  if (!primaryPanExceededThreshold) {
    const distance = Math.hypot(totalDeltaX, totalDeltaY);

    if (distance < PAN_DRAG_THRESHOLD) {
      return;
    }

    if (hasActiveTextSelection() && !isTouchLikePointer(event)) {
      cancelPrimaryPan(event.pointerId);
      return;
    }

    primaryPanExceededThreshold = true;
    markDraggingState(true);
  }

  event.preventDefault();

  const deltaX = event.clientX - primaryPanLastPoint.x;
  const deltaY = event.clientY - primaryPanLastPoint.y;

  panOffset.x += deltaX;
  panOffset.y += deltaY;

  primaryPanLastPoint.x = event.clientX;
  primaryPanLastPoint.y = event.clientY;

  applyCombinedCamera();
}

function cancelPrimaryPan(pointerId) {
  if (!isPrimaryPanning) return;
  if (pointerId !== primaryPanPointerId) return;

  isPrimaryPanning = false;
  releasePointerCaptureSafe(pointerId);
  primaryPanPointerId = null;
  primaryPanExceededThreshold = false;
  setPanTransitionEnabled(true);
  markDraggingState(isMiddlePanning);
}

function endPrimaryPan(event) {
  if (!isPrimaryPanning) return;
  if (event.pointerId !== primaryPanPointerId) return;

  const didDrag = primaryPanExceededThreshold;

  isPrimaryPanning = false;
  releasePointerCaptureSafe(event.pointerId);
  primaryPanPointerId = null;
  primaryPanExceededThreshold = false;
  setPanTransitionEnabled(true);
  markDraggingState(isMiddlePanning);

  if (didDrag) {
    suppressClickUntil = performance.now() + 220;
  }
}

function shouldSuppressClick() {
  return performance.now() < suppressClickUntil;
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
            aria-label="${escapeHTML(label)}"
            title="${escapeHTML(label)}"
            ${href === "#" ? 'onclick="event.preventDefault()"' : ""}
          >
            <span class="panel-action-icon" aria-hidden="true">${escapeHTML(icon)}</span>
            <span class="panel-action-text">${escapeHTML(label)}</span>
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
            <h4 class="stack-card-title">${escapeHTML(module.profile.title)}</h4>
            <p class="module-copy">${escapeHTML(module.profile.copy)}</p>
          </div>
        </article>
        <article class="resume-intro-card">
          <div class="stack-card-inner">
            <h4 class="stack-card-title">${escapeHTML(module.skills.title)}</h4>
            <p class="module-copy">${escapeHTML(module.skills.copy)}</p>
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
        <h3 class="module-title">${escapeHTML(module.title)}</h3>
      </div>
      <div class="stack-module-list">
        ${module.items.map(item => `
          <article class="stack-card resume-work-item">
            <div class="stack-card-inner">
              <h4 class="stack-card-title">${escapeHTML(item.title)}</h4>
              <p class="module-copy resume-work-summary">${escapeHTML(item.summary)}</p>
              <ul class="resume-bullet-list">
                ${item.bullets.map(bullet => `<li>${escapeHTML(bullet)}</li>`).join("")}
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
        <h3 class="module-title">${escapeHTML(module.title)}</h3>
        <div class="paired-stacks-grid">
          ${module.items.map(item => `
            <article class="stack-card paired-stack-card">
              <div class="stack-card-inner">
                <h4 class="stack-card-title">${escapeHTML(item.title)}</h4>
                <p class="module-copy">${escapeHTML(item.copy)}</p>
                <div class="module-subsection">
                  <h4 class="module-subtitle">${escapeHTML(item.subTitle)}</h4>
                  <p class="module-copy">${escapeHTML(item.subCopy)}</p>
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
        <h3 class="module-title">${escapeHTML(module.title)}</h3>
        <div class="resume-pill-list">
          ${module.items.map(item => `
            <div class="resume-pill-item">
              <span>${escapeHTML(item)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderTextModule(module) {
  const bodyHTML = Array.isArray(module.paragraphs) && module.paragraphs.length
    ? module.paragraphs
        .map(paragraph => `<p class="module-copy">${escapeHTML(paragraph)}</p>`)
        .join("")
    : `<p class="module-copy">${escapeHTML(module.copy ?? "")}</p>`;

  return `
    <section class="module">
      <div class="module-inner">
        <h3 class="module-title">${escapeHTML(module.title ?? "")}</h3>
        ${bodyHTML}
      </div>
    </section>
  `;
}

function renderMusicFeatureModule(module) {
  const video = module.video ?? {};
  const lyrics = module.lyrics ?? {};
  const analysis = module.analysis ?? {};

  return `
    <section class="module music-feature-module">
      <div class="music-feature-intro">
        ${module.eyebrow ? `<p class="music-feature-eyebrow">${escapeHTML(module.eyebrow)}</p>` : ""}
        <h3 class="music-feature-title">${escapeHTML(module.title ?? "")}</h3>
        ${module.dek ? `<p class="music-feature-dek">${escapeHTML(module.dek)}</p>` : ""}
      </div>

      <div class="music-feature-grid">
        <div class="music-feature-cell music-feature-video">
          ${renderEmbedModule({
            title: video.title ?? "video",
            embedType: "iframe",
            src: video.src ?? "",
            aspectRatio: video.aspectRatio ?? "16 / 9"
          })}
        </div>

        <div class="music-feature-cell music-feature-lyrics">
          ${renderTextModule({
            title: lyrics.title ?? "lyrics",
            paragraphs: Array.isArray(lyrics.paragraphs) ? lyrics.paragraphs : []
          })}
        </div>

        <div class="music-feature-cell music-feature-analysis">
          ${renderTextModule({
            title: analysis.title ?? "analysis",
            paragraphs: Array.isArray(analysis.paragraphs) ? analysis.paragraphs : []
          })}
        </div>
      </div>
    </section>
  `;
}

function renderFilmMedia(media = {}, className = "") {
  const mediaType = media.type ?? "";
  const src = escapeHTML(media.src ?? "");
  const poster = escapeHTML(media.poster ?? "");
  const ariaLabel = escapeHTML(media.ariaLabel ?? "film media");

  if (mediaType === "video" && src) {
    return `
      <div class="film-media-shell ${className}">
        <video
          class="film-media-video"
          controls
          preload="metadata"
          ${poster ? `poster="${poster}"` : ""}
          aria-label="${ariaLabel}"
        >
          <source src="${src}">
        </video>
      </div>
    `;
  }

  if (mediaType === "image" && src) {
    return `
      <div class="film-media-shell ${className}">
        <img class="film-media-image" src="${src}" alt="${ariaLabel}" loading="lazy">
      </div>
    `;
  }

  return `
    <div class="film-media-shell ${className}">
      <div class="film-media-placeholder">add film media</div>
    </div>
  `;
}

function renderFilmAnalysisModule(module) {
  const bullets = Array.isArray(module.bullets) ? module.bullets : [];

  return `
    <section class="module film-analysis-module">
      <div class="film-analysis-layout">
        ${renderFilmMedia(module.media, "film-analysis-media")}
        <div class="film-analysis-copy">
          <div class="module-inner">
            <div class="film-analysis-copy-inner">
              <h3 class="module-title">${escapeHTML(module.title ?? "")}</h3>
              ${module.subtitle ? `<p class="film-analysis-subtitle">${escapeHTML(module.subtitle)}</p>` : ""}
              ${module.claim ? `<p class="module-copy film-analysis-claim">${escapeHTML(module.claim)}</p>` : ""}
              ${bullets.length ? `
                <ul class="film-analysis-list">
                  ${bullets.map(item => `<li>${escapeHTML(item)}</li>`).join("")}
                </ul>
              ` : ""}
              ${module.footer ? `<p class="module-copy film-analysis-footer">${escapeHTML(module.footer)}</p>` : ""}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderFilmAnalysisGridModule(module) {
  const items = Array.isArray(module.items) ? module.items : [];

  return `
    <section class="module film-analysis-grid-module">
      <div class="module-inner">
        <h3 class="module-title">${escapeHTML(module.title ?? "")}</h3>
        <div class="film-analysis-grid">
          ${items.map(item => `
            <article class="film-analysis-card">
              <h4 class="film-analysis-card-title">${escapeHTML(item.heading ?? "")}</h4>
              <p class="module-copy">${escapeHTML(item.copy ?? "")}</p>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderFilmTriptychModule(module) {
  const items = Array.isArray(module.items) ? module.items : [];

  return `
    <section class="module film-triptych-module">
      <div class="module-inner">
        <div class="film-triptych-header">
          ${module.title ? `<h3 class="module-title">${escapeHTML(module.title)}</h3>` : ""}
          ${module.description ? `<p class="module-copy film-triptych-description">${escapeHTML(module.description)}</p>` : ""}
        </div>

        <div class="film-triptych-grid">
          ${items.map(item => `
            <article class="film-triptych-card">
              <div class="film-triptych-image-shell">
                <img
                  class="film-triptych-image"
                  src="${escapeHTML(item.src ?? "")}"
                  alt="${escapeHTML(item.alt ?? item.title ?? "film still")}"
                  loading="lazy"
                >
              </div>

              <div class="film-triptych-card-body">
                <div class="film-triptych-card-topline">
                  <h4 class="film-triptych-card-title">${escapeHTML(item.title ?? "")}</h4>
                  ${item.meta ? `<p class="film-triptych-card-meta">${escapeHTML(item.meta)}</p>` : ""}
                </div>

                ${item.thesis ? `<p class="film-triptych-card-thesis">${escapeHTML(item.thesis)}</p>` : ""}
                ${item.copy ? `<p class="film-triptych-card-copy">${escapeHTML(item.copy)}</p>` : ""}
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderPosterStudyFacts(slide = {}) {
  const facts = Array.isArray(slide.facts) ? slide.facts : [];
  if (!facts.length) return `<div class="poster-study-facts"></div>`;

  return `
    <div class="poster-study-facts">
      ${facts.map(fact => `
        <div class="poster-study-fact">
          <p class="poster-study-fact-label">${escapeHTML(fact.label ?? "")}</p>
          <p class="poster-study-fact-value">${escapeHTML(fact.value ?? "")}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function renderPosterStudyModule(module, keyPrefix, moduleIndex) {
  const key = `${keyPrefix}poster-study-${moduleIndex}`;
  const slides = Array.isArray(module.slides) ? module.slides : [];

  posterStudyRegistry.set(key, {
    key,
    slides,
    activeSlideIndex: 0
  });

  const firstSlide = slides[0] ?? null;

  return `
    <section class="module poster-study-module" data-poster-study-key="${escapeHTML(key)}" tabindex="0">
      <div class="poster-study-stage">
        <div class="poster-study-poster-pane">
          <div class="poster-study-image-shell">
            ${
              firstSlide
                ? `<img class="poster-study-image" src="${escapeHTML(firstSlide.src ?? "")}" alt="${escapeHTML(firstSlide.alt ?? firstSlide.pieceTitle ?? "")}" loading="lazy">`
                : `<div class="slideshow-empty">add poster image</div>`
            }

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
          ${module.title ? `<h3 class="poster-study-title">${escapeHTML(module.title)}</h3>` : ""}
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

function renderSlideDescriptionModule(module, section, moduleIndex, keyPrefix) {
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

function getCollectionModuleById(collection, id) {
  return (collection.modules || []).find(module => module.id === id) ?? null;
}

function renderFilmCollectionModules(collection, parentKey) {
  const modules = Array.isArray(collection.modules) ? collection.modules : [];
  const layout = Array.isArray(collection.layout) ? collection.layout : [];
  const keyPrefix = `${parentKey}collection-${collection.id}-`;

  if (!layout.length) {
    return modules.map((module, moduleIndex) =>
      renderModule(module, "film", moduleIndex, keyPrefix)
    ).join("");
  }

  let fallbackIndex = 0;

  return layout.map((row, rowIndex) => {
    const rowCells = Array.isArray(row) ? row : [row];

    if (rowCells.length === 1 || (rowCells.length === 2 && rowCells[0] === rowCells[1])) {
      const moduleId = rowCells[0];
      const module = getCollectionModuleById(collection, moduleId);
      if (!module) return "";

      return `
        <div class="film-collection-cell film-collection-span-2" data-row-index="${rowIndex}" data-module-id="${escapeHTML(moduleId)}">
          ${renderModule(module, "film", fallbackIndex++, keyPrefix)}
        </div>
      `;
    }

    return rowCells.map((moduleId) => {
      const module = getCollectionModuleById(collection, moduleId);
      if (!module) return "";

      return `
        <div class="film-collection-cell" data-row-index="${rowIndex}" data-module-id="${escapeHTML(moduleId)}">
          ${renderModule(module, "film", fallbackIndex++, keyPrefix)}
        </div>
      `;
    }).join("");
  }).join("");
}

function renderFilmCollectionBrowserModule(module, section, moduleIndex) {
  const collections = Array.isArray(module.collections) ? module.collections : [];
  const browserKey = `${section}-film-browser-${moduleIndex}`;

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
          ${module.description ? `<p class="film-collection-description">${escapeHTML(module.description)}</p>` : ""}
        </div>
      </div>

      <div class="film-collection-tabs-wrap">
        <div class="film-collection-tabs" role="tablist" aria-label="${escapeHTML(module.title ?? "film collections")}">
          ${collections.map((collection, index) => `
            <button
              class="film-collection-tab ${index === 0 ? "is-active" : ""}"
              type="button"
              role="tab"
              aria-selected="${index === 0 ? "true" : "false"}"
              data-collection-index="${index}"
            >
              ${escapeHTML(collection.label ?? `collection ${index + 1}`)}
            </button>
          `).join("")}
        </div>
      </div>

      <div class="film-collection-stage">
        <div class="film-collection-shell">
          <div class="film-collection-intro">
            ${firstCollection?.eyebrow ? `<p class="film-collection-eyebrow">${escapeHTML(firstCollection.eyebrow)}</p>` : ""}
            <h4 class="film-collection-title">${escapeHTML(firstCollection?.title ?? "")}</h4>
            ${firstCollection?.dek ? `<p class="film-collection-dek">${escapeHTML(firstCollection.dek)}</p>` : ""}
          </div>
          <div class="film-collection-content">
            ${firstCollection ? renderFilmCollectionModules(firstCollection, `${browserKey}-`) : ""}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderModule(module, section, moduleIndex, keyPrefixOverride = "") {
  const keyPrefix = keyPrefixOverride || `${section}-`;

  switch (module.type) {
    case "text":
      return renderTextModule(module);
    case "embed":
      return renderEmbedModule(module);
    case "slideshow":
      return renderSlideshowModule(module, keyPrefix, moduleIndex);
    case "slide-description":
      return renderSlideDescriptionModule(module, section, moduleIndex, keyPrefix);
    case "two-up":
      return renderTwoUpModule(module);
    case "music-feature":
      return renderMusicFeatureModule(module);
    case "film-analysis":
      return renderFilmAnalysisModule(module);
    case "film-analysis-grid":
      return renderFilmAnalysisGridModule(module);
    case "film-triptych":
      return renderFilmTriptychModule(module);
    case "film-collection-browser":
      return renderFilmCollectionBrowserModule(module, section, moduleIndex);
    case "poster-study":
      return renderPosterStudyModule(module, keyPrefix, moduleIndex);
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
              <h2 class="panel-title" id="panel-title-${section}">${escapeHTML(data.title)}</h2>
              <p class="panel-kicker">${escapeHTML(data.kicker)}</p>
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
        <h2 class="panel-title" id="panel-title-${section}">${escapeHTML(data.title)}</h2>
        <p class="panel-kicker">${escapeHTML(data.kicker)}</p>
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
  posterStudyRegistry.clear();
  filmCollectionRegistry.clear();

  Object.entries(sectionContent).forEach(([section, data]) => {
    buildPanel(section, data);
  });
}

function getSlideshowState(key) {
  return slideshowRegistry.get(key) ?? null;
}

function getPosterStudyState(key) {
  return posterStudyRegistry.get(key) ?? null;
}

function getFilmBrowserState(key) {
  return filmCollectionRegistry.get(key) ?? null;
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

function normalizePosterIndex(total, index) {
  if (!total) return 0;
  return ((index % total) + total) % total;
}

function preloadImage(src) {
  if (!src) return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
}

function updateSlideDescriptionModules(scope = document) {
  const modules = [...scope.querySelectorAll(".slide-description-module")];

  modules.forEach(moduleEl => {
    const linkedKey = moduleEl.dataset.linkedSlideshowKey;
    if (!linkedKey) return;

    const slideshowState = getSlideshowState(linkedKey);
    const copyEl = moduleEl.querySelector(".slide-description-copy");
    if (!copyEl) return;

    const fallbackText =
      copyEl.dataset.placeholder ??
      copyEl.textContent ??
      "Select a work to view the fuller description.";

    if (!copyEl.dataset.placeholder) {
      copyEl.dataset.placeholder = fallbackText;
    }

    if (!slideshowState) {
      copyEl.textContent = fallbackText;
      return;
    }

    const series = getSeriesForState(slideshowState);
    const slide = series?.slides?.[slideshowState.activeSlideIndex] ?? null;

    copyEl.textContent = slide?.fullDescription ?? fallbackText;
  });
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

  const imageShellEl = moduleEl.querySelector(".slideshow-image-shell");
  const emptyEl = moduleEl.querySelector(".slideshow-empty");
  const existingMediaEl = moduleEl.querySelector(".slideshow-media");
  const seriesLabelEl = moduleEl.querySelector(".slideshow-series-label");
  const pieceTitleEl = moduleEl.querySelector(".slideshow-piece-title");
  const pieceDescriptionEl = moduleEl.querySelector(".slideshow-piece-description");
  const pieceSizeEl = moduleEl.querySelector(".slideshow-piece-size");
  const pieceArtistEl = moduleEl.querySelector(".slideshow-piece-artist");
  const pieceMediumEl = moduleEl.querySelector(".slideshow-piece-medium");
  const pieceYearEl = moduleEl.querySelector(".slideshow-piece-year");
  const pieceLocationEl = moduleEl.querySelector(".slideshow-piece-location");
  const counterCurrentEl = moduleEl.querySelector(".slideshow-counter-current");
  const counterTotalEl = moduleEl.querySelector(".slideshow-counter-total");
  const leftArrow = moduleEl.querySelector(".slideshow-arrow-left");
  const rightArrow = moduleEl.querySelector(".slideshow-arrow-right");
  const seriesTabs = [...moduleEl.querySelectorAll(".slideshow-series-tab")];
  const factsEl = moduleEl.querySelector(".slideshow-facts");

  if (imageShellEl) {
    const nextMediaEl = createSlideshowMediaElement(slide);
    if (existingMediaEl) {
      existingMediaEl.replaceWith(nextMediaEl);
    } else if (emptyEl) {
      emptyEl.replaceWith(nextMediaEl);
    } else {
      imageShellEl.prepend(nextMediaEl);
    }
  }

  if (emptyEl && moduleEl.querySelector(".slideshow-media")) {
    emptyEl.style.display = "none";
  }

  if (seriesLabelEl) {
    seriesLabelEl.textContent = series?.label ?? "";
  }

  if (pieceTitleEl) {
    pieceTitleEl.textContent = slide.pieceTitle ?? "untitled";
  }

  if (pieceDescriptionEl) {
    pieceDescriptionEl.textContent = slide.fullDescription ?? "";
  }

  if (pieceSizeEl) {
    pieceSizeEl.textContent = slide.size ?? "";
  }

  if (pieceArtistEl) {
    pieceArtistEl.textContent = slide.artist ?? ".oCam";
  }

  if (pieceMediumEl) {
    pieceMediumEl.textContent = slide.medium ?? "";
  }

  if (pieceYearEl) {
    pieceYearEl.textContent = slide.year ?? "";
  }

  if (pieceLocationEl) {
    pieceLocationEl.textContent = slide.location ?? "";
  }

  if (factsEl) {
    factsEl.innerHTML = (slide.facts ?? []).map(fact => `
      <div class="slideshow-fact">
        <p class="slideshow-fact-label">${escapeHTML(fact.label ?? "")}</p>
        <p class="slideshow-fact-value">${escapeHTML(fact.value ?? "")}</p>
      </div>
    `).join("");
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

function updatePosterStudyUI(moduleEl) {
  if (!moduleEl) return;

  const key = moduleEl.dataset.posterStudyKey;
  const state = getPosterStudyState(key);
  if (!state) return;

  const slides = state.slides ?? [];
  if (!slides.length) return;

  state.activeSlideIndex = normalizePosterIndex(slides.length, state.activeSlideIndex);
  const slide = slides[state.activeSlideIndex];

  const imageEl = moduleEl.querySelector(".poster-study-image");
  const currentEl = moduleEl.querySelector(".poster-study-current");
  const backgroundEl = moduleEl.querySelector(".poster-study-background");
  const thesisEl = moduleEl.querySelector(".poster-study-thesis");
  const factsEl = moduleEl.querySelector(".poster-study-facts");
  const counterCurrentEl = moduleEl.querySelector(".poster-study-counter-current");
  const counterTotalEl = moduleEl.querySelector(".poster-study-counter-total");
  const leftArrow = moduleEl.querySelector(".poster-study-arrow-left");
  const rightArrow = moduleEl.querySelector(".poster-study-arrow-right");

  if (imageEl) {
    imageEl.src = slide.src ?? "";
    imageEl.alt = slide.alt ?? slide.pieceTitle ?? "poster image";
  }

  if (currentEl) currentEl.textContent = slide.pieceTitle ?? "";
  if (backgroundEl) backgroundEl.textContent = slide.background ?? "";
  if (thesisEl) thesisEl.textContent = slide.thesis ?? "";

  if (factsEl) {
    factsEl.innerHTML = (slide.facts ?? []).map(fact => `
      <div class="poster-study-fact">
        <p class="poster-study-fact-label">${escapeHTML(fact.label ?? "")}</p>
        <p class="poster-study-fact-value">${escapeHTML(fact.value ?? "")}</p>
      </div>
    `).join("");
  }

  if (counterCurrentEl) counterCurrentEl.textContent = String(state.activeSlideIndex + 1);
  if (counterTotalEl) counterTotalEl.textContent = String(slides.length);

  const shouldDisableNav = slides.length <= 1;
  if (leftArrow) leftArrow.disabled = shouldDisableNav;
  if (rightArrow) rightArrow.disabled = shouldDisableNav;

  const nextIndex = normalizePosterIndex(slides.length, state.activeSlideIndex + 1);
  const prevIndex = normalizePosterIndex(slides.length, state.activeSlideIndex - 1);

  if (nextIndex !== state.activeSlideIndex) {
    preloadImage(slides[nextIndex]?.src);
  }

  if (prevIndex !== state.activeSlideIndex && prevIndex !== nextIndex) {
    preloadImage(slides[prevIndex]?.src);
  }
}

function switchSlideshowSeries(moduleEl, nextSeriesIndex) {
  if (!moduleEl) return;

  const key = moduleEl.dataset.slideshowKey;
  const state = getSlideshowState(key);
  if (!state || !state.series[nextSeriesIndex]) return;

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

function stepPosterStudy(moduleEl, direction) {
  if (!moduleEl) return;

  const key = moduleEl.dataset.posterStudyKey;
  const state = getPosterStudyState(key);
  if (!state) return;

  const slides = state.slides ?? [];
  if (!slides.length) return;

  state.activeSlideIndex = normalizePosterIndex(slides.length, state.activeSlideIndex + direction);
  updatePosterStudyUI(moduleEl);

  track("poster_study_change", {
    section: activeSection ?? "unknown",
    posterStudy: key,
    slideIndex: state.activeSlideIndex
  });
}

function updateFilmCollectionBrowser(moduleEl) {
  if (!moduleEl) return;

  const key = moduleEl.dataset.filmBrowserKey;
  const state = getFilmBrowserState(key);
  if (!state) return;

  const collection = state.collections[state.activeCollectionIndex];
  if (!collection) return;

  const introEl = moduleEl.querySelector(".film-collection-intro");
  const contentEl = moduleEl.querySelector(".film-collection-content");
  const tabs = [...moduleEl.querySelectorAll(".film-collection-tab")];

  moduleEl.dataset.activeCollectionId = collection.id ?? "";

  if (introEl) {
    introEl.innerHTML = `
      ${collection.eyebrow ? `<p class="film-collection-eyebrow">${escapeHTML(collection.eyebrow)}</p>` : ""}
      <h4 class="film-collection-title">${escapeHTML(collection.title ?? "")}</h4>
      ${collection.dek ? `<p class="film-collection-dek">${escapeHTML(collection.dek)}</p>` : ""}
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

function switchFilmCollection(moduleEl, nextCollectionIndex) {
  if (!moduleEl) return;

  const key = moduleEl.dataset.filmBrowserKey;
  const state = getFilmBrowserState(key);
  if (!state || !state.collections[nextCollectionIndex]) return;

  state.activeCollectionIndex = nextCollectionIndex;
  updateFilmCollectionBrowser(moduleEl);

  track("film_collection_change", {
    section: activeSection ?? "unknown",
    browser: key,
    collection: state.collections[nextCollectionIndex]?.id ?? nextCollectionIndex
  });
}

function initSlideshows(scope = document) {
  const slideshowModules = [...scope.querySelectorAll(".slideshow-module")];

  slideshowModules.forEach(moduleEl => {
    if (moduleEl.dataset.slideshowBound === "true") {
      updateSlideshowUI(moduleEl);
      return;
    }

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

    moduleEl.dataset.slideshowBound = "true";
  });

  updateSlideDescriptionModules(scope);
}

function initPosterStudies(scope = document) {
  const posterStudies = [...scope.querySelectorAll(".poster-study-module")];

  posterStudies.forEach(moduleEl => {
    if (moduleEl.dataset.posterStudyBound === "true") {
      updatePosterStudyUI(moduleEl);
      return;
    }

    updatePosterStudyUI(moduleEl);

    const leftArrow = moduleEl.querySelector(".poster-study-arrow-left");
    const rightArrow = moduleEl.querySelector(".poster-study-arrow-right");

    leftArrow?.addEventListener("click", () => stepPosterStudy(moduleEl, -1));
    rightArrow?.addEventListener("click", () => stepPosterStudy(moduleEl, 1));

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

function initFilmCollectionBrowsers(scope = document) {
  const browsers = [...scope.querySelectorAll(".film-collection-browser")];

  browsers.forEach(moduleEl => {
    if (moduleEl.dataset.filmBrowserBound !== "true") {
      const tabs = [...moduleEl.querySelectorAll(".film-collection-tab")];
      tabs.forEach(tab => {
        tab.addEventListener("click", () => {
          const nextCollectionIndex = Number(tab.dataset.collectionIndex);
          switchFilmCollection(moduleEl, nextCollectionIndex);
        });
      });
      moduleEl.dataset.filmBrowserBound = "true";
    }

    updateFilmCollectionBrowser(moduleEl);
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
  if (shouldSuppressClick()) return;

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

function bindPanEvents() {
  if (!spaceView) return;

  spaceView.addEventListener("pointerdown", event => {
    startMiddlePan(event);
    startPrimaryPan(event);
  });

  spaceView.addEventListener("pointermove", event => {
    moveMiddlePan(event);
    movePrimaryPan(event);
  });

  spaceView.addEventListener("pointerup", event => {
    endMiddlePan(event);
    endPrimaryPan(event);
  });

  spaceView.addEventListener("pointercancel", event => {
    endMiddlePan(event);
    endPrimaryPan(event);
  });

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

  document.addEventListener("click", event => {
    if (!shouldSuppressClick()) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
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

  centerHub.addEventListener("click", () => {
    if (shouldSuppressClick()) return;
    resetView();
  });

  if (homeButton) {
    homeButton.addEventListener("click", () => {
      if (shouldSuppressClick()) return;
      resetView();
    });
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

  bindPanEvents();
}

buildAllPanels();
initFilmCollectionBrowsers();
initPosterStudies();
initSlideshows();
updateSlideDescriptionModules();
bindHoverEvents();
bindEvents();
centerRadialView();
