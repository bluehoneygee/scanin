"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const rp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);

function StatusBadge({ status }) {
  const m = {
    scheduled:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    picked:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    canceled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  };
  return (
    <span
      className={`font-poppins rounded-full px-2 py-0.5 text-[11px] font-medium ${
        m[status] ||
        "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

function itemsObjectToArray(items) {
  if (!items || Array.isArray(items)) return items || [];
  return Object.entries(items).map(([id, v]) => ({
    id,
    nama: v?.nama ?? "",
    harga: Number(v?.harga ?? 0),
    qty: Number(v?.qty ?? 0),
  }));
}

function normalizeOrders(raw) {
  const list = Array.isArray(raw?.items)
    ? raw.items
    : Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
    ? raw.data
    : [];

  const norm = list.map((o) => {
    const items = Array.isArray(o.items)
      ? o.items
      : itemsObjectToArray(o.items);
    const total =
      typeof o.total === "number"
        ? o.total
        : items.reduce(
            (s, it) => s + (Number(it.qty) || 0) * (Number(it.harga) || 0),
            0
          );
    return {
      id: String(o.id),
      bank: o.bank || {},
      schedule: o.schedule || { date: o.date, time: o.time },
      items,
      total,
      status: o.status || "scheduled",
      createdAt: o.createdAt || new Date().toISOString(),
    };
  });

  norm.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return norm;
}

export default function OrdersPreview({
  userId,
  limit = 3,
  className = "",
  title = "Penjemputan Terbaru",
  showHeader = true,
}) {
  const [orders, setOrders] = useState([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [err, setErr] = useState("");
  const mountedRef = useRef(false);

  const storageKey = userId ? `pickup-orders:${userId}` : null;

  useEffect(() => {
    setOrders([]);
    setErr("");
  }, [userId, limit]);

  useEffect(() => {
    mountedRef.current = true;
    if (!storageKey)
      return () => {
        mountedRef.current = false;
      };

    try {
      const raw = localStorage.getItem(storageKey);
      const cached = raw ? JSON.parse(raw) : [];
      if (Array.isArray(cached) && cached.length) {
        // cached sudah normalized; fallback normalize jika format lama
        const sample = cached[0] || {};
        const needNormalize = !(
          "schedule" in sample &&
          "status" in sample &&
          "total" in sample
        );
        setOrders(needNormalize ? normalizeOrders({ items: cached }) : cached);
      }
    } catch {}
    return () => {
      mountedRef.current = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!userId) return;
    const ctrl = new AbortController();

    (async () => {
      setLoadingRemote(true);
      setErr("");
      try {
        const qs = new URLSearchParams({
          userId,
          limit: String(limit),
          sortBy: "createdAt",
          order: "desc",
        }).toString();

        const r = await fetch(`/api/orders?${qs}`, {
          cache: "no-store",
          signal: ctrl.signal,
          headers: { "x-user-id": userId },
        });
        const json = await r.json().catch(() => ({}));
        if (!r.ok || json?.ok === false) {
          throw new Error(json?.message || "Gagal memuat penjemputan.");
        }

        const norm = normalizeOrders(json);
        if (!mountedRef.current) return;
        setOrders(norm);

        try {
          if (storageKey)
            localStorage.setItem(storageKey, JSON.stringify(norm));
        } catch {}
      } catch (e) {
        if (!mountedRef.current) return;
        if (e.name !== "AbortError") setErr(e.message || "Terjadi kesalahan.");
      } finally {
        if (mountedRef.current) setLoadingRemote(false);
      }
    })();

    return () => ctrl.abort();
  }, [userId, limit, storageKey]);

  const preview = useMemo(() => orders.slice(0, limit), [orders, limit]);

  return (
    <section className={className}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="font-poppins text-sm font-semibold md:text-base">
            {title}
          </h2>
          <Link
            href="/waste-bank/orders"
            className="font-grotesk text-xs font-medium text-[#9334eb] hover:underline md:text-sm"
          >
            Lihat semua
          </Link>
        </div>
      )}

      {!userId ? (
        <p className="mt-2 text-[13px] text-neutral-500">
          Masuk untuk melihat penjemputanmu.
        </p>
      ) : err ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{err}</p>
      ) : preview.length === 0 && loadingRemote ? (
        <ul className="mt-2 space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <li
              key={`orders-skel-${i}`}
              className="h-14 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
            />
          ))}
        </ul>
      ) : preview.length === 0 ? (
        <p className="font-grotesk mt-2 text-[13px] text-neutral-500">
          Belum ada penjemputan.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-neutral-200 dark:divide-neutral-800">
          {preview.map((o) => (
            <li key={o.id} className="py-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-poppins text-[14px] font-medium truncate">
                    {o?.bank?.nama || "Bank Sampah"}
                  </p>
                  <p className="text-[12px] text-neutral-500">
                    Jadwal: {o?.schedule?.date || "-"} •{" "}
                    {o?.schedule?.time || "-"}
                  </p>
                  <p className="text-[12px] text-neutral-500">
                    Total: {rp(o?.total || 0)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={o.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
