"use client";

import { useSearchParams } from "next/navigation";
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

export default function OnboardingPage() {
  const params = useSearchParams();
  const nextAfterOnboarding = params.get("next") || "/";
  const rawSignup = ROUTES.SIGN_UP;

  const signupPath = joinWithNext(rawSignup, nextAfterOnboarding);

  const ob = useOnboarding({
    SLIDES,
    STORAGE_KEY,
    nextRoute: signupPath,
    BRAND,
  });

  return <OnboardingView {...ob} />;
}
