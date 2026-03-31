const ANALYTICS_ENABLED_HOSTS = new Set([
  "ocam.site",
  "www.ocam.site",
]);

function analyticsAllowed() {
  return ANALYTICS_ENABLED_HOSTS.has(window.location.hostname);
}

export function track(eventName, data = undefined) {
  if (!analyticsAllowed()) return;

  try {
    if (window.umami && typeof window.umami.track === "function") {
      if (data && Object.keys(data).length) {
        window.umami.track(eventName, data);
      } else {
        window.umami.track(eventName);
      }
    }
  } catch (err) {
    console.warn("Umami track failed:", eventName, err);
  }
}

export function trackView() {
  if (!analyticsAllowed()) return;

  try {
    if (window.umami && typeof window.umami.track === "function") {
      window.umami.track();
    }
  } catch (err) {
    console.warn("Umami pageview failed:", err);
  }
}
