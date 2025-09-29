// hooks/useRiwayat.js
"use client";

import useSWR, { mutate as globalMutate } from "swr";

const fetcher = (url) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export function useRiwayat({
  page = 1,
  limit = 10,
  userId = "demo-user-1",
} = {}) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    userId,
  }).toString();
  const key = `/api/riwayat?${qs}`;

  const { data, error, isLoading, mutate } = useSWR(key, async () => {
    const res = await fetcher(key);
    if (!res?.ok) throw new Error(res?.message || "Gagal memuat riwayat.");
    return res;
  });

  return { data, error, isLoading, mutate, key };
}

// revalidate cache untuk widget riwayat di Home (halaman 1, limit n)
export async function refreshRiwayatHome(limit = 5, userId = "demo-user-1") {
  const qs = new URLSearchParams({
    page: "1",
    limit: String(limit),
    userId,
  }).toString();
  await globalMutate(`/api/riwayat?${qs}`);
}
