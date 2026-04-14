import { track }                         from "./analytics.js";
import { setActiveSection, activeSection as getActive } from "./state.js";
import { escapeHTML }                    from "./utils.js";
import { renderModule }                  from "./renderers/module.js";
import { renderHeaderActions }           from "./renderers/text.js";
import { buildResumePanel }              from "./renderers/resume.js";
import {
  clearRegistries,
  initSlideshows,
  initPosterStudies,
  updateSlideDescriptionModules
} from "./renderers/slideshow.js";
import { initFilmCollectionBrowsers }    from "./renderers/film-browser.js";

import { marketingSection } from "./sections/marketing-section.js";
import { creativeSection }  from "./sections/creative-section.js";
import { musicSection }     from "./sections/music-section.js";
import { resumeSection }    from "./sections/resume-section.js";
import { filmSection }      from "./sections/film-section.js";
import { writingSection }   from "./sections/writing-section.js";

// ── DOM refs ──────────────────────────────────────────────────────────────────

const root        = document.documentElement;
const radial      = document.getElementById("radial");
const centerHub   = document.getElementById("centerHub");
const homeButton  = document.getElementById("homeButton");
const spaceView   = document.querySelector(".space-view");
const spaceCamera = document.querySelector(".space-camera");

const slices = [...document.querySelectorAll(".slice-group")];
const labels = [...document.querySelectorAll(".slice-label")];
const panels = [...document.querySelectorAll(".section-panel")];

// ── Section content map ───────────────────────────────────────────────────────

const sectionContent = {
  marketing: marketingSection,
  creative:  creativeSection,
  music:     musicSection,
  resume:    resumeSection,
  film:      filmSection,
  writing:   writingSection
};

// ── Camera state ──────────────────────────────────────────────────────────────

const baseCamera = { x: 0, y: 0 };
const panOffset  = { x: 0, y: 0 };

const desktopCameraTargets = {
  1: { x:    0, y:  250 },
  2: { x: -320, y:  400 },
  3: { x: -320, y: -180 },
  4: { x:  850, y: -410 },
  5: { x:  620, y:  200 },
  6: { x:  360, y: -700 }
};

const mobileCameraTargets = {
  1: { x:    0, y:  220 },
  2: { x: -205, y:  175 },
  3: { x: -205, y: -160 },
  4: { x:   92, y:  -88 },
  5: { x:  205, y:  175 },
  6: { x:  205, y: -160 }
};

function getCameraTargets() {
  return window.innerWidth <= 760 ? mobileCameraTargets : desktopCameraTargets;
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

  const panel = document.querySelector(`.section-panel[data-slot="${slot}"]`);
  if (!panel) return;

  const panelRect = panel.getBoundingClientRect();
  const viewRect  = spaceView.getBoundingClientRect();

  // center of panel relative to viewport
  const panelCenterX = panelRect.left + panelRect.width / 2;
  const panelCenterY = panelRect.top  + panelRect.height / 2;

  const viewCenterX = viewRect.left + viewRect.width / 2;
  const viewCenterY = viewRect.top  + viewRect.height / 2;

  // how far off center → invert for camera
  baseCamera.x += (viewCenterX - panelCenterX);
  baseCamera.y += (viewCenterY - panelCenterY);
  applyCombinedCamera();
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
  setBaseCamera(null);
}

// ── Pan state ─────────────────────────────────────────────────────────────────

let isMiddlePanning        = false;
let middlePanPointerId     = null;
let lastPanPoint           = { x: 0, y: 0 };

let isPrimaryPanning           = false;
let primaryPanPointerId        = null;
let primaryPanExceededThreshold = false;
let primaryPanStartPoint       = { x: 0, y: 0 };
let primaryPanLastPoint        = { x: 0, y: 0 };
let suppressClickUntil         = 0;

const PAN_DRAG_THRESHOLD = 7;

function markDraggingState(enabled) {
  spaceView?.classList.toggle("is-dragging", enabled);
}

function releasePointerCaptureSafe(pointerId) {
  try { spaceView?.releasePointerCapture(pointerId); } catch (_) {}
}

function setPointerCaptureSafe(pointerId) {
  try { spaceView?.setPointerCapture(pointerId); } catch (_) {}
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function isTouchLikePointer(event) {
  return event.pointerType === "touch" || event.pointerType === "pen";
}

function isPrimaryPointer(event) {
  return event.pointerType === "mouse" ? event.button === 0 : true;
}

function isInteractiveTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest([
      ".slice-group", "#centerHub", "#homeButton",
      "a", "button", "input", "textarea", "select", "option", "label",
      "video", "audio", "summary", "[role='button']",
      ".slideshow-arrow", ".slideshow-series-tab",
      ".film-collection-tab", ".poster-study-arrow"
    ].join(", "))
  );
}

function isLikelyTextSelectionTarget(target) {
  if (!(target instanceof Element)) return false;
  if (isMobileViewport()) return false;
  return Boolean(
    target.closest([
      ".panel-title", ".panel-kicker", ".module-title", ".module-subtitle",
      ".module-copy", ".stack-card-title", ".resume-bullet-list li",
      ".resume-pill-item span", ".panel-action-text", ".film-analysis-list li",
      ".slideshow-piece-title", ".slideshow-piece-description",
      ".poster-study-title", ".poster-study-current", ".poster-study-fact-value",
      ".film-triptych-card-title", ".film-triptych-card-meta", ".film-triptych-card-copy",
      ".slide-description-copy",
      "p", "li", "h1", "h2", "h3", "h4", "h5", "h6"
    ].join(", "))
  );
}

function hasActiveTextSelection() {
  const sel = window.getSelection?.();
  return Boolean(sel && !sel.isCollapsed && String(sel).trim().length > 0);
}

function shouldSuppressClick() {
  return performance.now() < suppressClickUntil;
}

// Middle-button pan
function startMiddlePan(event) {
  if (event.button !== 1) return;
  event.preventDefault();
  isMiddlePanning    = true;
  middlePanPointerId = event.pointerId;
  lastPanPoint       = { x: event.clientX, y: event.clientY };
  setPanTransitionEnabled(false);
  markDraggingState(true);
  setPointerCaptureSafe(event.pointerId);
}

function moveMiddlePan(event) {
  if (!isMiddlePanning || event.pointerId !== middlePanPointerId) return;
  panOffset.x += event.clientX - lastPanPoint.x;
  panOffset.y += event.clientY - lastPanPoint.y;
  lastPanPoint = { x: event.clientX, y: event.clientY };
  applyCombinedCamera();
}

function endMiddlePan(event) {
  if (!isMiddlePanning || event.pointerId !== middlePanPointerId) return;
  isMiddlePanning = false;
  releasePointerCaptureSafe(event.pointerId);
  middlePanPointerId = null;
  setPanTransitionEnabled(true);
  markDraggingState(isPrimaryPanning);
}

// Primary-button / touch pan
function startPrimaryPan(event) {
  if (!isPrimaryPointer(event)) return;
  if (isInteractiveTarget(event.target)) return;
  if (isLikelyTextSelectionTarget(event.target) && !isTouchLikePointer(event)) return;

  isPrimaryPanning            = true;
  primaryPanPointerId         = event.pointerId;
  primaryPanExceededThreshold = false;
  primaryPanStartPoint        = { x: event.clientX, y: event.clientY };
  primaryPanLastPoint         = { x: event.clientX, y: event.clientY };

  setPanTransitionEnabled(false);
  setPointerCaptureSafe(event.pointerId);
}

function movePrimaryPan(event) {
  if (!isPrimaryPanning || event.pointerId !== primaryPanPointerId) return;

  const dx = event.clientX - primaryPanStartPoint.x;
  const dy = event.clientY - primaryPanStartPoint.y;

  if (!primaryPanExceededThreshold) {
    if (Math.hypot(dx, dy) < PAN_DRAG_THRESHOLD) return;
    if (hasActiveTextSelection() && !isTouchLikePointer(event)) {
      cancelPrimaryPan(event.pointerId);
      return;
    }
    primaryPanExceededThreshold = true;
    markDraggingState(true);
  }

  event.preventDefault();
  panOffset.x += event.clientX - primaryPanLastPoint.x;
  panOffset.y += event.clientY - primaryPanLastPoint.y;
  primaryPanLastPoint = { x: event.clientX, y: event.clientY };
  applyCombinedCamera();
}

function cancelPrimaryPan(pointerId) {
  if (!isPrimaryPanning || pointerId !== primaryPanPointerId) return;
  isPrimaryPanning            = false;
  primaryPanPointerId         = null;
  primaryPanExceededThreshold = false;
  releasePointerCaptureSafe(pointerId);
  setPanTransitionEnabled(true);
  markDraggingState(isMiddlePanning);
}

function endPrimaryPan(event) {
  if (!isPrimaryPanning || event.pointerId !== primaryPanPointerId) return;
  const didDrag = primaryPanExceededThreshold;
  isPrimaryPanning            = false;
  primaryPanPointerId         = null;
  primaryPanExceededThreshold = false;
  releasePointerCaptureSafe(event.pointerId);
  setPanTransitionEnabled(true);
  markDraggingState(isMiddlePanning);
  if (didDrag) suppressClickUntil = performance.now() + 220;
}

// ── View helpers ──────────────────────────────────────────────────────────────

function getLabel(section)  { return labels.find(l => l.dataset.section === section) ?? null; }
function getPanel(section)  { return panels.find(p => p.dataset.section === section) ?? null; }
function getSlice(section)  { return slices.find(s => s.dataset.section === section) ?? null; }

function clearSelectedState() {
  slices.forEach(s => s.classList.remove("is-selected"));
  labels.forEach(l => l.classList.remove("is-selected", "is-hovered"));
  panels.forEach(p => p.classList.remove("is-active"));
}

// ── Section open / close ──────────────────────────────────────────────────────

function openSection(section, clickedSlice) {
  if (!section || !clickedSlice) return;
  const slot = clickedSlice.dataset.slot;
  if (!slot) return;

  setActiveSection(section);
  clearSelectedState();

  clickedSlice.classList.add("is-selected");
  getLabel(section)?.classList.add("is-selected");
  getPanel(section)?.classList.add("is-active");

  radial.classList.add("is-active");
  setBaseCamera(slot);

  track("slice_click",   { section });
  track("section_open",  { section });
}

function resetView() {
  const current = getActive; // live binding read
  if (current) track("section_close", { section: current });

  setActiveSection(null);
  clearSelectedState();
  radial.classList.remove("is-active");
  setPanTransitionEnabled(true);
  centerRadialView();
}

function handleSliceActivate(slice) {
  if (shouldSuppressClick()) return;
  const section = slice.dataset.section;
  if (!section) return;

  // read live binding each time
  if (getActive === section) { resetView(); return; }
  openSection(section, slice);
}

// ── Panel building ────────────────────────────────────────────────────────────

function applyPanelSectionClass(panel, section) {
  if (!panel) return;
  [...panel.classList]
    .filter(c => c.startsWith("panel-") && c !== "section-panel")
    .forEach(c => panel.classList.remove(c));
  if (section) panel.classList.add(`panel-${section}`);
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
      ${renderHeaderActions(data.headerActions ?? [])}
    </header>
    <div class="panel-content">
      ${data.modules
        .map((module, moduleIndex) => renderModule(module, section, moduleIndex))
        .join("")}
    </div>
  `;
}

function buildAllPanels() {
  clearRegistries();
  Object.entries(sectionContent).forEach(([section, data]) => buildPanel(section, data));
}

// ── Event binding ─────────────────────────────────────────────────────────────

function bindHoverEvents() {
  slices.forEach(slice => {
    const section = slice.dataset.section;
    const label   = getLabel(section);
    if (!label) return;

    slice.addEventListener("mouseenter", () => { if (!getActive) label.classList.add("is-hovered"); });
    slice.addEventListener("mouseleave", () => { if (!getActive) label.classList.remove("is-hovered"); });
    slice.addEventListener("focus",      () => { if (!getActive) label.classList.add("is-hovered"); });
    slice.addEventListener("blur",       () => { if (!getActive) label.classList.remove("is-hovered"); });
  });
}

function bindPanEvents() {
  if (!spaceView) return;

  spaceView.addEventListener("pointerdown",  event => { startMiddlePan(event); startPrimaryPan(event); });
  spaceView.addEventListener("pointermove",  event => { moveMiddlePan(event);  movePrimaryPan(event);  });
  spaceView.addEventListener("pointerup",    event => { endMiddlePan(event);   endPrimaryPan(event);   });
  spaceView.addEventListener("pointercancel",event => { endMiddlePan(event);   endPrimaryPan(event);   });

  spaceView.addEventListener("auxclick",   event => { if (event.button === 1) event.preventDefault(); });
  spaceView.addEventListener("mousedown",  event => { if (event.button === 1) event.preventDefault(); });

  document.addEventListener("click", event => {
    if (!shouldSuppressClick()) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
}

function bindEvents() {
  slices.forEach(slice => {
    slice.addEventListener("click",   () => handleSliceActivate(slice));
    slice.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSliceActivate(slice);
      }
    });
  });

  centerHub?.addEventListener("click", () => { if (!shouldSuppressClick()) resetView(); });
  homeButton?.addEventListener("click", () => { if (!shouldSuppressClick()) resetView(); });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") resetView();
  });

  window.addEventListener("resize", () => {
    if (!getActive) { centerRadialView(); return; }
    setBaseCamera(getSlice(getActive)?.dataset.slot ?? null);
  });

  bindPanEvents();
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

buildAllPanels();
initFilmCollectionBrowsers();
initPosterStudies();
initSlideshows();
updateSlideDescriptionModules();
bindHoverEvents();
bindEvents();
centerRadialView();
