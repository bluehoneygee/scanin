"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { formatRp as rp } from "@/lib/format";

function ItemRow({ it, q, onDec, onInc, onInput }) {
  const subtotal = q * (it.price || 0);
  return (
    <li className="py-2 sm:py-3">
      <div className="grid items-center gap-2 sm:gap-3 grid-cols-[minmax(0,1fr)_104px_94px] sm:grid-cols-[minmax(0,1fr)_160px_140px]">
        <div className="min-w-0">
          <p className="font-medium leading-5 truncate text-[11px]">
            {it.name}
          </p>
          <p className="text-[11px] sm:text-[12px] text-neutral-500">
            {rp(it.price)} / kg
          </p>
        </div>

        <div className="justify-self-end">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
              onClick={() => onDec(it.id)}
              aria-label={`Kurangi ${it.name}`}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <input
              inputMode="decimal"
              step="0.5"
              min="0"
              value={q}
              onChange={(e) => onInput(it.id, e.target.value)}
              className="h-8 w-[56px] sm:h-9 sm:w-[72px] text-center rounded-lg border border-neutral-200 bg-transparent text-[13px] sm:text-sm outline-none focus:ring-2 focus:ring-[#9334eb] dark:border-neutral-800"
            />
            <Button
              type="button"
              className="h-8 w-8 p-0 sm:h-9 sm:w-9 bg-[#9334eb] hover:bg-[#7e2cd0] text-white"
              onClick={() => onInc(it.id)}
              aria-label={`Tambah ${it.name}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="justify-self-end text-right">
          <p className="text-sm font-semibold">{rp(subtotal)}</p>
          <p className="text-[11px] text-neutral-500">{q} kg</p>
        </div>
      </div>
    </li>
  );
}

export default function ItemsList({
  items,
  qty,
  onInc,
  onDec,
  onInput,
  loading,
  error,
}) {
  if (loading) {
    return (
      <ul className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <li
            key={`sk-${i}`}
            className="h-14 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800"
          />
        ))}
      </ul>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
        {error}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 p-4 text-center text-sm text-neutral-500 dark:border-neutral-800">
        Belum ada item.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {items.map((it) => (
        <ItemRow
          key={it.id}
          it={it}
          q={parseFloat(qty[it.id] || 0) || 0}
          onDec={onDec}
          onInc={onInc}
          onInput={onInput}
        />
      ))}
    </ul>
  );
}
