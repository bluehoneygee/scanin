"use client";

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
import { useAuthUser } from "@/lib/use-auth-user";
import { formatRp as rp, timeSlots, todayISO } from "@/lib/format";
import useSelectedBank from "@/hooks/useSelectedBank";
import useSummaryDraft from "@/hooks/useSummaryDraft";
import BankCard from "@/components/waste-bank/BankCard";
import SelectedItemsList from "@/components/waste-bank/SelectedItemsList";
import { useMemo, useState, useEffect } from "react";
import { readDraft } from "@/lib/pickup-draft";

export default function WasteBankSummaryPage() {
  const router = useRouter();
  const auth = useAuthUser();
  const userId =
    auth?.id || auth?.userId || auth?.username || auth?.email || "";

  const { bank } = useSelectedBank();
  const {
    selectedList,
    total,
    loadingMaster,
    loadErr,
    nama,
    setNama,
    telp,
    setTelp,
    alamat,
    setAlamat,
    catatan,
    setCatatan,
    date,
    setDate,
    time,
    setTime,
  } = useSummaryDraft();

  useEffect(() => {
    const d = readDraft();
    if (!d || d.qty == null) router.replace("/waste-bank/items");
  }, [router]);

  const [saving, setSaving] = useState(false);
  const valid =
    !!userId &&
    (selectedList?.length || 0) > 0 &&
    !!nama.trim() &&
    !!telp.trim() &&
    !!alamat.trim() &&
    !!date &&
    !!time;

  async function submit() {
    if (!userId) return alert("Silakan login terlebih dulu.");
    if (!valid) return alert("Lengkapi item, alamat, tanggal, dan jam ya.");

    setSaving(true);
    try {
      const payload = {
        userId,
        bank: {
          id: bank.id,
          nama: bank.nama,
          wilayah: bank.wilayah,
          kecamatan: bank.kecamatan,
          kelurahan: bank.kelurahan,
          alamat: bank.alamat,
        },
        items: selectedList,
        total,
        schedule: { date, time },
        user: { nama, telp, alamat, catatan },
        status: "scheduled",
        createdAt: new Date().toISOString(),
      };

      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json", "x-user-id": userId },
        body: JSON.stringify(payload),
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
        <div className="lg:hidden relative left-1/2 -ml-[50vw] w-[100vw] -mr-[50vw] border-b border-neutral-200 bg-white/90 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Link
              href="/waste-bank/items"
              className="inline-flex items-center gap-1 text-[13px] font-medium"
            >
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="mx-auto text-sm font-semibold font-poppins">
              Ringkasan
            </h1>
            <span className="w-12" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-6 space-y-4">
        <BankCard bank={bank} />
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-2 flex items-center justify-between font-poppins">
            <p className="text-sm font-semibold">Item Terpilih</p>
            <Link
              href="/waste-bank/items"
              className="text-[12px] font-medium text-[#9334eb] hover:underline"
            >
              Ubah item
            </Link>
          </div>

          <SelectedItemsList
            selectedList={selectedList}
            loading={loadingMaster}
            error={loadErr}
          />

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[12px] text-neutral-500">Perkiraan total</p>
            <p className="text-base font-semibold font-poppins">{rp(total)}</p>
          </div>
          <p className="mt-1 text-[12px] text-neutral-500">
            Total bersifat perkiraan. Penimbangan dilakukan saat penjemputan.
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm font-semibold font-poppins">Alamat & Kontak</p>

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
          <p className="text-sm font-semibold font-poppins">
            Jadwal Penjemputan
          </p>

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
                  {timeSlots(8, 17, 30).map((t) => (
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
              <p className="text-[10px] text-neutral-500 font-poppins">
                Perkiraan total
              </p>
              <p className="text-lg font-semibold">{rp(total)}</p>
            </div>
            <Button
              className="rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white"
              disabled={
                !valid ||
                saving ||
                (loadingMaster && (selectedList?.length || 0) === 0)
              }
              onClick={submit}
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-[10px] lg:text-[16px]">
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
