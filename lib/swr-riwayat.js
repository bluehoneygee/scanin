import useSWR, { mutate as swrMutate } from "swr";

export const fetcher = (url) =>
  fetch(url, { cache: "no-store" }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data?.ok) {
      throw new Error(data?.message || `Gagal memuat (${r.status})`);
    }
    return data;
  });

export const riwayatKey = ({ page = 1, limit = 10 } = {}) =>
  `/api/riwayat?${new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString()}`;

export function useRiwayat(opts) {
  const key = riwayatKey(opts || {});
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
}

// panggil ini agar Home (yang pakai page=1) ikut segar
export function refreshRiwayatHome(limit = 5) {
  return swrMutate(riwayatKey({ page: 1, limit }));
}
