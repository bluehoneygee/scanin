"use client";

import { useEffect, useState } from "react";

function sanitizeUser(u) {
  if (!u || typeof u !== "object") return null;
  const { password, passwordHash, ...safe } = u;
  return safe;
}

export function readAuthUserLocal() {
  try {
    const raw = localStorage.getItem("auth-user");
    if (!raw) return null;
    return sanitizeUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function setAuthUserLocal(user) {
  try {
    const safe = sanitizeUser(user);
    if (safe) {
      localStorage.setItem("auth-user", JSON.stringify(safe));
    } else {
      localStorage.removeItem("auth-user");
    }
    window.dispatchEvent(
      new CustomEvent("auth-user:changed", { detail: safe })
    );
  } catch {}
}

export function getAuthUserId(u) {
  if (!u) return "";
  return u.id || u.userId || u.email || u.username || "";
}

function clearPerUserCaches(uid = "") {
  const EXACT = [
    "pickup-draft",
    "selected-bank",
    "last-used-bank",
    "pickup-orders",
    "wb-last-wilayah",
  ];
  for (const k of EXACT) {
    try {
      localStorage.removeItem(k);
    } catch {}
  }

  const PREFIXES = [
    "pickup-orders:",
    "riwayat-preview:",
    "scan-history-preview:",
    "points-balance:",
    "points-history:",
  ];

  if (uid) {
    for (const p of PREFIXES) {
      try {
        localStorage.removeItem(`${p}${uid}`);
      } catch {}
    }
  }

  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i) || "";
      if (PREFIXES.some((p) => k.startsWith(p))) {
        localStorage.removeItem(k);
      }
    }
  } catch {}
}

export function clearAuthUserLocal(options = {}) {
  const { deep = false } = options;
  const current = readAuthUserLocal();
  const uid = getAuthUserId(current);

  try {
    localStorage.removeItem("auth-user");
  } catch {}

  if (deep) {
    clearPerUserCaches(uid);
  }

  try {
    window.dispatchEvent(
      new CustomEvent("auth-user:changed", { detail: null })
    );
  } catch {}
}

export function useAuthUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(readAuthUserLocal());
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "auth-user") setUser(readAuthUserLocal());
    };
    const onLocalChange = (e) => setUser(e.detail || null);

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-user:changed", onLocalChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-user:changed", onLocalChange);
    };
  }, []);

  return user;
}
