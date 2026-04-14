import { escapeHTML } from "../utils.js";

function renderScrollableTextCard(title = "", paragraphs = [], extraClass = "") {
  return `
    <section class="module ${extraClass}">
      <div class="module-inner">
        <h3 class="module-title">${escapeHTML(title)}</h3>
        <div class="music-text-scroll">
          ${(Array.isArray(paragraphs) ? paragraphs : [])
            .map(paragraph => `<p class="module-copy">${escapeHTML(paragraph)}</p>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderVideoCard(video = {}) {
  return `
    <section class="module music-video-card">
      <div class="music-video-frame-shell">
        <div
          class="music-video-frame"
          style="--music-video-aspect: ${escapeHTML(video.aspectRatio ?? "16 / 9")};"
        >
          <iframe
            src="${escapeHTML(video.src ?? "")}"
            allowfullscreen
            loading="lazy"
            title="${escapeHTML(video.title ?? "video")}"
          ></iframe>
        </div>
      </div>
    </section>
  `;
}

function renderSongTabs(entries = [], activeIndex = 0) {
  if (entries.length <= 1) return "";

  return `
    <div class="music-song-tabs" role="tablist" aria-label="songs">
      ${entries
        .map(
          (entry, index) => `
            <button
              class="music-song-tab ${index === activeIndex ? "is-active" : ""}"
              type="button"
              role="tab"
              aria-selected="${index === activeIndex ? "true" : "false"}"
              data-song-index="${index}"
            >
              ${escapeHTML(entry.label ?? entry.title ?? `song ${index + 1}`)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderAnalysisTabs(series = [], activeIndex = 0) {
  if (series.length <= 1) return "";

  return `
    <div class="music-analysis-tabs" role="tablist" aria-label="analysis readings">
      ${series
        .map(
          (entry, index) => `
            <button
              class="music-analysis-tab ${index === activeIndex ? "is-active" : ""}"
              type="button"
              role="tab"
              aria-selected="${index === activeIndex ? "true" : "false"}"
              data-analysis-index="${index}"
            >
              ${escapeHTML(entry.label ?? `reading ${index + 1}`)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function normalizeAnalysisSeries(entry = {}) {
  if (Array.isArray(entry.analysisSeries) && entry.analysisSeries.length) {
    return entry.analysisSeries;
  }

  if (entry.analysis) {
    return [
      {
        label: "analysis",
        title: entry.analysis.title ?? "analysis",
        paragraphs: Array.isArray(entry.analysis.paragraphs) ? entry.analysis.paragraphs : []
      }
    ];
  }

  return [
    {
      label: "analysis",
      title: "analysis",
      paragraphs: []
    }
  ];
}

function renderAnalysisCard(entry = {}, activeReadingIndex = 0) {
  const analysisSeries = normalizeAnalysisSeries(entry);
  const activeReading = analysisSeries[activeReadingIndex] ?? analysisSeries[0];

  return `
    <section
      class="module music-analysis-card"
      data-analysis-series='${escapeHTML(JSON.stringify(analysisSeries))}'
    >
      <div class="module-inner">
        <h3 class="module-title music-analysis-title">${escapeHTML(activeReading.title ?? "analysis")}</h3>
        ${renderAnalysisTabs(analysisSeries, activeReadingIndex)}
        <div class="music-text-scroll music-analysis-scroll">
          ${(Array.isArray(activeReading.paragraphs) ? activeReading.paragraphs : [])
            .map(paragraph => `<p class="module-copy">${escapeHTML(paragraph)}</p>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderInfoCard(entry = {}) {
  return `
    <section class="module music-info-card">
      <div class="module-inner">
        ${entry.eyebrow
          ? `<p class="music-feature-eyebrow">${escapeHTML(entry.eyebrow)}</p>`
          : ""}
        <h3 class="music-feature-title">${escapeHTML(entry.title ?? "")}</h3>
        ${entry.dek
          ? `<p class="music-feature-dek">${escapeHTML(entry.dek)}</p>`
          : ""}
      </div>
    </section>
  `;
}

function renderActiveSong(entry = {}) {
  const video = entry.video ?? {};
  const lyrics = entry.lyrics ?? {};

  return `
    <div class="music-feature-grid">
      <div class="music-feature-cell music-feature-video-stack">
        <div class="music-video-stack">
          ${renderInfoCard(entry)}
          ${renderVideoCard(video)}
        </div>
      </div>

      <div class="music-feature-cell music-feature-analysis">
        ${renderAnalysisCard(entry, 0)}
      </div>

      <div class="music-feature-cell music-feature-lyrics">
        ${renderScrollableTextCard(
          lyrics.title ?? "lyrics",
          Array.isArray(lyrics.paragraphs) ? lyrics.paragraphs : ["*"],
          "music-lyrics-card"
        )}
      </div>
    </div>
  `;
}

function bindAnalysisTabs(scope = document) {
  scope.querySelectorAll(".music-analysis-card").forEach(card => {
    if (card.dataset.analysisBound === "true") return;

    let series = [];
    try {
      series = JSON.parse(card.dataset.analysisSeries ?? "[]");
    } catch {
      series = [];
    }

    const tabs = [...card.querySelectorAll(".music-analysis-tab")];
    const titleEl = card.querySelector(".music-analysis-title");
    const scrollEl = card.querySelector(".music-analysis-scroll");

    tabs.forEach(tab => {
      tab.addEventListener("click", event => {
        event.preventDefault();

        const nextIndex = Number(tab.dataset.analysisIndex);
        const next = series[nextIndex];
        if (!next || !titleEl || !scrollEl) return;

        tabs.forEach(button => {
          button.classList.remove("is-active");
          button.setAttribute("aria-selected", "false");
        });

        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");

        titleEl.textContent = next.title ?? "analysis";
        scrollEl.innerHTML = (Array.isArray(next.paragraphs) ? next.paragraphs : [])
          .map(paragraph => `<p class="module-copy">${escapeHTML(paragraph)}</p>`)
          .join("");
        scrollEl.scrollTop = 0;
      });
    });

    card.dataset.analysisBound = "true";
  });
}

function bindSongTabs(scope = document) {
  scope.querySelectorAll(".music-feature-module").forEach(moduleEl => {
    if (moduleEl.dataset.songTabsBound === "true") return;

    let entries = [];
    try {
      entries = JSON.parse(moduleEl.dataset.musicEntries ?? "[]");
    } catch {
      entries = [];
    }

    const tabsShell = moduleEl.querySelector(".music-song-tabs-shell");
    const stage = moduleEl.querySelector(".music-song-stage-shell");
    if (!tabsShell || !stage) return;

    const renderSong = index => {
      const entry = entries[index];
      if (!entry) return;

      tabsShell.innerHTML = renderSongTabs(entries, index);
      stage.innerHTML = renderActiveSong(entry);
      bindAnalysisTabs(stage);
      attachSongTabListeners();
    };

    const attachSongTabListeners = () => {
      tabsShell.querySelectorAll(".music-song-tab").forEach(tab => {
        tab.addEventListener("click", event => {
          event.preventDefault();
          const nextIndex = Number(tab.dataset.songIndex);
          renderSong(nextIndex);
        });
      });
    };

    renderSong(0);
    moduleEl.dataset.songTabsBound = "true";
  });
}

export function renderMusicFeatureModule(module) {
  const entries = Array.isArray(module.entries) && module.entries.length
    ? module.entries
    : [module];

  queueMicrotask(() => {
    bindSongTabs(document);
    bindAnalysisTabs(document);
  });

  return `
    <section
      class="module music-feature-module"
      data-music-entries='${escapeHTML(JSON.stringify(entries))}'
    >
      <div class="music-song-tabs-shell"></div>
      <div class="music-song-stage-shell"></div>
    </section>
  `;
}