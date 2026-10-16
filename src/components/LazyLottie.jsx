import { lazy, Suspense, useEffect, useState } from "react";

const DotLottieReact = lazy(() =>
  import("@lottiefiles/dotlottie-react").then((module) => ({ default: module.DotLottieReact })),
);

// Decorative animation: the player chunk is fetched only once the browser is idle,
// so it never competes with first paint. Callers gate by viewport where needed.
export function LazyLottie(props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <DotLottieReact {...props} />
    </Suspense>
  );
}
