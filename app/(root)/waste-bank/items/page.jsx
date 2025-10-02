"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { formatRp as rp } from "@/lib/format";
import { readDraft, writeDraftMerge } from "@/lib/pickup-draft";
import useWasteBankItems from "@/hooks/useWasteBankItems";
import useQtyMap from "@/hooks/useQtyMap";
import BankCard from "@/components/waste-bank/BankCard";
import ItemsList from "@/components/waste-bank/ItemsList";

export default function WasteBankItemsPage() {
  const router = useRouter();

  const [bank, setBank] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("selected-bank");
      if (!s) {
        router.replace("/waste-bank");
        return;
      }
      const parsed = JSON.parse(s);
      setBank(parsed);
      localStorage.setItem("last-used-bank", s);
      if (parsed?.wilayah)
        localStorage.setItem("wb-last-wilayah", parsed.wilayah);
    } catch {
      router.replace("/waste-bank");
    } finally {
      setHydrated(true);
    }
  }, [router]);

  const initialQty = (() => {
    try {
      const d = readDraft();
      return d?.qty || {};
    } catch {
      return {};
    }
  })();
  const { qty, setQty, inc, dec, onInput, resetAll } = useQtyMap(initialQty);

  const { items, loading, err } = useWasteBankItems();

  useEffect(() => {
    if (!hydrated) return;
    writeDraftMerge({ qty, bankId: bank?.id });
  }, [qty, bank?.id, hydrated]);

  useEffect(() => {
    if (!items.length) return;
    const itemsMaster = items.map(({ id, name, price }) => ({
      id,
      nama: name,
      harga: price,
    }));
    writeDraftMerge({ itemsMaster });
  }, [items]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (parseFloat(qty[it.id] || 0) || 0) * (it.price || 0),
        0
      ),
    [qty, items]
  );

  function lanjut() {
    const any = Object.values(qty).some((v) => (parseFloat(v || 0) || 0) > 0);
    if (!any) return alert("Pilih minimal 1 item terlebih dulu ya.");
    router.push("/waste-bank/summary");
  }

  return (
    <div className="min-h-dvh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-40">
        <div className="lg:hidden relative left-1/2 -ml-[50vw] w-[100vw] -mr-[50vw] border-b border-neutral-200 bg-white/90 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Link
              href="/waste-bank"
              className="inline-flex items-center gap-1 text-[13px] font-medium"
            >
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="mx-auto text-sm font-semibold font-poppins">
              Pilih Item
            </h1>
            <span className="w-12" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-6">
        <BankCard bank={bank} />

        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-2 flex items-center justify-between font-poppins">
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

          <ItemsList
            items={items}
            qty={qty}
            onInc={inc}
            onDec={dec}
            onInput={onInput}
            loading={loading}
            error={err}
          />
        </div>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-neutral-500 font-grotesk">
                Perkiraan total
              </p>
              <p className="text-lg font-semibold">{rp(total)}</p>
            </div>
            <Button
              className="font-poppins rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white"
              disabled={total <= 0 || loading || !!err}
              onClick={lanjut}
            >
              Lanjut ke Ringkasan
            </Button>
          </div>
          <p className="mt-2 text-[12px] text-neutral-500 font-grotesk">
            Jadwal & alamat kamu isi di halaman berikutnya.
          </p>
        </div>
      </main>
    </div>
  );
}
