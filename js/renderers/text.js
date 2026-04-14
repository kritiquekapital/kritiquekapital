import { escapeHTML } from "../utils.js";

// ── Header actions ────────────────────────────────────────────────────────────

export function renderHeaderActions(actions = []) {
  if (!actions.length) return "";

  return `
    <div class="panel-header-actions">
      ${actions
        .map(action => {
          const href  = action.href  ?? "#";
          const label = action.label ?? "";
          const icon  = action.icon  ?? "";
          return `
            <a
              class="panel-action-link"
              href="${href}"
              aria-label="${escapeHTML(label)}"
              title="${escapeHTML(label)}"
              ${href === "#" ? 'onclick="event.preventDefault()"' : ""}
            >
              <span class="panel-action-icon" aria-hidden="true">${escapeHTML(icon)}</span>
              <span class="panel-action-text">${escapeHTML(label)}</span>
            </a>
          `;
        })
        .join("")}
    </div>
  `;
}

// ── Text ──────────────────────────────────────────────────────────────────────

export function renderTextModule(module) {
  const bodyHTML =
    Array.isArray(module.paragraphs) && module.paragraphs.length
      ? module.paragraphs
          .map(p => `<p class="module-copy">${escapeHTML(p)}</p>`)
          .join("")
      : `<p class="module-copy">${escapeHTML(module.copy ?? "")}</p>`;

  return `
    <section class="module">
      <div class="module-inner">
        <h3 class="module-title">${escapeHTML(module.title ?? "")}</h3>
        ${bodyHTML}
      </div>
    </section>
  `;
}

// ── Embed ─────────────────────────────────────────────────────────────────────

export function renderEmbedModule(module) {
  const src         = module.src         ?? "";
  const aspectRatio = module.aspectRatio ?? "16 / 9";

  if (module.embedType === "iframe" && src) {
    return `
      <section class="module">
        ${module.title
          ? `<div class="module-inner">
               <h3 class="module-title">${escapeHTML(module.title)}</h3>
             </div>`
          : ""}
        <div class="embed-shell" style="aspect-ratio: ${aspectRatio}">
          <iframe
            src="${escapeHTML(src)}"
            allowfullscreen
            loading="lazy"
            title="${escapeHTML(module.title ?? "embed")}"
          ></iframe>
        </div>
      </section>
    `;
  }

  return `
    <section class="module">
      <div class="module-inner">
        ${module.title
          ? `<h3 class="module-title">${escapeHTML(module.title)}</h3>`
          : ""}
        <div class="embed-placeholder">${escapeHTML(module.mediaLabel ?? "add embed")}</div>
      </div>
    </section>
  `;
}

// ── Two-up ────────────────────────────────────────────────────────────────────

export function renderTwoUpModule(module) {
  const items = Array.isArray(module.items) ? module.items : [];

  return `
    <section class="module">
      <div class="module-grid-2">
        ${items
          .map(
            item => `
            <div class="module-inner">
              ${item.title
                ? `<h3 class="module-title">${escapeHTML(item.title)}</h3>`
                : ""}
              ${item.copy
                ? `<p class="module-copy">${escapeHTML(item.copy)}</p>`
                : ""}
              ${item.mediaLabel
                ? `<div class="media-placeholder">${escapeHTML(item.mediaLabel)}</div>`
                : ""}
            </div>
          `
          )
          .join("")}
      </div>
    </section>
  `;
}
