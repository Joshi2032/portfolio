import { useEffect, useRef } from "react";
import { showWithoutScroll } from "./showWithoutScroll.js";

// Image viewer layered over the project dialog. Loaded on demand.
export function ShotViewer({ shot, count, intro, onStep, onClose }) {
  const ref = useRef(null);
  const fromCleanup = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    showWithoutScroll(dialog);
    return () => {
      if (!dialog.open) return;
      fromCleanup.current = true;
      dialog.close();
      fromCleanup.current = false;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="shot-zoom"
      aria-label={shot.alt}
      onClose={() => {
        if (!fromCleanup.current) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          // Close only the viewer; without preventDefault the browser's own
          // cancel action would then also close the project dialog beneath.
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.close();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          onStep(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onStep(-1);
        }
      }}
    >
      {count > 1 ? (
        <button type="button" className="shot-nav prev" aria-label={intro.prevShot} onClick={() => onStep(-1)}>
          ‹
        </button>
      ) : null}
      <button type="button" className="project-float-close" aria-label={intro.closeShot} onClick={() => ref.current?.close()}>
        ×
      </button>
      {count > 1 ? (
        <button type="button" className="shot-nav next" aria-label={intro.nextShot} onClick={() => onStep(1)}>
          ›
        </button>
      ) : null}
      <img src={`${import.meta.env.BASE_URL}${shot.src}`} alt={shot.alt} />
    </dialog>
  );
}
