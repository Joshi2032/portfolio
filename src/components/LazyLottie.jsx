import { lazy, Suspense } from "react";

const DotLottieReact = lazy(() =>
  import("@lottiefiles/dotlottie-react").then((module) => ({ default: module.DotLottieReact })),
);

export function LazyLottie(props) {
  return (
    <Suspense fallback={null}>
      <DotLottieReact {...props} />
    </Suspense>
  );
}
