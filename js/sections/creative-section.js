function renderSlideshowModule(module) {
  const firstSeries = module.series?.[0];
  const firstSlide = firstSeries?.slides?.[0];

  return `
    <section class="module slideshow">
      <div class="module-inner">
        <h3 class="module-title">${module.title}</h3>
      </div>

      <div class="slideshow-container" data-series="0" data-index="0">
        <button class="slide-arrow left">‹</button>

        <img 
          class="slide-image" 
          src="${firstSlide?.src || ""}" 
          alt=""
        />

        <button class="slide-arrow right">›</button>
      </div>

      <div class="slideshow-series">
        ${module.series.map((s, i) => `
          <button class="series-tab" data-series="${i}">
            ${s.label}
          </button>
        `).join("")}
      </div>
    </section>
  `;
}
