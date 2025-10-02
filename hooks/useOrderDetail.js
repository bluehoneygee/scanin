"use client";

import { useEffect, useMemo, useState } from "react";
import { addMinutes, to12h } from "@/lib/format";

export function useOrderDetail(id) {
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/orders/${id}`, { cache: "no-store" });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data?.ok || !data.order) throw new Error("notfound");
        if (!alive) return;
        setOrder(data.order);
        setNotFound(false);
      } catch {
        try {
          const local = JSON.parse(
            localStorage.getItem("pickup-orders") || "[]"
          );
          const found = local.find((o) => String(o.id) === String(id));
          if (alive) {
            if (found) {
              setOrder(found);
              setNotFound(false);
            } else {
              setNotFound(true);
            }
          }
        } catch {
          if (alive) setNotFound(true);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const items = useMemo(() => {
    const raw = order?.items;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
      return Object.entries(raw).map(([itemId, v]) => ({ id: itemId, ...v }));
    }
    return [];
  }, [order]);

  const total = useMemo(() => {
    if (typeof order?.total === "number") return order.total;
    return items.reduce(
      (s, it) => s + (Number(it.qty) || 0) * (Number(it.harga) || 0),
      0
    );
  }, [order?.total, items]);

  const timeRange12h = useMemo(() => {
    const start = order?.schedule?.time;
    if (!start) return "-";
    const end = addMinutes(start, 60);
    return `${to12h(start)} - ${to12h(end)}`;
  }, [order?.schedule?.time]);

  return { loading, notFound, order, items, total, timeRange12h };
}
