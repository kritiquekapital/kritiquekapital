const radial = document.getElementById("radial");
const slices = [...document.querySelectorAll(".slice")];
const contentLayer = document.getElementById("contentLayer");
const backButton = document.getElementById("backButton");
const centerHub = document.getElementById("centerHub");

let activeSection = null;

const sectionContent = {
  music: {
    title: "music",
    kicker: "playlists, sound, motion, mood",
    cards: [
      {
        title: "playlists",
        body: "A living archive of sequencing, atmosphere, and emotional architecture."
      },
      {
        title: "sound experiments",
        body: "Interactive media, transport controls, embedded players, and ambient systems."
      },
      {
        title: "score logic",
        body: "Moments where sound is not just content but part of navigation itself."
      }
    ]
  },
  code: {
    title: "code",
    kicker: "systems, experiments, site logic",
    cards: [
      {
        title: "front-end builds",
        body: "Interactive UI systems, theme engines, custom behavior, and playful motion."
      },
      {
        title: "site mechanics",
        body: "Physics objects, modular controls, state-based UI, and experimental navigation."
      },
      {
        title: "projects",
        body: "Small digital objects that feel authored instead of templated."
      }
    ]
  },
  photo: {
    title: "photo",
    kicker: "framing, texture, presence",
    cards: [
      {
        title: "portraits",
        body: "Work focused on tension, intimacy, and strong visual identity."
      },
      {
        title: "atmosphere",
        body: "Images built around light, stillness, environment, and subtle unease."
      },
      {
        title: "selected work",
        body: "A space for galleries, sequences, and image-led storytelling."
      }
    ]
  },
  writing: {
    title: "writing",
    kicker: "analysis, reflection, construction",
    cards: [
      {
        title: "critical work",
        body: "Longer writing on film, ideology, aesthetics, and historical memory."
      },
      {
        title: "statements",
        body: "Short-form pieces, captions, fragments, and personal positioning."
      },
      {
        title: "notes",
        body: "A place for unfinished thoughts that still deserve shape."
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
  radial.style.transform = `scale(1.16) rotate(${rotation}deg)`;

  const panel = buildPanel(section);
  if (!panel) return;

  contentLayer.appendChild(panel);

  requestAnimationFrame(() => {
    panel.classList.add("is-visible");
    backButton.classList.add("is-visible");
  });
}

function closeSection() {
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
    openSection(section, angle, slice);
  });
});

backButton.addEventListener("click", closeSection);
centerHub.addEventListener("click", closeSection);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeSection) {
    closeSection();
  }
});
