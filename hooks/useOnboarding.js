"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function useOnboarding({ SLIDES, STORAGE_KEY, nextRoute, BRAND }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const isLast = i === SLIDES.length - 1;
  const slide = SLIDES[i];

  const finish = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    router.replace(nextRoute);
  }, [router, STORAGE_KEY, nextRoute]);

  const next = useCallback(
    () => (isLast ? finish() : setI((p) => Math.min(p + 1, SLIDES.length - 1))),
    [isLast, finish, SLIDES.length]
  );
  const prev = useCallback(() => setI((p) => Math.max(0, p - 1)), []);

  const startX = useRef(0);
  const onTouchStart = (e) => (startX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) < 40) return;
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
  };
}
