import { escapeHTML }        from "../utils.js";
import { renderHeaderActions } from "./text.js";

// ── Sub-renderers ─────────────────────────────────────────────────────────────

export function renderResumeIntroModule(module) {
  return `
    <div class="resume-main-copy">
      <div class="resume-intro-grid">
        <article class="resume-intro-card">
          <div class="stack-card-inner">
            <h4 class="stack-card-title">${escapeHTML(module.profile.title)}</h4>
            <p class="module-copy">${escapeHTML(module.profile.copy)}</p>
          </div>
        </article>
        <article class="resume-intro-card">
          <div class="stack-card-inner">
            <h4 class="stack-card-title">${escapeHTML(module.skills.title)}</h4>
            <p class="module-copy">${escapeHTML(module.skills.copy)}</p>
          </div>
        </article>
      </div>
    </div>
  `;
}

export function renderResumeWorkCard(module) {
  return `
    <section class="resume-card resume-card-work">
      <div class="module-inner">
        <h3 class="module-title">${escapeHTML(module.title)}</h3>
      </div>
      <div class="stack-module-list">
        ${module.items
          .map(
            item => `
            <article class="stack-card resume-work-item">
              <div class="stack-card-inner">
                <h4 class="stack-card-title">${escapeHTML(item.title)}</h4>
                <p class="module-copy resume-work-summary">${escapeHTML(item.summary)}</p>
                <ul class="resume-bullet-list">
                  ${item.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join("")}
                </ul>
              </div>
            </article>
          `
          )
          .join("")}
      </div>
    </section>
  `;
}

export function renderResumeEducationCard(module) {
  return `
    <section class="resume-card resume-card-education">
      <div class="module-inner">
        <h3 class="module-title">${escapeHTML(module.title)}</h3>
        <div class="paired-stacks-grid">
          ${module.items
            .map(
              item => `
              <article class="stack-card paired-stack-card">
                <div class="stack-card-inner">
                  <h4 class="stack-card-title">${escapeHTML(item.title)}</h4>
                  <p class="module-copy">${escapeHTML(item.copy)}</p>
                  <div class="module-subsection">
                    <h4 class="module-subtitle">${escapeHTML(item.subTitle)}</h4>
                    <p class="module-copy">${escapeHTML(item.subCopy)}</p>
                  </div>
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

export function renderResumeListCard(module, className) {
  return `
    <section class="resume-card ${className}">
      <div class="module-inner">
        <h3 class="module-title">${escapeHTML(module.title)}</h3>
        <div class="resume-pill-list">
          ${module.items
            .map(item => `<div class="resume-pill-item"><span>${escapeHTML(item)}</span></div>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

// ── Panel builder ─────────────────────────────────────────────────────────────

export function buildResumePanel(panel, data, section) {
  const [introModule, workModule, educationModule, languagesModule, certsAwardsModule, interestsModule] =
    data.modules;

  panel.innerHTML = `
    <div class="resume-layout">
      ${renderResumeWorkCard(workModule)}

      <div class="resume-center-stack">
        <section class="resume-card resume-card-main">
          <header class="panel-header ${data.headerActions?.length ? "has-actions" : ""}">
            <div class="panel-header-main">
              <h2 class="panel-title" id="panel-title-${section}">${escapeHTML(data.title)}</h2>
              <p class="panel-kicker">${escapeHTML(data.kicker)}</p>
            </div>
            ${renderHeaderActions(data.headerActions ?? [])}
          </header>
          ${renderResumeIntroModule(introModule)}
        </section>

        ${renderResumeEducationCard(educationModule)}
      </div>

      <div class="resume-right-stack">
        ${renderResumeListCard(languagesModule,    "resume-card-lang")}
        ${renderResumeListCard(certsAwardsModule,  "resume-card-certs-awards")}
        ${renderResumeListCard(interestsModule,    "resume-card-interest")}
      </div>
    </div>
  `;
}
