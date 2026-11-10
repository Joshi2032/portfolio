// Small motion helpers for the projects mosaic. All of them are no-ops when the
// visitor prefers reduced motion.

const reduced = () =>
  typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const EASE = "cubic-bezier(.2,.8,.2,1)";
const NUM = /\d+(?:\.\d+)?/g;

// Counts every number inside a stat ("54.5% → 77.3%", "20 → 5 min") up from 0.
// React owns the stat's text, so the animation only touches attributes: the real
// text is hidden while a ::after shows data-display (see .is-counting in CSS).
export function countUp(el) {
  if (!el || el.dataset.counted || reduced()) return;
  el.dataset.counted = "1";
  const text = el.dataset.count || "";
  const targets = [...text.matchAll(NUM)].map((m) => m[0]);
  if (!targets.length) return;
  const start = performance.now();
  const duration = 1100;
  el.classList.add("is-counting");
  const tick = (now) => {
    const k = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - k) ** 3;
    let i = 0;
    el.dataset.display = text.replace(NUM, () => {
      const target = targets[i++];
      const decimals = (target.split(".")[1] || "").length;
      return (parseFloat(target) * eased).toFixed(decimals);
    });
    if (k < 1) requestAnimationFrame(tick);
    else el.classList.remove("is-counting");
  };
  requestAnimationFrame(tick);
}

// Reveals each child (.cell) the first time it scrolls into view, then calls onReveal(cell).
export function observeReveal(root, onReveal) {
  if (!root) return () => {};
  const cells = [...root.children];
  if (reduced() || typeof IntersectionObserver === "undefined") {
    cells.forEach((cell) => {
      cell.classList.add("is-in");
      onReveal?.(cell);
    });
    return () => {};
  }
  root.classList.add("is-armed");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const cell = entry.target;
        cell.classList.add("is-in");
        const order = Number(cell.style.getPropertyValue("--i")) || 0;
        window.setTimeout(() => onReveal?.(cell), 250 + order * 70);
        observer.unobserve(cell);
      });
    },
    { threshold: 0.12 },
  );
  cells.forEach((cell) => observer.observe(cell));
  return () => observer.disconnect();
}

// FLIP: measure the visible cells, apply the DOM change synchronously, then
// animate every cell from its old box to its new one.
export function flip(root, mutate) {
  if (!root || reduced()) {
    mutate();
    return;
  }
  const visible = (el) => !el.hidden;
  const before = new Map([...root.children].filter(visible).map((el) => [el, el.getBoundingClientRect()]));
  mutate();
  [...root.children].filter(visible).forEach((el) => {
    el.classList.add("is-in");
    const a = before.get(el);
    const b = el.getBoundingClientRect();
    if (!a) {
      el.animate([{ opacity: 0, transform: "scale(0.94)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: EASE });
      return;
    }
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    const sx = a.width / b.width;
    const sy = a.height / b.height;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
    el.animate(
      [
        { transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transformOrigin: "top left", transform: "none" },
      ],
      { duration: 520, easing: EASE },
    );
  });
}

// Grows a dialog out of the element that opened it (shared-element transition).
export function growFrom(dialog, from) {
  if (!dialog || !from || reduced()) return;
  const a = from.getBoundingClientRect();
  const b = dialog.getBoundingClientRect();
  if (!a.width || !b.width) return;
  dialog.animate(
    [
      { transformOrigin: "top left", transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`, opacity: 0.4 },
      { transformOrigin: "top left", transform: "none", opacity: 1 },
    ],
    { duration: 480, easing: EASE },
  );
}
