"use client";

export default function EduCard({ title, subtitle, badgeLabel }) {
  return (
    <article className="mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 flex-none rounded-xl bg-neutral-100 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-neutral-500">{subtitle}</p>
        </div>
        {badgeLabel ? (
          <span className="rounded-full bg-[#9334eb]/15 px-2 py-1 text-[11px] font-medium text-[#4b1c80] ring-1 ring-[#9334eb]/30 dark:text-[#9334eb]">
            {badgeLabel}
          </span>
        ) : null}
      </div>
    </article>
  );
}
