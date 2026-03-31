const ANALYTICS_ENABLED_HOSTS = new Set([
  "kritiquekapital.com",
  "www.kritiquekapital.com",
]);

function analyticsAllowed() {
  return ANALYTICS_ENABLED_HOSTS.has(window.location.hostname);
}

function hasPayload(data) {
  return data && typeof data === "object" && Object.keys(data).length > 0;
}

export function track(eventName, data = undefined) {
  if (!analyticsAllowed()) return;
  if (!eventName || typeof eventName !== "string") return;

  try {
    if (window.umami && typeof window.umami.track === "function") {
      if (hasPayload(data)) {
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
