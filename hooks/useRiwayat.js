"use client";

import useSWR from "swr";

const fetcher = async (url) => {
  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data?.ok === false) {
    throw new Error(data?.message || `Gagal memuat (${r.status})`);
  }
  return data;
};

export function useRiwayat({ page = 1, limit = 10, userId } = {}) {
  const key = userId
    ? `/api/riwayat?${new URLSearchParams({
        page: String(page),
        limit: String(limit),
        userId,
      }).toString()}`
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  return { data, error, isLoading, isValidating, mutate, key };
}
