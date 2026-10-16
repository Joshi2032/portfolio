export function trackEvent(name, title = name) {
  if (typeof window === "undefined") return;
  const counter = window.goatcounter;
  if (!counter || typeof counter.count !== "function") return;
  try {
    counter.count({ path: name, title, event: true });
  } catch {
    // Analytics must never break the page.
  }
}
