"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Loader2, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ResultModal from "@/components/scan/ResultModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useScanController } from "@/hooks/useScanController";

const BRAND = "#9334eb";
const CameraScanner = dynamic(() => import("@/components/scan/CameraScanner"), {
  ssr: false,
});

export default function ScanProductPage() {
  const {
    barcode,
    loading,
    errorMsg,
    result,
    open,
    offModalOpen,
    pendingBarcode,
    manualName,
    submittingName,

    setBarcode,
    setOpen,
    setOffModalOpen,
    setManualName,

    onDetected,
    callScanWithName,
    handleScanButton,
    handleCheckManual,

    paused,
    inflightRef,
  } = useScanController();

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
            <div className="relative w-full overflow-hidden rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800">
              <CameraScanner
                className="w-full max-h-[420px] md:max-h-[480px] aspect-[3/4] bg-black"
                facingMode="environment"
                paused={paused}
                cooldownMs={2500}
                dedupeWindowMs={30000}
                onDetected={onDetected}
                onError={(err) =>
                  console.error(err?.message || "Kamera tidak tersedia.")
                }
              />
            </div>

            <Button
              onClick={handleScanButton}
              disabled={loading || !barcode || inflightRef.current}
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

            <div className="mt-4 flex w-full items-center gap-3">
              <Input
                placeholder="Masukkan kode barcode"
                value={barcode}
                onChange={(e) =>
                  setBarcode((e.target.value || "").replace(/\D/g, ""))
                }
                className="h-12 rounded-2xl focus-visible:ring-2 focus-visible:ring-[#9334eb]"
                inputMode="numeric"
              />
              <Button
                variant="outline"
                onClick={handleCheckManual}
                disabled={loading || !barcode || inflightRef.current}
                className="h-12 rounded-2xl px-5 font-semibold border-[#9334eb] text-[#9334eb] hover:bg-[#9334eb]/5 disabled:opacity-60"
              >
                Cek
              </Button>
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

      <Dialog open={offModalOpen} onOpenChange={setOffModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Produk tidak ditemukan</DialogTitle>
            <DialogDescription>
              Tidak ada di Open Food Facts. Masukkan nama produk agar asisten
              bisa memberi kategori & tips.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-neutral-500">
              Barcode: <span className="font-mono">{pendingBarcode}</span>
            </p>
            <Input
              autoFocus
              placeholder="Contoh: Gillette Venus razor"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOffModalOpen(false)}
                disabled={submittingName}
              >
                Batal
              </Button>
              <Button
                onClick={callScanWithName}
                disabled={
                  !manualName.trim() || submittingName || inflightRef.current
                }
                className="bg-[#9334eb] hover:bg-[#7e2cd0] text-white"
              >
                {submittingName ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  "Gunakan AI"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {result && (
        <ResultModal
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setTimeout(() => {}, 0);
            }
          }}
          result={result}
        />
      )}
    </>
  );
}
