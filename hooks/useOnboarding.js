"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { readAuthUserLocal, getAuthUserId } from "@/lib/use-auth-user";

export function useOnboarding({
  SLIDES = [],
  STORAGE_KEY = "onboarding-complete",
  nextRoute = "/sign-up",
  BRAND,
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [i, setI] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const lastIndex = Math.max(0, SLIDES.length - 1);
  const isLast = SLIDES.length ? i === lastIndex : true;
  const slide = SLIDES[Math.min(i, lastIndex)] || {};

  useEffect(() => {
    const uid = getAuthUserId(readAuthUserLocal());
    try {
      const v1 = localStorage.getItem(STORAGE_KEY);
      const v2 = uid ? localStorage.getItem(`${STORAGE_KEY}:${uid}`) : null;
      const done = v1 === "true" || v1 === "1" || v2 === "true" || v2 === "1";
      if (done) {
        router.replace(params.get("next") || "/");
        return;
      }
    } finally {
      setHydrated(true);
    }
  }, [router, params, STORAGE_KEY]);

  const finish = useCallback(() => {
    const uid = getAuthUserId(readAuthUserLocal());
    try {
      localStorage.setItem(STORAGE_KEY, "1");
      if (uid) localStorage.setItem(`${STORAGE_KEY}:${uid}`, "1");
    } catch {}
    router.replace(nextRoute);
  }, [router, STORAGE_KEY, nextRoute]);

  const next = useCallback(() => {
    if (!SLIDES.length || isLast) return finish();
    setI((p) => Math.min(p + 1, lastIndex));
  }, [SLIDES.length, isLast, finish, lastIndex]);

  const prev = useCallback(() => setI((p) => Math.max(0, p - 1)), []);

  const startX = useRef(0);
  const startY = useRef(0);
  const onTouchStart = (e) => {
    if (!e.touches?.length) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (!e.changedTouches?.length) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 40) return;
    dx < 0 ? next() : prev();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return {
    SLIDES,
    BRAND,
    slide,
    i,
    isLast,
    setI,
    next,
    prev,
    finish,
    onTouchStart,
    onTouchEnd,
    hydrated,
  };
}
