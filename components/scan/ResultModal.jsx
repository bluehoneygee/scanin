"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";
import CategoryBadge from "@/components/common/CategoryBadge";

export default function ResultModal({ open, onOpenChange, result }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="text-base">Hasil Pemindaian</DialogTitle>
          <DialogDescription className="sr-only">
            Rangkuman produk, kategori, dan tips daur ulang.
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white">
              <img
                src={result?.product?.image || "/icons/product-placeholder.svg"}
                alt={result?.product?.name || "Produk"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">Produk</p>
              <h3 className="truncate text-[15px] font-semibold">
                {result?.product?.name || "—"}
              </h3>
              <p className="text-xs text-neutral-500">
                Barcode: {result?.product?.barcode || "—"}
              </p>
            </div>
            <div className="ml-auto">
              <CategoryBadge category={result?.ai?.category} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {result?.ai?.recyclable ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-700">
                  Dapat didaur ulang (cek aturan setempat)
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-rose-600" />
                <span className="text-sm text-rose-700">
                  Kemungkinan tidak dapat didaur ulang
                </span>
              </>
            )}
          </div>
          {result?.ai?.awareness && (
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              {result.ai.awareness}
            </p>
          )}
          {Array.isArray(result?.ai?.tips) && result.ai.tips.length > 0 && (
            <div className="mt-4 rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-800">
              <p className="mb-2 font-medium text-[#9334eb]">
                Tips &amp; Trick
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {result.ai.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
