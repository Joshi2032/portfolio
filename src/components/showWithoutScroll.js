export function showWithoutScroll(dialog) {
  const top = window.scrollY;
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  dialog.showModal();
  window.scrollTo(0, top);
  requestAnimationFrame(() => {
    window.scrollTo(0, top);
    root.style.scrollBehavior = previous;
  });
}
