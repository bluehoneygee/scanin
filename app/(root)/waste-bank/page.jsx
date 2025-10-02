"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Search, History, Loader2 } from "lucide-react";

export default function WasteBankPickPage() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [wilayah, setWilayah] = useState("Semua Wilayah");
  const [lastBank, setLastBank] = useState(null);

  const [items, setItems] = useState([]);
  const [wilayahOptions, setWilayahOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // load preferensi awal
  useEffect(() => {
    try {
      const savedWil = localStorage.getItem("wb-last-wilayah");
      if (savedWil) setWilayah(savedWil);
      const lb = JSON.parse(localStorage.getItem("last-used-bank") || "null");
      if (lb) setLastBank(lb);
    } catch {}
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (wilayah && wilayah !== "Semua Wilayah")
          params.set("wilayah", wilayah);
        params.set("page", String(page));
        params.set("limit", String(limit));

        const r = await fetch(`/api/waste-banks/live?${params.toString()}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data?.ok)
          throw new Error(data?.message || "Gagal memuat data.");
        setItems(data.items || []);
        setHasNext(!!data.hasNext);
        setWilayahOptions(["Semua Wilayah", ...(data.wilayahOptions || [])]);
      } catch (e) {
        if (e.name !== "AbortError")
          setErrorMsg(e.message || "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [q, wilayah, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [q, wilayah]);

  function chooseBank(bank) {
    try {
      localStorage.setItem("selected-bank", JSON.stringify(bank));
      localStorage.setItem("last-used-bank", JSON.stringify(bank));
      if (bank?.wilayah) localStorage.setItem("wb-last-wilayah", bank.wilayah);
    } catch {}
    router.push("/waste-bank/items");
  }

  const useLastBank = () => lastBank && chooseBank(lastBank);
  const clearLastBank = () => {
    try {
      localStorage.removeItem("last-used-bank");
    } catch {}
    setLastBank(null);
  };

  const canPrev = page > 1;
  const canNext = hasNext;

  return (
    <div className="min-h-dvh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-40">
        <div className="lg:hidden relative left-1/2 -ml-[50vw] w-[100vw] -mr-[50vw] border-b border-neutral-200 bg-white/90 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[13px] font-medium "
            >
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="mx-auto text-sm font-semibold font-poppins">
              Pilih Bank Sampah
            </h1>
            <span className="w-12" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-6">
        {lastBank && (
          <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] text-neutral-500 inline-flex items-center gap-1">
                  <History className="h-3.5 w-3.5" /> Terakhir digunakan
                </p>
                <p className="mt-1 font-semibold">{lastBank.nama}</p>
                <p className="text-[12px] text-neutral-500">
                  {lastBank.wilayah} • {lastBank.kecamatan} •{" "}
                  {lastBank.kelurahan}
                </p>
                {lastBank.alamat ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-neutral-500 font-poppins">
                    <MapPin className="h-3.5 w-3.5" /> {lastBank.alamat}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    useLastBank();
                  }}
                  className="text-[12px] font-medium text-[#9334eb] hover:underline"
                >
                  Gunakan
                </a>

                <span className="text-neutral-300">•</span>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    clearLastBank();
                  }}
                  className="text-[12px] font-medium text-neutral-500 hover:text-neutral-700 hover:underline"
                >
                  Hapus
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="sm:col-span-2 min-w-0">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <Search className="h-4 w-4 text-neutral-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama / kecamatan / kelurahan / alamat…"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>
          <div className="sm:col-span-1">
            <div className="relative">
              <select
                value={wilayah}
                onChange={(e) => {
                  const v = e.target.value;
                  setWilayah(v);
                  try {
                    if (v !== "Semua Wilayah")
                      localStorage.setItem("wb-last-wilayah", v);
                  } catch {}
                }}
                className=" font-grotesk h-10 w-full appearance-none rounded-xl border border-neutral-200 bg-white pl-3 pr-9 text-sm shadow-sm outline-none dark:border-neutral-800 dark:bg-neutral-900"
              >
                <option>Semua Wilayah</option>
                {wilayahOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.16l-4.24 3.36a.75.75 0 0 1-.94 0L5.21 8.39a.75.75 0 0 1 .02-1.18z" />
              </svg>
            </div>
          </div>
        </div>
        {errorMsg ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {errorMsg}
          </p>
        ) : null}
        <ul className="mt-4 space-y-3">
          {loading && items.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={`skeleton-${i}`}
                  className="h-20 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
                />
              ))
            : null}

          {!loading && items.length === 0 && !errorMsg ? (
            <li className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
              Tidak ada hasil untuk kriteria ini.
            </li>
          ) : null}

          {items.map((b) => (
            <li
              key={b.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold font-poppins">{b.nama}</p>
                  <p className="mt-0.5 text-[12px] text-neutral-500 font-grotesk">
                    {b.wilayah} • {b.kecamatan} • {b.kelurahan}
                  </p>
                  {b.alamat ? (
                    <p className="font-grotesk mt-1 inline-flex items-center gap-1 text-[12px] text-neutral-500">
                      <MapPin className="h-3.5 w-3.5 " /> {b.alamat}
                    </p>
                  ) : null}
                </div>
                <Button
                  className=" rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white"
                  onClick={() => chooseBank(b)}
                >
                  Pilih
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {(canPrev || canNext) && (
          <div className="mt-6 flex items-center justify-between ">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev || loading}
            >
              {loading && canPrev ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sebelumnya
            </Button>
            <span className="text-[13px] text-neutral-500">Halaman {page}</span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={!canNext || loading}
            >
              {loading && canNext ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Berikutnya
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
