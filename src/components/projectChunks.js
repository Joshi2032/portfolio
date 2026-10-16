// On-demand chunks for the project dialog. Each loader caches its promise so
// hover/focus prefetch and the actual open share one request.
let extras;
let viewer;

export function loadExtras() {
  extras ??= import("./ProjectExtras.jsx");
  return extras;
}

export function loadViewer() {
  viewer ??= import("./ShotViewer.jsx");
  return viewer;
}

export function needsExtras(id, details) {
  return Boolean(details?.flow) || id === "aguacate";
}

export function prefetchProject(id, details) {
  if (needsExtras(id, details)) loadExtras();
  if (details?.shots?.length) loadViewer();
}
