import { escapeHTML }             from "../utils.js";
import { track, bindScrollDepth } from "../analytics.js";

// ── Tabs ──────────────────────────────────────────────────────────────────────

function renderWritingTabs(entries = [], activeIndex = 0) {
  if (entries.length <= 1) return "";

  return `
    <div class="writing-tabs" role="tablist" aria-label="writings">
      ${entries
        .map(
          (entry, index) => `
          <button
            class="writing-tab ${index === activeIndex ? "is-active" : ""}"
            type="button"
            role="tab"
            aria-selected="${index === activeIndex ? "true" : "false"}"
            data-writing-index="${index}"
          >
            ${escapeHTML(entry.label ?? entry.title ?? `writing ${index + 1}`)}
          </button>
        `
        )
        .join("")}
    </div>
  `;
}

function renderWritingSubTabs(entry = {}, activeSubIndex = 0) {
  const subEntries = Array.isArray(entry.entries) ? entry.entries : [];

  if (subEntries.length <= 1) return "";

  return `
    <div class="writing-subtabs" role="tablist" aria-label="writing series entries">
      ${subEntries
        .map(
          (subEntry, index) => `
            <button
              class="writing-subtab ${index === activeSubIndex ? "is-active" : ""}"
              type="button"
              role="tab"
              aria-selected="${index === activeSubIndex ? "true" : "false"}"
              data-writing-subindex="${index}"
            >
              <span class="writing-subtab-roman">
                ${escapeHTML(subEntry.label ?? `${index + 1}.`)}
              </span>

              ${JSON.stringify(subEntry)
                ? `
                  <span class="writing-subtab-title">
                    ${escapeHTML(subEntry.fullLabel)}
                  </span>
                `
                : ""}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}
// ── Text entry ────────────────────────────────────────────────────────────────

function renderWritingBody(entry = {}) {
  const paragraphs = Array.isArray(entry.body) ? entry.body : [];

  return `
    <div class="writing-body-card">
      <div class="writing-body-scroll">
        ${entry.title
          ? `<h2 class="writing-body-title">${escapeHTML(entry.title)}</h2>`
          : ""}
        ${entry.dek
          ? `<p class="writing-body-dek">${escapeHTML(entry.dek)}</p>`
          : ""}
        <div class="writing-body-rule"></div>
        <div class="writing-body-text">
          ${paragraphs
            .map(p => `<p class="writing-paragraph">${escapeHTML(p)}</p>`)
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderWritingMeta(entry = {}) {
  const tags = Array.isArray(entry.tags) ? entry.tags : [];

  const fields = [
    { label: "author",      value: entry.author      ?? null },
    { label: "form",        value: entry.form        ?? null },
    { label: "subject",     value: entry.subject     ?? null },
    { label: "publication", value: entry.publication ?? null },
    { label: "year",        value: entry.year        ?? null },
  ].filter(f => f.value);

  return `
    <aside class="writing-meta-card">
      <div class="writing-meta-inner">
        ${entry.eyebrow
          ? `<p class="writing-meta-eyebrow">${escapeHTML(entry.eyebrow)}</p>`
          : ""}
        <h3 class="writing-meta-title">${escapeHTML(entry.title ?? "")}</h3>

        ${fields.length
          ? `<div class="writing-meta-fields">
               ${fields
                 .map(f => `
                   <div class="writing-meta-field">
                     <p class="writing-meta-label">${escapeHTML(f.label)}</p>
                     <p class="writing-meta-value">${escapeHTML(f.value)}</p>
                   </div>`)
                 .join("")}
             </div>`
          : ""}

        ${tags.length
          ? `<div class="writing-meta-tags">
               ${tags.map(tag => `<span class="writing-meta-tag">${escapeHTML(tag)}</span>`).join("")}
             </div>`
          : ""}

        ${entry.note
          ? `<div class="writing-meta-note">
               <p class="writing-meta-note-text">${escapeHTML(entry.note)}</p>
             </div>`
          : ""}
      </div>
    </aside>
  `;
}

// ── Presentation entry ────────────────────────────────────────────────────────

function renderSlide(slide, index) {
  const isActive = index === 0;
  const baseClass = `writing-pres-slide ${isActive ? "is-active" : ""}`;

  if (slide.type === "video") {
    return `
      <div
        class="${baseClass} writing-pres-slide--video"
        data-slide-index="${index}"
      >
        <iframe
          class="writing-pres-iframe"
          src=""
          data-src="https://www.youtube.com/embed/${escapeHTML(slide.videoId)}?rel=0"
          title="${escapeHTML(slide.alt ?? `video ${index + 1}`)}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          frameborder="0"
        ></iframe>
      </div>
    `;
  }

  return `
    <img
      class="${baseClass}"
      src="${escapeHTML(slide.src)}"
      alt="${escapeHTML(slide.alt ?? `slide ${index + 1}`)}"
      loading="${isActive ? "eager" : "lazy"}"
      data-slide-index="${index}"
    />
  `;
}

function renderPresentationBody(entry = {}) {
  const slides = Array.isArray(entry.slides) ? entry.slides : [];

  return `
    <div class="writing-pres-viewer">
      <div class="writing-pres-track">
        ${slides.map((slide, index) => renderSlide(slide, index)).join("")}
      </div>

      <button class="writing-pres-arrow writing-pres-arrow-prev" type="button" aria-label="previous slide" disabled>
        <span>‹</span>
      </button>
      <button class="writing-pres-arrow writing-pres-arrow-next" type="button" aria-label="next slide" ${slides.length <= 1 ? "disabled" : ""}>
        <span>›</span>
      </button>

      <div class="writing-pres-counter" aria-live="polite">
        <span class="writing-pres-counter-current">1</span>
        <span>/</span>
        <span>${slides.length}</span>
      </div>
    </div>
  `;
}

function renderPresentationMeta(entry = {}) {
  const tags = Array.isArray(entry.tags) ? entry.tags : [];

  const fields = [
    { label: "author",  value: entry.author  ?? null },
    { label: "form",    value: entry.form    ?? null },
    { label: "subject", value: entry.subject ?? null },
    { label: "year",    value: entry.year    ?? null },
  ].filter(f => f.value);

  return `
    <aside class="writing-meta-card writing-pres-meta">
      <div class="writing-meta-inner">
        ${entry.eyebrow
          ? `<p class="writing-meta-eyebrow">${escapeHTML(entry.eyebrow)}</p>`
          : ""}
        <h3 class="writing-meta-title">${escapeHTML(entry.title ?? "")}</h3>
        ${entry.dek
          ? `<p class="writing-pres-dek">${escapeHTML(entry.dek)}</p>`
          : ""}

        ${fields.length
          ? `<div class="writing-meta-fields">
               ${fields
                 .map(f => `
                   <div class="writing-meta-field">
                     <p class="writing-meta-label">${escapeHTML(f.label)}</p>
                     <p class="writing-meta-value">${escapeHTML(f.value)}</p>
                   </div>`)
                 .join("")}
             </div>`
          : ""}

        ${tags.length
          ? `<div class="writing-meta-tags">
               ${tags.map(tag => `<span class="writing-meta-tag">${escapeHTML(tag)}</span>`).join("")}
             </div>`
          : ""}

        ${entry.note
          ? `<div class="writing-meta-note">
               <p class="writing-meta-note-text">${escapeHTML(entry.note)}</p>
             </div>`
          : ""}
      </div>
    </aside>
  `;
}

// ── Stage (branches on entry type) ───────────────────────────────────────────

function renderWritingStage(entry = {}) {
  if (entry.type === "writing-presentation") {
    return `
      <div class="writing-stage writing-stage--presentation">
        ${renderPresentationBody(entry)}
        ${renderPresentationMeta(entry)}
      </div>
    `;
  }

  return `
    <div class="writing-stage">
      ${renderWritingBody(entry)}
      ${renderWritingMeta(entry)}
    </div>
  `;
}

// ── Bind ──────────────────────────────────────────────────────────────────────

function bindPresentationArrows(scope = document) {
  scope.querySelectorAll(".writing-stage--presentation").forEach(stageEl => {
    if (stageEl.dataset.presBound === "true") return;

    const slideEls = [...stageEl.querySelectorAll(".writing-pres-slide")];
    const prevBtn  = stageEl.querySelector(".writing-pres-arrow-prev");
    const nextBtn  = stageEl.querySelector(".writing-pres-arrow-next");
    const counter  = stageEl.querySelector(".writing-pres-counter-current");

    if (!slideEls.length || !prevBtn || !nextBtn) return;

    let current = 0;

    const pauseVideo = el => {
      const iframe = el.querySelector(".writing-pres-iframe");
      if (iframe) iframe.src = "";
    };

    const resumeVideo = el => {
      const iframe = el.querySelector(".writing-pres-iframe");
      if (iframe) iframe.src = iframe.dataset.src;
    };

    const go = index => {
      pauseVideo(slideEls[current]);
      slideEls[current].classList.remove("is-active");
      current = Math.max(0, Math.min(index, slideEls.length - 1));
      slideEls[current].classList.add("is-active");
      resumeVideo(slideEls[current]);
      if (counter) counter.textContent = current + 1;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === slideEls.length - 1;
      track("writing_pres_slide_change", { slideIndex: current }); 
    };

    prevBtn.addEventListener("click", () => go(current - 1));
    nextBtn.addEventListener("click", () => go(current + 1));

    stageEl.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); go(current - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
    });

    stageEl.dataset.presBound = "true";

    // load the first slide if it's a video
    resumeVideo(slideEls[0]);
  });
}

function bindWritingTabs(scope = document) {
  scope.querySelectorAll(".writing-feature-module").forEach(moduleEl => {
    if (moduleEl.dataset.writingTabsBound === "true") return;

    let entries = [];
    try {
      entries = JSON.parse(moduleEl.dataset.writingEntries ?? "[]");
    } catch {
      entries = [];
    }

    const tabsShell  = moduleEl.querySelector(".writing-tabs-shell");
    const stageShell = moduleEl.querySelector(".writing-stage-shell");
    if (!tabsShell || !stageShell) return;

const renderEntry = (index, subIndex = 0) => {
  const parentEntry = entries[index];
  if (!parentEntry) return;

  const activeEntry = parentEntry.entries
    ? parentEntry.entries[subIndex]
    : parentEntry;

  tabsShell.innerHTML = `
    ${renderWritingTabs(entries, index)}
    ${parentEntry.entries
      ? renderWritingSubTabs(parentEntry, subIndex)
      : ""}
  `;

  stageShell.innerHTML = renderWritingStage(activeEntry);

  bindPresentationArrows(stageShell);
  attachTabListeners();
};

const scrollEl = stageShell.querySelector(".writing-body-scroll");
if (scrollEl) bindScrollDepth(scrollEl, "writing_scroll_depth", {
  entry: entries[index]?.title ?? index
});
    
const attachTabListeners = () => {
  tabsShell.querySelectorAll(".writing-tab").forEach(tab => {
    tab.addEventListener("click", event => {
      event.preventDefault();
      const idx = Number(tab.dataset.writingIndex);
      renderEntry(idx, 0);
      track("writing_tab_switch", { index: idx });
    });
  });

  tabsShell.querySelectorAll(".writing-subtab").forEach(tab => {
    tab.addEventListener("click", event => {
      event.preventDefault();

      const parentIndex =
        Number(
          tabsShell.querySelector(".writing-tab.is-active")
            ?.dataset.writingIndex ?? 0
        );

      renderEntry(
        parentIndex,
        Number(tab.dataset.writingSubindex)
      );
    });
  });
};

    renderEntry(0);
    moduleEl.dataset.writingTabsBound = "true";
  });
}

// ── Export ────────────────────────────────────────────────────────────────────

export function renderWritingFeatureModule(module) {
  const entries = Array.isArray(module.entries) && module.entries.length
    ? module.entries
    : [];

  queueMicrotask(() => bindWritingTabs(document));

  return `
    <section
      class="module writing-feature-module"
      data-writing-entries='${escapeHTML(JSON.stringify(entries))}'
    >
      <div class="writing-tabs-shell"></div>
      <div class="writing-stage-shell"></div>
    </section>
  `;
}
