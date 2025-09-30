"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";

const DRAFT_KEY = "pickup-draft";

const rp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);

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

export default function WasteBankItemsPage() {
  const router = useRouter();

  const [bank, setBank] = useState(null);
  const [qty, setQty] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("selected-bank");
      if (s) {
        const parsed = JSON.parse(s);
        setBank(parsed);
        localStorage.setItem("last-used-bank", s);
        if (parsed?.wilayah)
          localStorage.setItem("wb-last-wilayah", parsed.wilayah);
      } else {
        router.replace("/waste-bank");
      }
    } catch {
      router.replace("/waste-bank");
    }
  }, [router]);

  useEffect(() => {
    try {
      const d = readDraft();
      if (d?.qty) setQty(d.qty);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const r = await fetch("/api/waste-items", { cache: "no-store" });
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

        if (!alive) return;
        setItems(norm);

        const itemsMaster = norm.map(({ id, name, price }) => ({
          id,
          nama: name,
          harga: price,
        }));
        writeDraftMerge({ itemsMaster });
      } catch (e) {
        if (alive) setErr(e.message || "Terjadi kesalahan.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeDraftMerge({ qty, bankId: bank?.id });
  }, [qty, bank?.id, hydrated]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (parseFloat(qty[it.id] || 0) || 0) * (it.price || 0),
        0
      ),
    [qty, items]
  );

  function inc(id, step = 0.5) {
    setQty((p) => ({
      ...p,
      [id]: +((parseFloat(p[id] || 0) || 0) + step).toFixed(1),
    }));
  }
  function dec(id, step = 0.5) {
    setQty((p) => {
      const v = (parseFloat(p[id] || 0) || 0) - step;
      return { ...p, [id]: +Math.max(0, v).toFixed(1) };
    });
  }
  function onInput(id, val) {
    const raw = String(val || "").replace(",", ".");
    const num = Math.max(0, parseFloat(raw) || 0);
    setQty((p) => ({ ...p, [id]: +num.toFixed(1) }));
  }
  function resetAll() {
    if (confirm("Reset semua pilihan item?")) setQty({});
  }
  function lanjut() {
    const any = Object.values(qty).some((v) => (parseFloat(v || 0) || 0) > 0);
    if (!any) {
      alert("Pilih minimal 1 item terlebih dulu ya.");
      return;
    }
    router.push("/waste-bank/summary");
  }

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
            <h1 className="mx-auto text-sm font-semibold">Pilih Item</h1>
            <span className="w-12" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-6">
        {bank && (
          <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p className="font-semibold">{bank.nama}</p>
            <p className="mt-0.5 text-[12px] text-neutral-500">
              {bank.wilayah} • {bank.kecamatan} • {bank.kelurahan}
            </p>
            {bank.alamat ? (
              <p className="mt-1 text-[12px] text-neutral-500">{bank.alamat}</p>
            ) : null}
          </div>
        )}

        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Pilih Item (kg)</p>
            <Button
              variant="outline"
              size="sm"
              onClick={resetAll}
              className="h-8 px-2"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>

          {loading ? (
            <ul className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <li
                  key={`sk-${i}`}
                  className="h-14 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800"
                />
              ))}
            </ul>
          ) : err ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
              {err}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 p-4 text-center text-sm text-neutral-500 dark:border-neutral-800">
              Belum ada item.
            </div>
          ) : (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {items.map((it) => {
                const q = parseFloat(qty[it.id] || 0) || 0;
                const subtotal = q * (it.price || 0);
                return (
                  <li key={it.id} className="py-2 sm:py-3">
                    <div
                      className="
                        grid items-center gap-2 sm:gap-3
                        grid-cols-[minmax(0,1fr)_104px_94px]
                        sm:grid-cols-[minmax(0,1fr)_160px_140px]
                      "
                    >
                      <div className="min-w-0">
                        <p className="font-medium leading-5 truncate">
                          {it.name}
                        </p>
                        <p className="text-[11px] sm:text-[12px] text-neutral-500">
                          {rp(it.price)} / kg
                        </p>
                      </div>

                      <div className="justify-self-end">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                            onClick={() => dec(it.id)}
                            aria-label={`Kurangi ${it.name}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <input
                            inputMode="decimal"
                            step="0.5"
                            min="0"
                            value={q}
                            onChange={(e) => onInput(it.id, e.target.value)}
                            className="
                              h-8 w-[56px] sm:h-9 sm:w-[72px]
                              text-center rounded-lg border border-neutral-200 bg-transparent
                              text-[13px] sm:text-sm outline-none focus:ring-2 focus:ring-[#9334eb]
                              dark:border-neutral-800
                            "
                          />
                          <Button
                            type="button"
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9 bg-[#9334eb] hover:bg-[#7e2cd0] text-white"
                            onClick={() => inc(it.id)}
                            aria-label={`Tambah ${it.name}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="justify-self-end text-right">
                        <p className="text-sm font-semibold">{rp(subtotal)}</p>
                        <p className="text-[11px] text-neutral-500">{q} kg</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-neutral-500">Perkiraan total</p>
              <p className="text-lg font-semibold">{rp(total)}</p>
            </div>
            <Button
              className="rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white"
              disabled={total <= 0 || loading || !!err}
              onClick={lanjut}
            >
              Lanjut ke Ringkasan
            </Button>
          </div>
          <p className="mt-2 text-[12px] text-neutral-500">
            Jadwal & alamat kamu isi di halaman berikutnya.
          </p>
        </div>
      </main>
    </div>
  );
}
