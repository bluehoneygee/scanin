export const dynamic = "force-dynamic";
import { Suspense } from "react";
import OnboardingClient from "./_client";

export default async function OnboardingPage({ searchParams }) {
  const sp = await searchParams; // ⟵ penting: await!
  const nextAfterOnboarding = sp?.next ?? "/";

  return (
    <Suspense
      fallback={
        <div className="px-6 py-8 animate-pulse">
          <div className="h-6 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-4 h-4 w-64 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      }
    >
      <OnboardingClient nextAfterOnboarding={nextAfterOnboarding} />
    </Suspense>
  );
}
