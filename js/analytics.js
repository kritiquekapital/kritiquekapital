const ANALYTICS_ENABLED_HOSTS = new Set([
  "kritiquekapital.com",
  "www.kritiquekapital.com",
  "kritiquekapital.github.io",
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

export function identifySession() {
  if (!analyticsAllowed()) return;

  const attempt = () => {
    try {
      if (window.umami && typeof window.umami.identify === "function") {
        window.umami.identify({
          platform:   navigator.platform,
          dpr:        window.devicePixelRatio,
          touch:      navigator.maxTouchPoints > 0,
          cores:      navigator.hardwareConcurrency ?? null,
          ram:        navigator.deviceMemory ?? null,
          connection: navigator.connection?.effectiveType ?? null,
          ua:         navigator.userAgent,
          screen:     `${window.screen.width}x${window.screen.height}`,
          viewport:   `${window.innerWidth}x${window.innerHeight}`
        });
      } else {
        setTimeout(attempt, 500);
      }
    } catch (err) {
      console.warn("Umami identify failed:", err);
    }
  };

  attempt();
}

export function bindScrollDepth(el, eventName, data = {}) {
  if (!analyticsAllowed() || !el) return;

  const milestones = [25, 50, 75, 100];
  const fired = new Set();

  el.addEventListener("scroll", () => {
    const scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable <= 0) return;
    const pct = Math.round((el.scrollTop / scrollable) * 100);
    for (const m of milestones) {
      if (!fired.has(m) && pct >= m) {
        fired.add(m);
        track(eventName, { ...data, depth: m });
      }
    }
  }, { passive: true });
}

export function trackPageLoad() {
  if (!analyticsAllowed()) return;
  try {
    track("page_load", { referrer: document.referrer || "direct" });
  } catch (err) {
    console.warn("Umami page_load failed:", err);
  }
}
