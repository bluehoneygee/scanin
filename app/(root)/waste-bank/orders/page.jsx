"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const USER_ID = "demo-user-1";
const LS_KEY = "pickup-orders";

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
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        m[status] ||
        "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const r = await fetch(
          `/api/orders?userId=${encodeURIComponent(USER_ID)}`,
          {
            cache: "no-store",
          }
        );
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.message || "Gagal memuat data.");

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
          localStorage.setItem(LS_KEY, JSON.stringify(norm));
        } catch {}
      } catch (e) {
        setErr(e.message || "Terjadi kesalahan.");
        // fallback local
        try {
          const arr = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
          if (alive) setOrders(Array.isArray(arr) ? arr : []);
        } catch {
          if (alive) setOrders([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const empty = !loading && orders.length === 0;

  return (
    <div className="min-h-dvh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-40">
        <div className="relative left-1/2 -ml-[50vw] w-[100vw] -mr-[50vw] border-b border-neutral-200 bg-white/90 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Link
              href="/waste-bank"
              className="inline-flex items-center gap-1 text-[13px] font-medium"
            >
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="mx-auto text-sm font-semibold">
              Daftar Penjemputan
            </h1>
            <span className="w-12" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-6">
        {err && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {err}
          </p>
        )}

        {loading ? (
          <ul className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={`sk-${i}`}
                className="h-20 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
              />
            ))}
          </ul>
        ) : empty ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
            Belum ada permintaan penjemputan.
            <div className="mt-3">
              <Link href="/waste-bank">
                <Button className="rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white">
                  Buat Permintaan Penjemputan
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((o) => (
                <li
                  key={o.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {o?.bank?.nama || "Bank Sampah"}
                      </p>
                      <p className="mt-0.5 text-[12px] text-neutral-500">
                        Jadwal: {o?.schedule?.date || "-"} •{" "}
                        {o?.schedule?.time || "-"}
                      </p>
                      <p className="text-[12px] text-neutral-500">
                        Total: {rp(o?.total || 0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={o.status} />
                      <Link href={`/waste-bank/orders/${o.id}`}>
                        <Button variant="outline" size="sm">
                          Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </main>
    </div>
  );
}
