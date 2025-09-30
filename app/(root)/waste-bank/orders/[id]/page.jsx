"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, User, CalendarDays, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatDateID(isoYmd) {
  if (!isoYmd) return "-";
  const [y, m, d] = isoYmd.split("-").map((x) => parseInt(x, 10));
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  if (!y || !m || !d) return isoYmd;
  return `${d} ${bulan[m - 1]} ${y}`;
}
function to12h(hhmm = "") {
  const [H, M] = hhmm.split(":").map((x) => parseInt(x || "0", 10));
  if (Number.isNaN(H) || Number.isNaN(M)) return "-";
  const h = ((H + 11) % 12) + 1;
  const ampm = H < 12 ? "AM" : "PM";
  return `${h}:${String(M).padStart(2, "0")}${ampm}`;
}
function addMinutes(hhmm, minutes) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  d.setMinutes(d.getMinutes() + (minutes || 0));
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}
function rupiah(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export default function OrderDetailPage() {
  const { id } = useParams();
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
        if (!r.ok || !data?.ok || !data.order) {
          throw new Error("notfound");
        }
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
  }, [order]);

  if (loading) {
    return (
      <main className="min-h-dvh bg-neutral-50 px-4 md:px-6 py-8 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-5 w-56 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="h-4 w-72 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
          <div className="h-4 w-64 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="h-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-dvh bg-neutral-50 px-4 md:px-6 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-xl font-semibold">Pesanan Tidak Ditemukan</h1>
          <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-300">
            Pesanan tidak ditemukan atau sudah dihapus.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:hidden">
            <Link href="/waste-bank/orders">
              <Button className="w-full rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white">
                Lihat Semua Penjemputan
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full rounded-[18px]">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!order) return null;

  const user = order.user || {};

  return (
    <main className="min-h-dvh bg-neutral-50 px-4 md:px-6 py-8 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#9334eb]" />
          <h1 className="text-xl font-semibold">Penjadwalan Berhasil!</h1>
        </div>
        <p className="mt-1 text-[13px] text-neutral-700 dark:text-neutral-300">
          Terima kasih telah berkontribusi untuk bumi yang lebih bersih.
        </p>
        <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
        <p className="text-sm">
          <span className="text-neutral-500">ID Penjemputan:</span>{" "}
          <span className="font-mono font-semibold">#{order.id}</span>
        </p>
        <ul className="mt-3 space-y-2">
          <li className="flex items-start gap-2">
            <User className="mt-0.5 h-4 w-4 text-neutral-500" />
            <span className="text-sm">{user.nama || "-"}</span>
          </li>
          <li className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-4 w-4 text-neutral-500" />
            <span className="text-sm">
              {formatDateID(order?.schedule?.date)}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-neutral-500" />
            <span className="text-sm">{timeRange12h}</span>
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-neutral-500" />
            <span className="text-sm whitespace-pre-wrap break-words">
              {user.alamat || "-"}
            </span>
          </li>
        </ul>
        <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
        <h2 className="text-sm font-semibold">Daftar Item</h2>
        {items.length === 0 ? (
          <p className="mt-2 text-[13px] text-neutral-500">
            Tidak ada item tercatat.
          </p>
        ) : (
          <ul className="mt-2">
            {items.map((it, idx) => (
              <li key={`${it.id}-${idx}`}>
                <div className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{it.nama}</p>
                    <p className="text-[12px] text-neutral-500">
                      {it.qty || 0} kg × {rupiah(it.harga || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {rupiah((Number(it.qty) || 0) * (Number(it.harga) || 0))}
                    </p>
                  </div>
                </div>
                {idx < items.length - 1 ? (
                  <hr className="border-neutral-200 dark:border-neutral-800" />
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[12px] text-neutral-500">Perkiraan total</p>
          <p className="text-base font-semibold">{rupiah(total)}</p>
        </div>
        <p className="mt-1 text-[12px] text-neutral-500">
          Total bersifat perkiraan. Penimbangan dilakukan saat penjemputan.
        </p>
        <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
        <h2 className="text-sm font-semibold">Instruksi Penjemputan</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300">
          <li>Item harus bersih dan dipilah.</li>
          <li>Letakkan item dalam kantong atau wadah yang jelas.</li>
        </ul>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
          <Link href="/waste-bank/orders">
            <Button className="w-full rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white">
              Lihat Semua Penjemputan
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full rounded-[18px]">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
