// hooks/useMenuModel.js
"use client";

import { useRouter } from "next/navigation";
import {
  useAuthUser,
  getAuthUserId,
  clearAuthUserLocal,
} from "@/lib/use-auth-user";

function initials(name = "") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "U";
}
function nextify(target) {
  return `/sign-in?next=${encodeURIComponent(target || "/menu")}`;
}

export function useMenuModel() {
  const router = useRouter();
  const user = useAuthUser();

  const userId = getAuthUserId(user);
  const displayName = user?.name || user?.username || user?.email || "Pengguna";
  const avatarFallback = initials(displayName);

  const profileHref = userId ? "/profile/me" : nextify("/profile/me");
  const ordersHref = userId
    ? "/waste-bank/orders"
    : nextify("/waste-bank/orders");

  function handleLogout(e) {
    e?.preventDefault?.();
    clearAuthUserLocal();
    router.replace("/sign-in?justLoggedOut=1");
  }

  return {
    userId,
    displayName,
    avatarFallback,
    profileHref,
    ordersHref,
    handleLogout,
  };
}
