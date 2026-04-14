function detectMobileMode() {
  return window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
}

function syncMobileClass() {
  const isMobile = detectMobileMode();
  document.documentElement.classList.toggle("is-mobile-device", isMobile);
  document.body.classList.toggle("is-mobile-device", isMobile);
}

syncMobileClass();

window.addEventListener("resize", syncMobileClass);
window.matchMedia("(pointer: coarse)").addEventListener?.("change", syncMobileClass);
window.matchMedia("(max-width: 760px)").addEventListener?.("change", syncMobileClass);
