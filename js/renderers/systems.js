import { escapeHTML } from "../utils.js";
import { track }      from "../analytics.js";

// ── Card ──────────────────────────────────────────────────────────────────────

function renderSystemsCard(entry, index) {
  const isFeatured = entry.variant === "featured";

  return `
    <article
      class="systems-card systems-card--${escapeHTML(entry.variant)}"
      data-systems-index="${index}"
      data-systems-variant="${escapeHTML(entry.variant)}"
      tabindex="0"
      role="button"
      aria-expanded="false"
    >
      <div class="systems-card-inner">
        ${entry.eyebrow
          ? `<p class="systems-card-eyebrow">${escapeHTML(entry.eyebrow)}</p>`
          : ""}
        <h3 class="systems-card-title">${escapeHTML(entry.title ?? "")}</h3>
        <p class="systems-card-hook">${escapeHTML(entry.hook ?? "")}</p>

        ${isFeatured
          ? `<span class="systems-card-cta">view project →</span>`
          : `<span class="systems-card-cta systems-card-cta--mini">details ▾</span>`}
      </div>

      ${!isFeatured
        ? `
          <div class="systems-card-expand">
            <ul class="systems-card-expand-list">
              ${(entry.expandBullets ?? [])
                .map(b => `<li>${escapeHTML(b)}</li>`)
                .join("")}
            </ul>
          </div>
        `
        : ""}
    </article>
  `;
}

// ── Featured detail stage ────────────────────────────────────────────────────

function renderSystemsDetail(entry) {
  const stats = Array.isArray(entry.stats) ? entry.stats : [];
  const takeaways = Array.isArray(entry.takeaways) ? entry.takeaways : [];

  return `
    <div class="systems-detail">
      <button class="systems-detail-back" type="button" aria-label="back to systems">
        <span>‹</span> systems
      </button>

      <div class="systems-detail-body">
        ${entry.eyebrow
          ? `<p class="systems-detail-eyebrow">${escapeHTML(entry.eyebrow)}</p>`
          : ""}
        <h2 class="systems-detail-title">${escapeHTML(entry.title ?? "")}</h2>
        <p class="systems-detail-hook">${escapeHTML(entry.hook ?? "")}</p>

        ${stats.length
          ? `
            <div class="systems-detail-stats">
              ${stats
                .map(s => `
                  <div class="systems-detail-stat">
                    <p class="systems-detail-stat-value">${escapeHTML(s.value ?? "")}</p>
                    <p class="systems-detail-stat-label">${escapeHTML(s.label ?? "")}</p>
                  </div>
                `)
                .join("")}
            </div>
          `
          : ""}

        ${takeaways.length
          ? `
            <div class="systems-detail-takeaways">
              <p class="systems-detail-section-label">key takeaways</p>
              <ul class="systems-detail-takeaways-list">
                ${takeaways.map(t => `<li>${escapeHTML(t)}</li>`).join("")}
              </ul>
            </div>
          `
          : ""}

        ${entry.download
          ? `
            
              class="systems-detail-download"
              href="${escapeHTML(entry.download.href ?? "#")}"
              download
            >
              ${escapeHTML(entry.download.label ?? "download")}
            </a>
          `
          : ""}
      </div>
    </div>
  `;
}

// ── Bind ──────────────────────────────────────────────────────────────────────

function bindSystemsGrid(scope = document) {
  scope.querySelectorAll(".systems-project-grid-module").forEach(moduleEl => {
    if (moduleEl.dataset.systemsBound === "true") return;

    let entries = [];
    try {
      entries = JSON.parse(moduleEl.dataset.systemsEntries ?? "[]");
    } catch {
      entries = [];
    }

    const gridShell   = moduleEl.querySelector(".systems-grid-shell");
    const detailShell = moduleEl.querySelector(".systems-detail-shell");
    if (!gridShell || !detailShell) return;

    const showDetail = index => {
      const entry = entries[index];
      if (!entry) return;

      detailShell.innerHTML = renderSystemsDetail(entry);
      gridShell.classList.add("is-hidden");
      detailShell.classList.add("is-active");

      detailShell.querySelector(".systems-detail-back")
        ?.addEventListener("click", showGrid);

      track("systems_project_open", { project: entry.id ?? index });
    };

    const showGrid = () => {
      detailShell.classList.remove("is-active");
      gridShell.classList.remove("is-hidden");
    };

    gridShell.querySelectorAll(".systems-card").forEach(card => {
      const index   = Number(card.dataset.systemsIndex);
      const variant = card.dataset.systemsVariant;

      const activate = () => {
        if (variant === "featured") {
          showDetail(index);
        } else {
          const wasExpanded = card.classList.toggle("is-expanded");
          card.setAttribute("aria-expanded", wasExpanded ? "true" : "false");
          track("systems_project_expand", {
            project: entries[index]?.id ?? index,
            expanded: wasExpanded
          });
        }
      };

      card.addEventListener("click", activate);
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });

    moduleEl.dataset.systemsBound = "true";
  });
}

// ── Export ────────────────────────────────────────────────────────────────────

export function renderSystemsProjectGridModule(module) {
  const entries = Array.isArray(module.entries) ? module.entries : [];

  queueMicrotask(() => bindSystemsGrid(document));

  return `
    <section
      class="module systems-project-grid-module"
      data-systems-entries='${escapeHTML(JSON.stringify(entries))}'
    >
      <div class="systems-grid-shell">
        <div class="systems-grid">
          ${entries.map((entry, i) => renderSystemsCard(entry, i)).join("")}
        </div>
      </div>
      <div class="systems-detail-shell"></div>
    </section>
  `;
}
