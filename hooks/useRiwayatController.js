"use client";

import { useCallback, useMemo, useState } from "react";
import { useRiwayat } from "@/hooks/useRiwayat";

export function useRiwayatController({
  userId,
  defaultLimit = 10,
  initialPage = 1,
  pushPage,
} = {}) {
  const [page, setPage] = useState(Math.max(1, Number(initialPage) || 1));
  const limit = defaultLimit;

  const { data, error, isLoading, isValidating, mutate } = useRiwayat({
    page,
    limit,
    userId,
  });

  const [deletingId, setDeletingId] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        _raw: it,
      };
    });
  }, [data]);

  const hasNext = !!data?.hasNext;

  const goPage = useCallback(
    (p) => {
      const next = Math.max(1, Number(p) || 1);
      setPage(next);
      if (typeof pushPage === "function") pushPage(next);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pushPage]
  );

  async function handleDelete(id) {
    if (!id || !userId) return;
    if (!confirm("Hapus item riwayat ini?")) return;

    setDeletingId(id);
    const prev = data;

    try {
      await mutate(
        async () => {
          const r = await fetch(
            `/api/riwayat?id=${encodeURIComponent(
              id
            )}&userId=${encodeURIComponent(String(userId))}`,
            { method: "DELETE" }
          );
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
      await mutate();
    } catch (e) {
      alert(e?.message || "Gagal menghapus.");
      await mutate();
    } finally {
      setDeletingId("");
    }
  }

  async function refresh() {
    if (!userId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  }

  return {
    page,
    limit,
    items,
    hasNext,
    error,
    isLoading,
    isValidating,
    isRefreshing,
    deletingId,
    goPage,
    handleDelete,
    refresh,
  };
}
