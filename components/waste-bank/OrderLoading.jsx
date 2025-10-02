"use client";

export default function OrderLoading() {
  return (
    <main className="min-h-dvh bg-neutral-50 px-4 md:px-6 py-8 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-5 w-56 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="h-4 w-72 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
        <div className="h-4 w-64 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="h-24 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
    </main>
  );
}
