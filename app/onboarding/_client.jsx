"use client";

import { useOnboarding } from "@/hooks/useOnboarding";
import { SLIDES, BRAND, STORAGE_KEY } from "@/constants/onboardingSlides";
import { OnboardingView } from "@/components/onboarding/OnBoardingView";
import ROUTES from "@/constants/routes";

function joinWithNext(basePath, nextTarget) {
  if (!basePath) return "/";
  const hasQuery = basePath.includes("?");
  const sep = hasQuery ? "&" : "?";
  return `${basePath}${sep}next=${encodeURIComponent(nextTarget || "/")}`;
}

export default function OnboardingClient({ nextAfterOnboarding = "/" }) {
  const signupPath = joinWithNext(ROUTES.SIGN_UP, nextAfterOnboarding);

  const ob = useOnboarding({
    SLIDES,
    STORAGE_KEY,
    nextRoute: signupPath,
    BRAND,
    onComplete: () => {
      window.location.assign(nextAfterOnboarding || "/");
    },
  });

  return <OnboardingView {...ob} signupHref={signupPath} />;
}
