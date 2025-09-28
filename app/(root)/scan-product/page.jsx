"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Scan } from "lucide-react";

const BRAND_START = "#9334eb";

export default function ScanProductPage() {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState("");

  async function saveAndTips(code) {
    await fetch("/api/mock-scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        category: "lainnya",
        createdAt: new Date().toISOString(),
      }),
    });
    const r = await fetch("/api/ai-tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, category: "lainnya" }),
    });
    const data = await r.json();
    setTips(data?.tips || "");
  }

  async function handleScan() {
    const code = barcode.trim();
    if (!code) return alert("Masukkan/scan barcode dulu ya.");
    setLoading(true);
    try {
      await saveAndTips(code);
    } catch {
      alert("Gagal memproses scan.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckManual() {
    const code = barcode.trim();
    if (!code) return;
    setLoading(true);
    try {
      await saveAndTips(code);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-40">
        <div className="relative left-1/2 -ml-[50vw] w-[100vw] -mr-[50vw] border-b border-neutral-200 bg-white/90 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[13px] font-medium"
              style={{ color: BRAND_START }}
            >
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="mx-auto text-sm font-semibold">Pemindai</h1>
            <span className="w-12" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-sm md:max-w-3xl px-4 md:px-6 pb-28 md:pb-10">
        <section className="mt-6 flex flex-col items-center">
          <img
            src="/illustrations/scanner.svg"
            alt="Ilustrasi pemindai barcode"
            className="w-[300px] md:w-[360px] h-auto"
          />
          <Button
            onClick={handleScan}
            disabled={loading}
            className="mt-6 h-14 w-full rounded-[22px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white text-base font-semibold shadow-md hover:brightness-95 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Memproses...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Scan className="h-5 w-5" /> Scan&Go
              </span>
            )}
          </Button>

          <div className="mt-4 flex w-full items-center gap-3">
            <Input
              placeholder="Masukkan kode barcode (EAN/UPC)"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCheckManual();
              }}
              inputMode="numeric"
              enterKeyHint="done"
              className="h-12 rounded-2xl focus-visible:ring-2 focus-visible:ring-[#9334eb]"
            />

            <Button
              variant="outline"
              onClick={handleCheckManual}
              disabled={loading}
              className="h-12 rounded-2xl px-5 font-semibold border-[#9334eb] text-[#9334eb] hover:bg-[#9334eb]/5 disabled:opacity-60"
            >
              Cek
            </Button>
          </div>

          <p className="mt-3 text-center text-[13px] leading-5 text-neutral-500">
            Arahkan kamera ke barcode untuk mulai pemindaian, atau masukkan kode
            secara manual lalu tekan <span className="font-semibold">Cek</span>.
          </p>
        </section>

        {tips && (
          <section className="mt-6">
            <Alert className="border-[#9334eb]/30 bg-[#9334eb]/5">
              <AlertTitle className="text-sm font-semibold">
                Tips & Trick
              </AlertTitle>
              <AlertDescription className="text-sm whitespace-pre-line">
                {tips}
              </AlertDescription>
            </Alert>
          </section>
        )}
      </main>
    </div>
  );
}
