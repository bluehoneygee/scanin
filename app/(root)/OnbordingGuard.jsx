"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readAuthUserLocal, getAuthUserId } from "@/lib/use-auth-user";

const EXCLUDE_PREFIXES = [
  "/onboarding",
  "/sign-up",
  "/sign-in",
  "/api",
  "/_next",
  "/static",
  "/assets",
  "/favicon",
  "/icon",
  "/manifest",
];

function hasOnboarded(uid, key = "onboarding-complete") {
  try {
    const v1 = localStorage.getItem(key);
    const v2 = uid ? localStorage.getItem(`${key}:${uid}`) : null;
    return v1 === "true" || v1 === "1" || v2 === "true" || v2 === "1";
  } catch {
    return false;
  }
}

export default function OnboardingGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!pathname) return;

    if (EXCLUDE_PREFIXES.some((p) => pathname.startsWith(p))) {
      setShow(true);
      setReady(true);
      return;
    }

    const user = readAuthUserLocal();
    const uid = getAuthUserId(user);

    if (!hasOnboarded(uid)) {
      setShow(false);
      router.replace(`/onboarding?next=${encodeURIComponent(pathname)}`);
    } else {
      setShow(true);
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready || !show) return null;
  return children;
}
