import { Suspense } from "react";
import SignInClient from "./_client";

export default async function SignInPage({ searchParams }) {
  const sp = await searchParams;
  const initialEmail = sp?.email ?? "";
  const justSignedUp = sp?.justSignedUp === "1";
  const next = sp?.next ?? "/";

  return (
    <Suspense fallback={<div className="p-6">Loading sign-in…</div>}>
      <SignInClient
        initialEmail={initialEmail}
        justSignedUp={justSignedUp}
        next={next}
      />
    </Suspense>
  );
}
