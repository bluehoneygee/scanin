"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Scan } from "lucide-react";
import ResultModal from "@/components/scan/ResultModal";

const BRAND = "#9334eb";

function sanitizeDigits(s) {
  return s.replace(/\D/g, "");
}
function validateBarcode(code) {
  if (!code) return "Barcode wajib diisi.";
  if (!/^\d+$/.test(code)) return "Barcode hanya boleh angka.";
  if (code.length < 8 || code.length > 14)
    return "Panjang barcode harus 8–14 digit.";
  return "";
}

export default function ScanProductPage() {
  const [barcode, setBarcode] = useState("");
  const [barcodeErr, setBarcodeErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(false);

  async function callScan(code) {
    setLoading(true);
    setErrorMsg("");
    setResult(null);
    try {
      const r = await fetch("/api/scan?requireOff=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: code }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.ok) {
        const msg =
          data?.message ||
          (r.status === 404
            ? "Produk tidak ditemukan di Open Food Facts."
            : "Gagal memproses scan.");
        throw new Error(msg);
      }
      setResult(data);
      setOpen(true);
    } catch (e) {
      setErrorMsg(e.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  const handleScan = async () => {
    const code = sanitizeDigits(barcode.trim());
    const err = validateBarcode(code);
    setBarcode(code);
    setBarcodeErr(err);
    if (err) return;
    await callScan(code);
  };

  const handleCheckManual = async () => {
    const code = sanitizeDigits(barcode.trim());
    const err = validateBarcode(code);
    setBarcode(code);
    setBarcodeErr(err);
    if (err) return;
    await callScan(code);
  };

  return (
    <>
      <div className="min-h-dvh w-full overflow-x-hidden bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        <header className="sticky top-0 z-40">
          <div className="relative left-1/2 -ml-[50vw] w-[100vw] -mr-[50vw] border-b border-neutral-200 bg-white/90 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
            <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-[13px] font-medium"
                style={{ color: BRAND }}
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
              disabled={loading || !!barcodeErr || !barcode}
              className="mt-6 h-14 w-full rounded-[22px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white text-base font-semibold shadow-md hover:brightness-95 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Memproses...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Scan className="h-5 w-5" /> Scan &amp; Go
                </span>
              )}
            </Button>
            <div className="mt-4 w-full">
              <div className="flex w-full items-center gap-3">
                <Input
                  placeholder="Hanya angka, 8–14 digit (EAN-8/UPC/EAN-13)"
                  value={barcode}
                  onChange={(e) => {
                    const val = sanitizeDigits(e.target.value);
                    setBarcode(val);
                    if (barcodeErr) setBarcodeErr(validateBarcode(val));
                  }}
                  onBlur={() => setBarcodeErr(validateBarcode(barcode))}
                  className={`h-12 rounded-2xl focus-visible:ring-2 ${
                    barcodeErr
                      ? "focus-visible:ring-rose-500 ring-rose-500"
                      : "focus-visible:ring-[#9334eb]"
                  }`}
                  inputMode="numeric"
                />

                <Button
                  variant="outline"
                  onClick={handleCheckManual}
                  disabled={loading || !!barcodeErr || !barcode}
                  className="h-12 rounded-2xl px-5 font-semibold border-[#9334eb] text-[#9334eb] hover:bg-[#9334eb]/5 disabled:opacity-60"
                >
                  Cek
                </Button>
              </div>
              {barcodeErr ? (
                <p className="mt-1 text-xs text-rose-600">{barcodeErr}</p>
              ) : null}
            </div>

            <p className="mt-3 text-center text-[13px] leading-5 text-neutral-500">
              Arahkan kamera ke barcode, atau masukkan kode lalu tekan{" "}
              <span className="font-semibold">Cek</span>.
            </p>
          </section>
          {errorMsg && (
            <section className="mt-4">
              <Alert variant="destructive">
                <AlertTitle>Gagal</AlertTitle>
                <AlertDescription className="text-sm">
                  {errorMsg}
                </AlertDescription>
              </Alert>
            </section>
          )}
        </main>
      </div>
      {result && (
        <ResultModal open={open} onOpenChange={setOpen} result={result} />
      )}
    </>
  );
}
