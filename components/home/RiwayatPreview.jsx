"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RiwayatListItem from "./RiwayatListItem";

export default function RiwayatPreview({ userId, limit = 3 }) {
  const [items, setItems] = useState([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [err, setErr] = useState("");
  const mountedRef = useRef(false);

  const LS_KEY = useMemo(() => `riwayat:preview:${userId}`, [userId]);

  useEffect(() => {
    setItems([]);
    setErr("");
  }, [userId, limit]);

  useEffect(() => {
    mountedRef.current = true;
    if (!userId)
      return () => {
        mountedRef.current = false;
      };

    try {
      const raw = localStorage.getItem(LS_KEY);
      const cached = raw ? JSON.parse(raw) : [];
      if (Array.isArray(cached) && cached.length) {
        setItems(cached.slice(0, limit));
      }
    } catch {}
    return () => {
      mountedRef.current = false;
    };
  }, [userId, limit, LS_KEY]);

  useEffect(() => {
    if (!userId) return;
    const ctrl = new AbortController();

    (async () => {
      setLoadingRemote(true);
      setErr("");
      try {
        const qs = new URLSearchParams({
          page: "1",
          limit: String(limit),
          userId,
        }).toString();

        const r = await fetch(`/api/riwayat?${qs}`, {
          cache: "no-store",
          signal: ctrl.signal,
          headers: { "x-user-id": userId },
        });
        const json = await r.json().catch(() => ({}));

        if (r.status === 404) {
          if (!mountedRef.current) return;
          setItems([]);
          try {
            localStorage.setItem(LS_KEY, JSON.stringify([]));
          } catch {}
        } else if (!r.ok || json?.ok === false) {
          throw new Error(json?.message || "Gagal memuat riwayat.");
        } else {
          const arr = Array.isArray(json?.items) ? json.items : [];
          const top = arr.slice(0, limit);
          if (!mountedRef.current) return;
          setItems(top);
          try {
            localStorage.setItem(LS_KEY, JSON.stringify(top));
          } catch {}
        }
      } catch (e) {
        if (!mountedRef.current) return;
        if (e.name !== "AbortError") setErr(e.message || "Terjadi kesalahan.");
      } finally {
        if (mountedRef.current) setLoadingRemote(false);
      }
    })();

    return () => ctrl.abort();
  }, [userId, limit, LS_KEY]);

  const showSkeleton = items.length === 0 && loadingRemote;

  if (err) {
    return <p className="mt-2 text-sm text-red-600 dark:text-red-400">{err}</p>;
  }

  if (showSkeleton) {
    return (
      <ul className="mt-2 space-y-2">
        {Array.from({ length: limit }).map((_, i) => (
          <li
            key={`home-riw-skel-${i}`}
            className="h-14 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
          />
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <p className="font-grotesk mt-2 text-[13px] text-neutral-500">
        Belum ada riwayat. Scan produk terlebih dulu yaa.
      </p>
    );
  }

  return (
    <ul className="mt-2 space-y-2">
      {items.map((it) => {
        const name = it?.product?.name || `Produk ${it.barcode}`;
        const timeStr = it?.createdAt
          ? new Date(it.createdAt).toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
            })
          : "-";
        const chip = it?.ai?.category || "";
        const imageUrl = it?.product?.image || "";

        return (
          <RiwayatListItem
            key={it.id}
            title={name}
            timestamp={timeStr}
            chipLabel={chip}
            imageUrl={imageUrl}
          />
        );
      })}
    </ul>
  );
}
