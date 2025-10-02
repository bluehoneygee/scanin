"use client";

import { formatRp } from "@/lib/format";

export default function OrderItemsList({ items = [] }) {
  if (items.length === 0) {
    return (
      <p className="mt-2 text-[13px] text-neutral-500">
        Tidak ada item tercatat.
      </p>
    );
  }

  return (
    <ul className="mt-2">
      {items.map((it, idx) => (
        <li key={`${it.id}-${idx}`}>
          <div className="py-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium truncate font-poppins text-[12px]">
                {it.nama}
              </p>
              <p className="text-[12px] text-neutral-500">
                {it.qty || 0} kg × {formatRp(it.harga || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {formatRp((Number(it.qty) || 0) * (Number(it.harga) || 0))}
              </p>
            </div>
          </div>
          {idx < items.length - 1 ? (
            <hr className="border-neutral-200 dark:border-neutral-800" />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
