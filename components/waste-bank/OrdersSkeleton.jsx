"use client";

export default function OrdersSkeleton({ rows = 6 }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={`sk-${i}`}
          className="h-20 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
        />
      ))}
    </ul>
  );
}
