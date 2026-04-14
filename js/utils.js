export function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function preloadImage(src) {
  if (!src) return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
}
