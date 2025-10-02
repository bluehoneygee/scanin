"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuthUser } from "@/lib/use-auth-user";
import { useOrdersList } from "@/hooks/useOrdersList";
import OrdersSkeleton from "@/components/waste-bank/OrdersSkeleton";
import OrdersEmpty from "@/components/waste-bank/OrdersEmpty";
import OrderRow from "@/components/waste-bank/OrderRow";

export default function OrdersPage() {
  const auth = useAuthUser();
  const userId =
    auth?.id || auth?.userId || auth?.username || auth?.email || "";

  const { orders, loading, err } = useOrdersList(userId);
  const empty = !loading && orders.length === 0;

  return (
    <div className="min-h-dvh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-40">
        <div className="lg:hidden relative left-1/2 -ml-[50vw] w-[100vw] -mr-[50vw] border-b border-neutral-200 bg-white/90 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
            <Link
              href="/waste-bank"
              className="inline-flex items-center gap-1 text-[13px] font-medium"
            >
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="mx-auto text-sm font-semibold font-poppins">
              Daftar Penjemputan
            </h1>
            <span className="w-12" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-6">
        {!userId && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[13px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            Kamu belum login. Masuk dulu untuk melihat riwayat penjemputan.
          </div>
        )}

        {err && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {err}
          </p>
        )}

        {loading ? (
          <OrdersSkeleton />
        ) : empty ? (
          <OrdersEmpty />
        ) : (
          <ul className="space-y-3">
            {orders
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
          </ul>
        )}
      </main>
    </div>
  );
}
