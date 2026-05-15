import { escapeHTML } from "../utils.js";

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

// ── Body ──────────────────────────────────────────────────────────────────────

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

// ── Meta sidebar ──────────────────────────────────────────────────────────────

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
                 .map(
                   f => `
                   <div class="writing-meta-field">
                     <p class="writing-meta-label">${escapeHTML(f.label)}</p>
                     <p class="writing-meta-value">${escapeHTML(f.value)}</p>
                   </div>
                 `
                 )
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

// ── Stage ─────────────────────────────────────────────────────────────────────

function renderWritingStage(entry = {}) {
  return `
    <div class="writing-stage">
      ${renderWritingBody(entry)}
      ${renderWritingMeta(entry)}
    </div>
  `;
}

// ── Bind ──────────────────────────────────────────────────────────────────────

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

    const renderEntry = index => {
      const entry = entries[index];
      if (!entry) return;

      tabsShell.innerHTML  = renderWritingTabs(entries, index);
      stageShell.innerHTML = renderWritingStage(entry);
      attachTabListeners();
    };

    const attachTabListeners = () => {
      tabsShell.querySelectorAll(".writing-tab").forEach(tab => {
        tab.addEventListener("click", event => {
          event.preventDefault();
          renderEntry(Number(tab.dataset.writingIndex));
        });
      });
    };

    renderEntry(0);
    moduleEl.dataset.writingTabsBound = "true";
  });
}

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

// ── Presentation module ───────────────────────────────────────────────────────

function bindPresentationViewers(scope = document) {
  scope.querySelectorAll(".writing-pres-module").forEach(moduleEl => {
    if (moduleEl.dataset.presBound === "true") return;

    const slides  = [...moduleEl.querySelectorAll(".writing-pres-slide")];
    const prevBtn = moduleEl.querySelector(".writing-pres-arrow-prev");
    const nextBtn = moduleEl.querySelector(".writing-pres-arrow-next");
    const counter = moduleEl.querySelector(".writing-pres-counter-current");

    if (!slides.length || !prevBtn || !nextBtn) return;

    let current = 0;

    const go = index => {
      slides[current].classList.remove("is-active");
      current = Math.max(0, Math.min(index, slides.length - 1));
      slides[current].classList.add("is-active");
      if (counter) counter.textContent = current + 1;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === slides.length - 1;
    };

    prevBtn.addEventListener("click", () => go(current - 1));
    nextBtn.addEventListener("click", () => go(current + 1));

    moduleEl.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); go(current - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
    });

    moduleEl.dataset.presBound = "true";
  });
}

export function renderWritingPresentationModule(module) {
  const slides = Array.isArray(module.slides) ? module.slides : [];
  const tags   = Array.isArray(module.tags)   ? module.tags   : [];

  const fields = [
    { label: "author",  value: module.author  ?? null },
    { label: "form",    value: module.form    ?? null },
    { label: "subject", value: module.subject ?? null },
    { label: "year",    value: module.year    ?? null },
  ].filter(f => f.value);

  queueMicrotask(() => bindPresentationViewers(document));

  return `
    <section class="module writing-pres-module" tabindex="-1">
      <div class="writing-pres-stage">

        <div class="writing-pres-viewer">
          <div class="writing-pres-track">
            ${slides
              .map(
                (slide, index) => `
                <img
                  class="writing-pres-slide ${index === 0 ? "is-active" : ""}"
                  src="${escapeHTML(slide.src)}"
                  alt="${escapeHTML(slide.alt ?? `slide ${index + 1}`)}"
                  loading="${index === 0 ? "eager" : "lazy"}"
                  data-slide-index="${index}"
                />`
              )
              .join("")}
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

        <aside class="writing-meta-card writing-pres-meta">
          <div class="writing-meta-inner">
            ${module.eyebrow
              ? `<p class="writing-meta-eyebrow">${escapeHTML(module.eyebrow)}</p>`
              : ""}
            <h3 class="writing-meta-title">${escapeHTML(module.title ?? "")}</h3>
            ${module.dek
              ? `<p class="writing-pres-dek">${escapeHTML(module.dek)}</p>`
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

            ${module.note
              ? `<div class="writing-meta-note">
                   <p class="writing-meta-note-text">${escapeHTML(module.note)}</p>
                 </div>`
              : ""}
          </div>
        </aside>

      </div>
    </section>
  `;
}
