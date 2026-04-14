import { escapeHTML } from "../utils.js";

// ── Film media shell ──────────────────────────────────────────────────────────

export function renderFilmMedia(media = {}, className = "") {
  const mediaType = media.type     ?? "";
  const src       = escapeHTML(media.src       ?? "");
  const poster    = escapeHTML(media.poster    ?? "");
  const ariaLabel = escapeHTML(media.ariaLabel ?? "film media");

  if (mediaType === "video" && src) {
    return `
      <div class="film-media-shell ${className}">
        <video
          class="film-media-video"
          controls
          preload="metadata"
          ${poster ? `poster="${poster}"` : ""}
          aria-label="${ariaLabel}"
        >
          <source src="${src}">
        </video>
      </div>
    `;
  }

  if (mediaType === "image" && src) {
    return `
      <div class="film-media-shell ${className}">
        <img class="film-media-image" src="${src}" alt="${ariaLabel}" loading="lazy">
      </div>
    `;
  }

  return `
    <div class="film-media-shell ${className}">
      <div class="film-media-placeholder">add film media</div>
    </div>
  `;
}

// ── Film analysis ─────────────────────────────────────────────────────────────

export function renderFilmAnalysisModule(module) {
  const bullets = Array.isArray(module.bullets) ? module.bullets : [];

  return `
    <section class="module film-analysis-module">
      <div class="film-analysis-layout">
        ${renderFilmMedia(module.media, "film-analysis-media")}
        <div class="film-analysis-copy">
          <div class="module-inner">
            <div class="film-analysis-copy-inner">
              <h3 class="module-title">${escapeHTML(module.title ?? "")}</h3>
              ${module.subtitle
                ? `<p class="film-analysis-subtitle">${escapeHTML(module.subtitle)}</p>`
                : ""}
              ${module.claim
                ? `<p class="module-copy film-analysis-claim">${escapeHTML(module.claim)}</p>`
                : ""}
              ${bullets.length
                ? `<ul class="film-analysis-list">
                     ${bullets.map(item => `<li>${escapeHTML(item)}</li>`).join("")}
                   </ul>`
                : ""}
              ${module.footer
                ? `<p class="module-copy film-analysis-footer">${escapeHTML(module.footer)}</p>`
                : ""}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ── Film analysis grid ────────────────────────────────────────────────────────

export function renderFilmAnalysisGridModule(module) {
  const items = Array.isArray(module.items) ? module.items : [];

  return `
    <section class="module film-analysis-grid-module">
      <div class="module-inner">
        <h3 class="module-title">${escapeHTML(module.title ?? "")}</h3>
        <div class="film-analysis-grid">
          ${items
            .map(
              item => `
              <article class="film-analysis-card">
                <h4 class="film-analysis-card-title">${escapeHTML(item.heading ?? "")}</h4>
                <p class="module-copy">${escapeHTML(item.copy ?? "")}</p>
              </article>
            `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

// ── Film triptych ─────────────────────────────────────────────────────────────

export function renderFilmTriptychModule(module) {
  const items = Array.isArray(module.items) ? module.items : [];

  return `
    <section class="module film-triptych-module">
      <div class="module-inner">
        <div class="film-triptych-header">
          ${module.title
            ? `<h3 class="module-title">${escapeHTML(module.title)}</h3>`
            : ""}
          ${module.description
            ? `<p class="module-copy film-triptych-description">${escapeHTML(module.description)}</p>`
            : ""}
        </div>

        <div class="film-triptych-grid">
          ${items
            .map(
              item => `
              <article class="film-triptych-card">
                <div class="film-triptych-image-shell">
                  <img
                    class="film-triptych-image"
                    src="${escapeHTML(item.src ?? "")}"
                    alt="${escapeHTML(item.alt ?? item.title ?? "film still")}"
                    loading="lazy"
                  >
                </div>
                <div class="film-triptych-card-body">
                  <div class="film-triptych-card-topline">
                    <h4 class="film-triptych-card-title">${escapeHTML(item.title ?? "")}</h4>
                    ${item.meta
                      ? `<p class="film-triptych-card-meta">${escapeHTML(item.meta)}</p>`
                      : ""}
                  </div>
                  ${item.thesis
                    ? `<p class="film-triptych-card-thesis">${escapeHTML(item.thesis)}</p>`
                    : ""}
                  ${item.copy
                    ? `<p class="film-triptych-card-copy">${escapeHTML(item.copy)}</p>`
                    : ""}
                </div>
              </article>
            `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}
