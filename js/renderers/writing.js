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
