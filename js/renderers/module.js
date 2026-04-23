import { renderTextModule, renderEmbedModule, renderTwoUpModule } from "./text.js";
import {
  renderSlideshowModule,
  renderSlideDescriptionModule,
  renderPosterStudyModule
} from "./slideshow.js";
import {
  renderFilmAnalysisModule,
  renderFilmAnalysisGridModule,
  renderFilmTriptychModule
} from "./film.js";
// Circular with film-browser.js — safe: calls happen at runtime, not at evaluation.
import { renderFilmCollectionBrowserModule } from "./film-browser.js";
import { renderMusicFeatureModule } from "./music.js";
import { renderWritingFeatureModule } from "./writing.js";

export function renderModule(module, section, moduleIndex, keyPrefixOverride = "") {
  const keyPrefix = keyPrefixOverride || `${section}-`;

  switch (module.type) {
    case "text":
      return renderTextModule(module);

    case "embed":
      return renderEmbedModule(module);

    case "two-up":
      return renderTwoUpModule(module);

    case "slideshow":
      return renderSlideshowModule(module, keyPrefix, moduleIndex, section);

    case "slide-description":
      return renderSlideDescriptionModule(module, section, moduleIndex, keyPrefix);

    case "poster-study":
      return renderPosterStudyModule(module, keyPrefix, moduleIndex);

    case "music-feature":
      return renderMusicFeatureModule(module);

    case "writing-feature":
      return renderWritingFeatureModule(module);

    case "film-analysis":
      return renderFilmAnalysisModule(module);

    case "film-analysis-grid":
      return renderFilmAnalysisGridModule(module);

    case "film-triptych":
      return renderFilmTriptychModule(module);

    case "film-collection-browser":
      return renderFilmCollectionBrowserModule(module, section, moduleIndex);

    default:
      return "";
  }
}
