import { track } from "./analytics.js";

const root = document.documentElement;
const radial = document.getElementById("radial");
const centerHub = document.getElementById("centerHub");
const homeButton = document.getElementById("homeButton");

const slices = [...document.querySelectorAll(".slice-group")];
const labels = [...document.querySelectorAll(".slice-label")];
const panels = [...document.querySelectorAll(".section-panel")];

let activeSection = null;

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

  resume: {
    title: "resume",
    kicker: "experience, skills, trajectory",
    modules: [
      {
        type: "two-up",
        items: [
          {
            title: "experience",
            copy: "Work history, study, operational ability, and the discipline behind the presentation."
          },
          {
            title: "skills",
            copy: "Technical, analytical, creative, and practical strengths."
          }
        ]
      },
      {
        type: "text",
        title: "next step",
        copy: "This section can become a more formal resume surface with downloadable assets, links, and structured milestones."
      }
    ]
  },

  writing: {
    title: "writing",
    kicker: "history, identity, cinema, interpretation",
    modules: [
      {
        type: "text",
        title: "critical work",
        copy: "Long-form writing, historical analysis, cultural interpretation, and comparative work can all sit here in proper reading layouts."
      },
      {
        type: "embed",
        title: "essay or publication",
        mediaLabel: "article embed / document preview / pdf window"
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
        copy: "This can hold reviews, national cinema work, lists, sequences, and visual arguments."
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
        copy: "A portfolio built around strategy, creativity, authorship, and strong digital presentation."
      },
      {
        type: "two-up",
        items: [
          {
            title: "background",
            copy: "Marketing interest, creative work, technical experimentation, writing, and visual thinking."
          },
          {
            title: "contact / links",
            copy: "This side can later hold social links, contact details, or a compact intro statement."
          }
        ]
      }
    ]
  }
};

const desktopCameraTargets = {
  marketing: { x: 0, y: 250 },
  creative: { x: -320, y: 200 },
  resume: { x: -320, y: -180 },
  writing: { x: 0, y: -255 },
  film: { x: 320, y: -180 },
  about: { x: 320, y: 200 }
};

const mobileCameraTargets = {
  marketing: { x: 0, y: 220 },
  creative: { x: -205, y: 175 },
  resume: { x: -205, y: -160 },
  writing: { x: 0, y: -230 },
  film: { x: 205, y: -160 },
  about: { x: 205, y: 175 }
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

function clearHoveredLabels() {
  labels.forEach(label => label.classList.remove("is-hovered"));
}

function applyCamera(section) {
  if (!section) {
    root.style.setProperty("--camera-x", "0px");
    root.style.setProperty("--camera-y", "0px");
    return;
  }

  const targets = getCameraTargets();
  const target = targets[section] ?? { x: 0, y: 0 };

  root.style.setProperty("--camera-x", `${target.x}px`);
  root.style.setProperty("--camera-y", `${target.y}px`);
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

function buildPanel(section, data) {
  const panel = getPanel(section);
  if (!panel || !data) return;

  panel.innerHTML = `
    <header class="panel-header">
      <h2 class="panel-title" id="panel-title-${section}">${data.title}</h2>
      <p class="panel-kicker">${data.kicker}</p>
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
  labels.forEach(label => label.classList.remove("is-selected"));
  panels.forEach(panel => panel.classList.remove("is-active"));
}

function openSection(section, clickedSlice) {
  if (!section || !clickedSlice) return;

  activeSection = section;
  clearHoveredLabels();
  clearSelectedState();

  clickedSlice.classList.add("is-selected");

  const label = getLabel(section);
  if (label) label.classList.add("is-selected");

  const panel = getPanel(section);
  if (panel) panel.classList.add("is-active");

  radial.classList.add("is-active");
  applyCamera(section);

  track("slice_click", { section });
  track("section_open", { section });
}

function resetView() {
  if (activeSection) {
    track("section_close", { section: activeSection });
  }

  activeSection = null;
  clearHoveredLabels();
  clearSelectedState();
  radial.classList.remove("is-active");
  applyCamera(null);
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

function bindEvents() {
  slices.forEach(slice => {
    slice.addEventListener("mouseenter", () => {
      const section = slice.dataset.section;
      const label = getLabel(section);
      if (!label || activeSection === section) return;
      label.classList.add("is-hovered");
    });

    slice.addEventListener("mouseleave", () => {
      const section = slice.dataset.section;
      const label = getLabel(section);
      if (!label) return;
      label.classList.remove("is-hovered");
    });

    slice.addEventListener("focus", () => {
      const section = slice.dataset.section;
      const label = getLabel(section);
      if (!label || activeSection === section) return;
      label.classList.add("is-hovered");
    });

    slice.addEventListener("blur", () => {
      const section = slice.dataset.section;
      const label = getLabel(section);
      if (!label) return;
      label.classList.remove("is-hovered");
    });

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
    applyCamera(activeSection);
  });
}

buildAllPanels();
bindEvents();
applyCamera(null);
