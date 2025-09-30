"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const DRAFT_KEY = "pickup-draft";
const ORDERS_KEY = "pickup-orders";
const PTS_BAL_KEY = "points-balance";
const PTS_HIST_KEY = "points-history";
const CURRENT_USER_ID = "demo-user-1";

function rp(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function slots(start = 8, end = 17, step = 30) {
  const out = [];
  for (let h = start; h <= end; h++) {
    for (let m = 0; m < 60; m += step) {
      if (h === end && m > 0) break;
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeDraftMerge(patch) {
  try {
    const prev = readDraft();
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...prev, ...patch }));
  } catch {}
}

export default function WasteBankSummaryPage() {
  const router = useRouter();

  const [bank, setBank] = useState(null);
  const [qty, setQty] = useState({});
  const [itemsMaster, setItemsMaster] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [loadErr, setLoadErr] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const [nama, setNama] = useState("");
  const [telp, setTelp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("08:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("selected-bank");
      if (s) setBank(JSON.parse(s));
      else {
        router.replace("/waste-bank");
        return;
      }

      const d = readDraft();
      if (!d || d.qty == null) {
        router.replace("/waste-bank/items");
        return;
      }
      setQty(d.qty || {});
      setItemsMaster(d.itemsMaster || []);
      setDate(d.date || todayISO());
      setTime(d.time || "08:00");
      setNama(d.nama || "");
      setTelp(d.telp || "");
      setAlamat(d.alamat || "");
      setCatatan(d.catatan || "");
    } finally {
      setHydrated(true);
    }
  }, [router]);

  useEffect(() => {
    if (itemsMaster && itemsMaster.length) return;
    let alive = true;
    (async () => {
      try {
        setLoadingMaster(true);
        setLoadErr("");
        const r = await fetch("/api/waste-items", { cache: "no-store" });
        const data = await r.json().catch(() => ({}));
        const arr = data?.items ?? data ?? [];
        if (!Array.isArray(arr)) throw new Error("Gagal memuat items");
        const normalized = arr.map((it) => ({
          id: String(it.id),
          nama: String(it.name ?? "").trim(),
          harga: Number(it.price || 0),
        }));
        if (!alive) return;
        setItemsMaster(normalized);
        writeDraftMerge({
          itemsMaster: normalized,
          itemsMasterUpdatedAt: Date.now(),
        });
      } catch (e) {
        if (alive) setLoadErr(e.message || "Terjadi kesalahan.");
      } finally {
        if (alive) setLoadingMaster(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [itemsMaster]);

  const selectedList = useMemo(
    () =>
      (itemsMaster || [])
        .map((it) => ({ ...it, qty: parseFloat(qty[it.id] || 0) || 0 }))
        .filter((it) => it.qty > 0),
    [itemsMaster, qty]
  );

  const total = useMemo(
    () => selectedList.reduce((s, it) => s + it.qty * it.harga, 0),
    [selectedList]
  );

  useEffect(() => {
    if (!hydrated) return;
    writeDraftMerge({ qty, date, time, nama, telp, alamat, catatan });
  }, [qty, date, time, nama, telp, alamat, catatan, hydrated]);

  const valid =
    selectedList.length > 0 &&
    !!nama.trim() &&
    !!telp.trim() &&
    !!alamat.trim() &&
    !!date &&
    !!time;

  async function submit() {
    if (!valid) {
      alert("Lengkapi item, alamat, tanggal, dan jam ya.");
      return;
    }
    setSaving(true);
    try {
      const itemsObj = selectedList.reduce((acc, it) => {
        acc[String(it.id)] = { nama: it.nama, harga: it.harga, qty: it.qty };
        return acc;
      }, {});

      const payload = {
        userId: "demo-user-1",
        bank: {
          id: bank.id,
          nama: bank.nama,
          wilayah: bank.wilayah,
          kecamatan: bank.kecamatan,
          kelurahan: bank.kelurahan,
          alamat: bank.alamat,
        },
        items: itemsObj,
        total,
        schedule: { date, time },
        user: { nama, telp, alamat, catatan },
        status: "scheduled",
        createdAt: new Date().toISOString(),
      };

      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user-1",
          bank,
          items: selectedList,
          total,
          schedule: { date, time },
          user: { nama, telp, alamat, catatan },
          status: "scheduled",
          createdAt: new Date().toISOString(),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.ok) {
        console.error("POST /api/orders failed:", { status: r.status, data });
        alert(data?.message || "Gagal menyimpan.");
        return;
      }
      router.replace(`/waste-bank/orders/${data.order.id}`);
    } catch (e) {
      alert(e.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (!bank) return null;

  return (
    <div className="min-h-dvh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-40">
        <div className="relative left-1/2 -ml-[50vw] w-[100vw] -mr-[50vw] border-b border-neutral-200 bg-white/90 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Link
              href="/waste-bank/items"
              className="inline-flex items-center gap-1 text-[13px] font-medium"
            >
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="mx-auto text-sm font-semibold">Ringkasan</h1>
            <span className="w-12" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-6 space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="font-semibold">{bank.nama}</p>
          <p className="mt-0.5 text-[12px] text-neutral-500">
            {bank.wilayah} • {bank.kecamatan} • {bank.kelurahan}
          </p>
          {bank.alamat ? (
            <p className="mt-1 text-[12px] text-neutral-500">{bank.alamat}</p>
          ) : null}
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Item Terpilih</p>
            <Link
              href="/waste-bank/items"
              className="text-[12px] font-medium text-[#9334eb] hover:underline"
            >
              Ubah item
            </Link>
          </div>

          {loadingMaster && !itemsMaster.length ? (
            <p className="inline-flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat item…
            </p>
          ) : loadErr ? (
            <p className="text-sm text-red-600 dark:text-red-400">{loadErr}</p>
          ) : selectedList.length === 0 ? (
            <p className="text-[13px] text-neutral-500">
              Belum ada item. Silakan pilih di halaman sebelumnya.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {selectedList.map((it) => (
                <li
                  key={it.id}
                  className="py-2 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{it.nama}</p>
                    <p className="text-[12px] text-neutral-500">
                      {it.qty} kg × {rp(it.harga)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {rp(it.qty * it.harga)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[12px] text-neutral-500">Perkiraan total</p>
            <p className="text-base font-semibold">{rp(total)}</p>
          </div>
          <p className="mt-1 text-[12px] text-neutral-500">
            Total bersifat perkiraan. Penimbangan dilakukan saat penjemputan.
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm font-semibold">Alamat & Kontak</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] text-neutral-500">
                Nama Kontak
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-transparent pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#9334eb] dark:border-neutral-800"
                  placeholder="Nama penerima"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[12px] text-neutral-500">
                No. Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  value={telp}
                  onChange={(e) => setTelp(e.target.value)}
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-transparent pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#9334eb] dark:border-neutral-800"
                  placeholder="08xxxxxxxxxx"
                  inputMode="tel"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] text-neutral-500">
              Alamat Penjemputan
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-neutral-200 bg-transparent pl-9 pr-3 pt-2 text-sm outline-none focus:ring-2 focus:ring-[#9334eb] dark:border-neutral-800"
                placeholder="Nama jalan, nomor rumah, RT/RW, patokan"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] text-neutral-500">
              Catatan (opsional)
            </label>
            <input
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-[#9334eb] dark:border-neutral-800"
              placeholder="Misal: security hubungi dulu, bawa timbangan kecil, dll."
            />
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm font-semibold">Jadwal Penjemputan</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] text-neutral-500">
                Tanggal
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="date"
                  min={todayISO()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-transparent pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#9334eb] dark:border-neutral-800"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[12px] text-neutral-500">
                Jam (Jam Kerja)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-transparent pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#9334eb] dark:border-neutral-800"
                >
                  {slots(8, 17, 30).map((t) => (
                    <option key={t} value={t}>
                      {t} WIB
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-[12px] text-neutral-500">
                08:00 – 17:00, interval 30 menit.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-neutral-500">Perkiraan total</p>
              <p className="text-lg font-semibold">{rp(total)}</p>
            </div>
            <Button
              className="rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white"
              disabled={
                !valid || saving || (loadingMaster && itemsMaster.length === 0)
              }
              onClick={submit}
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Buat Permintaan Penjemputan
                </span>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
