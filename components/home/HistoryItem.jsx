"use client";

import CategoryChip from "@/components/ui/CategoryChip";

export default function HistoryItem({ title, timestamp, chipLabel, imageUrl }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-10 w-10 object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : null}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-[11px] text-neutral-500">{timestamp}</p>
        </div>
      </div>
      {chipLabel ? <CategoryChip label={chipLabel} /> : null}
    </li>
  );
}
