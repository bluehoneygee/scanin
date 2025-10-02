"use client";

import { formatRp as rp } from "@/lib/format";
import { Loader2 } from "lucide-react";

export default function SelectedItemsList({ selectedList, loading, error }) {
  if (loading && (!selectedList || selectedList.length === 0)) {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuat item…
      </p>
    );
  }
  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }
  if (!selectedList || selectedList.length === 0) {
    return (
      <p className="text-[13px] text-neutral-500">
        Belum ada item. Silakan pilih di halaman sebelumnya.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {selectedList.map((it) => (
        <li
          key={it.id}
          className="py-2 flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="font-medium truncate font-poppins text-[12px]">
              {it.nama}
            </p>
            <p className="text-[12px] text-neutral-500">
              {it.qty} kg × {rp(it.harga)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold font-poppins">
              {rp(it.qty * it.harga)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
