import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const digits = (s) => String(s || "").replace(/\D/g, "");

export function getUserIdFromRequest(req) {
  try {
    const fromGet = req?.headers?.get?.("x-user-id");
    if (fromGet) return String(fromGet);

    const fromObj =
      typeof req?.headers === "object" ? req.headers["x-user-id"] : null;
    if (fromObj) return String(fromObj);

    const cookie = req?.headers?.get?.("cookie") || "";
    const m = cookie.match(/(?:^|;\s*)auth_user_id=([^;]+)/i);
    if (m) return decodeURIComponent(m[1]);

    return "";
  } catch {
    return "";
  }
}

export async function postJson(url, body, headers = {}) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    cache: "no-store",
    credentials: "include",
  });
  const data = await r.json().catch(() => ({}));
  return { r, data };
}
