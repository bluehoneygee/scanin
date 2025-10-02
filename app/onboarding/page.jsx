"use client";

import { Suspense } from "react";
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

function OnboardingInner() {
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

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-8 animate-pulse">
          <div className="h-6 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-4 h-4 w-64 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
