import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const digits = (s) => String(s || "").replace(/\D/g, "");

export function getUserIdFromRequest(req) {
  const fromGet = req?.headers?.get?.("x-user-id");
  if (fromGet) return String(fromGet);
  const fromObj =
    typeof req?.headers === "object" ? req.headers["x-user-id"] : null;
  if (fromObj) return String(fromObj);
  return "demo-user-1";
}

export async function postJson(
  url,
  body,
  { userId = "demo-user-1", headers = {} } = {}
) {
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { r, data };
}
