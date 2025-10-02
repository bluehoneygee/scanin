"use client";

import { useEffect, useState } from "react";

export default function useWasteBankItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const r = await fetch("/api/waste-items", {
          cache: "no-store",
          signal: ctrl.signal,
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.message || "Gagal memuat item.");

        const arr = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        const norm = arr
          .map((it) => ({
            id: String(it.id),
            name: String(it.name || it.nama || "").trim(),
            price: Number(it.price ?? it.harga ?? 0),
          }))
          .filter((x) => x.id && x.name)
          .sort((a, b) => a.name.localeCompare(b.name, "id"));

        setItems(norm);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, []);

  return { items, loading, err, setItems };
}
