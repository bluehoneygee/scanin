export async function fetcher(url) {
  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.ok) {
    throw new Error(data?.message || "Gagal memuat data.");
  }
  return data;
}
