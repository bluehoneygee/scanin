"use client";

import { useEffect, useState } from "react";

function itemsObjectToArray(items) {
  if (!items || Array.isArray(items)) return items || [];
  return Object.entries(items).map(([id, v]) => ({
    id,
    nama: v?.nama ?? "",
    harga: Number(v?.harga ?? 0),
    qty: Number(v?.qty ?? 0),
  }));
}

export function useOrdersList(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const storageKey = userId ? `pickup-orders:${userId}` : null;

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    async function run() {
      if (!userId) {
        setLoading(false);
        setOrders([]);
        return;
      }

      setLoading(true);
      setErr("");
      try {
        const qs = new URLSearchParams({
          page: "1",
          limit: "50",
          sortBy: "createdAt",
          order: "desc",
          userId,
        }).toString();

        const r = await fetch(`/api/orders?${qs}`, {
          cache: "no-store",
          headers: { "x-user-id": userId },
          signal: ctrl.signal,
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          if (r.status === 401)
            throw new Error("Sesi tidak valid. Silakan login ulang.");
          throw new Error(data?.message || "Gagal memuat data.");
        }

        const list = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const norm = list.map((o) => {
          const itemsRaw = o.items;
          const items = Array.isArray(itemsRaw)
            ? itemsRaw
            : itemsRaw && typeof itemsRaw === "object"
            ? Object.entries(itemsRaw).map(([id, v]) => ({ id, ...v }))
            : [];
          const total =
            typeof o.total === "number"
              ? o.total
              : items.reduce(
                  (s, it) =>
                    s + (Number(it.qty) || 0) * (Number(it.harga) || 0),
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

        if (!alive) return;
        setOrders(norm);
        try {
          if (storageKey)
            localStorage.setItem(storageKey, JSON.stringify(norm));
        } catch {}
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Terjadi kesalahan.");
        try {
          if (storageKey) {
            const arr = JSON.parse(localStorage.getItem(storageKey) || "[]");
            setOrders(Array.isArray(arr) ? arr : []);
          } else {
            setOrders([]);
          }
        } catch {
          setOrders([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [userId, storageKey]);

  return { orders, loading, err };
}
