import { track } from "./analytics.js";

const radial = document.getElementById("radial");
const slices = [...document.querySelectorAll(".slice")];
const contentLayer = document.getElementById("contentLayer");
const backButton = document.getElementById("backButton");
const centerHub = document.getElementById("centerHub");

let activeSection = null;

const sectionContent = {
  marketing: {
    title: "marketing",
    kicker: "strategy, positioning, audience, direction",
    cards: [
      {
        title: "brand thinking",
        body: "Messaging, identity shaping, and the structure behind how things are perceived."
      },
      {
        title: "market perspective",
        body: "An interest in trends, attention, risk, and how positioning changes outcomes."
      },
      {
        title: "applied work",
        body: "A place for campaign thinking, audience insight, and practical business direction."
      }
    ]
  },

  creative: {
    title: "creative",
    kicker: "image, design, experimentation, authorship",
    cards: [
      {
        title: "visual work",
        body: "Photography, design language, and projects built around strong visual identity."
      },
      {
        title: "digital experiments",
        body: "Interfaces, motion, and interactive pieces that feel authored rather than templated."
      },
      {
        title: "creative direction",
        body: "A space for mood, presentation, sequencing, and aesthetic construction."
      }
    ]
  },

  resume: {
    title: "resume",
    kicker: "experience, skills, trajectory",
    cards: [
      {
        title: "background",
        body: "Work history, study, and the experiences that shaped both discipline and range."
      },
      {
        title: "skills",
        body: "A practical overview of technical, creative, and analytical abilities."
      },
      {
        title: "next step",
        body: "A section for formal credentials, current direction, and where things are headed."
      }
    ]
  },

  "global cultures": {
    title: "global cultures",
    kicker: "history, identity, cinema, interpretation",
    cards: [
      {
        title: "cultural analysis",
        body: "Work centered on history, ideology, identity, and the meanings carried across cultures."
      },
      {
        title: "cinema and memory",
        body: "Film-based analysis tied to national identity, historical trauma, and visual language."
      },
      {
        title: "research threads",
        body: "A space for critical writing, comparative study, and longer-form reflection."
      }
    ]
  },

  placeholder: {
    title: "placeholder",
    kicker: "expansion, experiments, future section",
    cards: [
      {
        title: "in progress",
        body: "A temporary sector reserved for future work or a new category still taking shape."
      },
      {
        title: "testing ground",
        body: "Useful as a live slot for prototypes, alternate layouts, or upcoming content."
      },
      {
        title: "future direction",
        body: "This can later become a dedicated portfolio section once the structure is clearer."
      }
    ]
  },

  about: {
    title: "about",
    kicker: "identity, direction, contact",
    cards: [
      {
        title: "approach",
        body: "A portfolio built around strategy, creativity, and authored digital presentation."
      },
      {
        title: "background",
        body: "A mix of marketing interest, creative work, technical experimentation, and analysis."
      },
      {
        title: "contact",
        body: "A landing space for personal statement, links, and ways to get in touch."
      }
    ]
  }
};

function buildPanel(section) {
  const data = sectionContent[section];
  if (!data) return null;

  const panel = document.createElement("section");
  panel.className = "content-panel";
  panel.dataset.from = section;

  panel.innerHTML = `
    <h2 class="content-title">${data.title}</h2>
    <p class="content-kicker">${data.kicker}</p>
    <div class="content-grid">
      ${data.cards.map(card => `
        <article class="content-card">
          <h3>${card.title}</h3>
          <p>${card.body}</p>
        </article>
      `).join("")}
    </div>
  `;

  return panel;
}

function openSection(section, angle, clickedSlice) {
  if (activeSection === section) return;

  activeSection = section;
  contentLayer.innerHTML = "";

  slices.forEach(slice => {
    slice.classList.remove("is-selected");
  });

  clickedSlice.classList.add("is-selected");
  radial.classList.add("is-active");

  const rotation = -Number(angle);
  radial.style.transform = `scale(1.08) rotate(${rotation}deg)`;

  const panel = buildPanel(section);
  if (!panel) return;

  contentLayer.appendChild(panel);
  track("section_open", { section });

  requestAnimationFrame(() => {
    panel.classList.add("is-visible");
    backButton.classList.add("is-visible");
  });
}

function closeSection() {
  if (activeSection) {
    track("section_close", { section: activeSection });
  }

  activeSection = null;
  radial.classList.remove("is-active");
  radial.style.transform = "scale(1) rotate(0deg)";
  backButton.classList.remove("is-visible");

  const panel = contentLayer.querySelector(".content-panel");
  if (panel) {
    panel.classList.remove("is-visible");
    setTimeout(() => {
      contentLayer.innerHTML = "";
    }, 450);
  }

  slices.forEach(slice => {
    slice.classList.remove("is-selected");
  });
}

slices.forEach(slice => {
  slice.addEventListener("click", () => {
    const section = slice.dataset.section;
    const angle = slice.dataset.angle;

    track("slice_click", {
      section,
      angle: Number(angle)
    });

    openSection(section, angle, slice);
  });
});

backButton.addEventListener("click", closeSection);
centerHub.addEventListener("click", closeSection);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && activeSection) {
    closeSection();
  }
});
