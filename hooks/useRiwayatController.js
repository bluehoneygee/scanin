// hooks/useRiwayatController.js
"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useRiwayat, refreshRiwayatHome } from "@/hooks/useRiwayat"; // <-- pindah juga (lihat langkah 2)

export function useRiwayatController({
  defaultLimit = 10,
  userId = "demo-user-1",
} = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = defaultLimit;

  const { data, error, isLoading, mutate } = useRiwayat({
    page,
    limit,
    userId,
  });
  const [deletingId, setDeletingId] = useState("");

  const items = useMemo(() => {
    const raw = data?.items || [];
    return raw.map((it) => {
      const name = it?.product?.name || `Produk ${it.barcode}`;
      const image = it?.product?.image || "";
      const chip = it?.ai?.category || "";
      const tips = Array.isArray(it?.ai?.tips) ? it.ai.tips : [];
      const timeStr = it?.createdAt
        ? new Date(it.createdAt).toLocaleString([], {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
          })
        : "-";
      return {
        id: it.id,
        barcode: it.barcode,
        name,
        image,
        chip,
        tips,
        timeStr,
      };
    });
  }, [data]);

  const hasNext = !!data?.hasNext;

  const goPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    router.push(`/riwayat?${params.toString()}`);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function handleDelete(id) {
    if (!id) return;
    if (!confirm("Hapus item riwayat ini?")) return;

    setDeletingId(id);
    const prev = data;

    try {
      await mutate(
        async () => {
          const r = await fetch(`/api/riwayat?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
          });
          const del = await r.json().catch(() => ({}));
          if (!r.ok || !del?.ok)
            throw new Error(del?.message || "Gagal menghapus");
          return {
            ...prev,
            items: (prev?.items || []).filter((x) => x.id !== id),
          };
        },
        { revalidate: false }
      );
      await refreshRiwayatHome(5, userId); // sync mini-widget di Home
    } catch (e) {
      alert(e.message || "Gagal menghapus.");
      await mutate(); // fallback revalidate penuh
    } finally {
      setDeletingId("");
    }
  }

  async function refresh() {
    await mutate(); // revalidate halaman ini
    await refreshRiwayatHome(5, userId); // revalidate cache Home
  }

  return {
    page,
    limit,
    items,
    hasNext,
    error,
    isLoading,
    deletingId,
    goPage,
    handleDelete,
    refresh,
  };
}
