import { track } from "./analytics.js";
import { resumeSection } from "./sections/resume-section.js";

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

  creative: {
    title: "creative",
    kicker: "image, design, experimentation, authorship",
    modules: [
      {
        type: "slideshow",
        title: "selected visual work",
        mediaLabel: "slideshow / gallery goes here"
      },
      {
        type: "text",
        title: "direction",
        copy: "Photography, interface work, and digital experiments can live side by side here with room to breathe."
      }
    ]
  },

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
        mediaLabel: "film slideshow goes here"
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

function renderSlideshowModule(module) {
  return `
    <section class="module">
      <div class="module-inner">
        <h3 class="module-title">${module.title}</h3>
      </div>
      <div class="slideshow-placeholder">${module.mediaLabel}</div>
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

function renderModule(module) {
  switch (module.type) {
    case "text":
      return renderTextModule(module);
    case "embed":
      return renderEmbedModule(module);
    case "slideshow":
      return renderSlideshowModule(module);
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
      ${data.modules.map(renderModule).join("")}
    </div>
  `;
}

function buildAllPanels() {
  Object.entries(sectionContent).forEach(([section, data]) => {
    buildPanel(section, data);
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
bindHoverEvents();
bindEvents();
centerRadialView();
