import { useCallback, useSyncExternalStore } from "react";

// The prerendered HTML assumes no media query matches; React reads that value while hydrating
// and switches to the real one right after, so the first client render matches the server.
const serverSnapshot = () => false;

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );
  const snapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
