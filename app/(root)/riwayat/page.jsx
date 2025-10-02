"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Trash2, RotateCw } from "lucide-react";
import CategoryChip from "@/components/ui/CategoryChip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRiwayatController } from "@/hooks/useRiwayatController";
import { useAuthUser, getAuthUserId } from "@/lib/use-auth-user";

export default function RiwayatPage() {
  const auth = useAuthUser();
  const userId = getAuthUserId(auth);

  const {
    page,
    items,
    hasNext,
    error,
    isLoading,
    isValidating,
    isRefreshing,
    deletingId,
    goPage,
    handleDelete,
    refresh,
  } = useRiwayatController({ defaultLimit: 10, userId });

  return (
    <div className="min-h-dvh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-40">
        <div className="lg:hidden relative left-1/2 -ml-[50vw] w-[100vw] -mr-[50vw] border-b border-neutral-200 bg-white/90 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[13px] font-medium"
            >
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="mx-auto text-sm font-semibold font-poppins">
              Riwayat
            </h1>
            <span className="w-12" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-6">
        {!userId && (
          <section className="mb-4">
            <Alert>
              <AlertTitle>Butuh login</AlertTitle>
              <AlertDescription className="text-sm">
                Silakan masuk terlebih dulu agar riwayatmu bisa ditampilkan.
              </AlertDescription>
            </Alert>
          </section>
        )}

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
          <p className="text-[13px] text-neutral-500 font-grotesk">
            Belum ada riwayat. Scan produk terlebih dulu yaa.
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
                      <p className="font-medium font-poppins">{it.name}</p>
                      <p className="text-[11px] text-neutral-500 font-grotesk">
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
                              className="text-[13px] leading-5 font-grotesk"
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <button
                    className="inline-flex h-8 items-center rounded-md border border-red-600 px-2 text-red-600 hover:bg-red-600/10 disabled:opacity-60"
                    disabled={
                      deletingId === it.id || isRefreshing || isValidating
                    }
                    onClick={() => handleDelete(it.id)}
                    title="Hapus dari riwayat"
                  >
                    {deletingId === it.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={refresh}
            disabled={!userId || isLoading || isValidating || isRefreshing}
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-60"
          >
            {isRefreshing || isValidating ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyegarkan...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                Segarkan
              </span>
            )}
          </button>
        </div>

        {(page > 1 || hasNext) && (
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => goPage(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading || isValidating || isRefreshing}
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-60"
            >
              {isLoading && page > 1 ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
                </span>
              ) : (
                "Sebelumnya"
              )}
            </button>

            <span className="text-[13px] text-neutral-500">Halaman {page}</span>

            <button
              onClick={() => goPage(page + 1)}
              disabled={!hasNext || isLoading || isValidating || isRefreshing}
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-60"
            >
              {isLoading && hasNext ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
                </span>
              ) : (
                "Berikutnya"
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
