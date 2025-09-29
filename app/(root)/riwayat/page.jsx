"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Trash2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryChip from "@/components/ui/CategoryChip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRiwayatController } from "@/hooks/useRiwayatController";

export default function RiwayatPage() {
  const {
    page,
    items,
    hasNext,
    error,
    isLoading,
    deletingId,
    goPage,
    handleDelete,
    refresh,
  } = useRiwayatController({ defaultLimit: 10, userId: "demo-user-1" });

  return (
    <div className="min-h-dvh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-40">
        <div className="relative left-1/2 -ml-[50vw] w-[100vw] -mr-[50vw] border-b border-neutral-200 bg-white/90 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[13px] font-medium"
            >
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="mx-auto text-sm font-semibold">Riwayat</h1>
            <span className="w-12" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-6">
        {error && (
          <section className="mb-4">
            <Alert variant="destructive">
              <AlertTitle>Gagal</AlertTitle>
              <AlertDescription className="text-sm">
                {error.message || "Terjadi kesalahan."}
              </AlertDescription>
            </Alert>
          </section>
        )}
        {isLoading && (!items || items.length === 0) ? (
          <ul className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={`skeleton-${i}`}
                className="h-20 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
              />
            ))}
          </ul>
        ) : !items || items.length === 0 ? (
          <p className="text-[13px] text-neutral-500">
            Belum ada riwayat. Pindai produk terlebih dulu ya.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li
                key={it.id}
                className="rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-neutral-100 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          className="h-10 w-10 object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div>
                      <p className="font-medium">{it.name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {it.timeStr}
                      </p>

                      {it.chip ? (
                        <div className="mt-2">
                          <CategoryChip label={it.chip} />
                        </div>
                      ) : null}

                      {it.tips?.length > 0 && (
                        <ul className="mt-2 list-disc pl-5 space-y-1">
                          {it.tips.map((t, idx) => (
                            <li
                              key={`${it.id}-tip-${idx}`}
                              className="text-[13px] leading-5"
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 px-2"
                    disabled={deletingId === it.id}
                    onClick={() => handleDelete(it.id)}
                    title="Hapus dari riwayat"
                  >
                    {deletingId === it.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RotateCw className="mr-2 h-4 w-4" />
            Segarkan
          </Button>
        </div>

        {(page > 1 || hasNext) && (
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => goPage(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
            >
              {isLoading && page > 1 ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sebelumnya
            </Button>

            <span className="text-[13px] text-neutral-500">Halaman {page}</span>

            <Button
              variant="outline"
              onClick={() => goPage(page + 1)}
              disabled={!hasNext || isLoading}
            >
              {isLoading && hasNext ? (
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
