"use client";

import { OnboardingView } from "@/components/onboarding/OnBoardingView";
import ROUTES from "@/constants/routes";
import { useOnboarding } from "@/hooks/useOnboarding";
import { SLIDES, BRAND, STORAGE_KEY } from "@/constants/onboardingSlides";

export default function OnboardingPage() {
  const ob = useOnboarding({
    SLIDES,
    STORAGE_KEY,
    nextRoute: ROUTES.SIGN_UP,
    BRAND,
  });
  return <OnboardingView {...ob} />;
}
