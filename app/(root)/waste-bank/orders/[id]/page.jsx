"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRp } from "@/lib/format";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import OrderMeta from "@/components/waste-bank/OrderMeta";
import OrderItemsList from "@/components/waste-bank/OrderItemsList";
import OrderLoading from "@/components/waste-bank/OrderLoading";
import OrderNotFound from "@/components/waste-bank/OrderNotFound";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { loading, notFound, order, items, total, timeRange12h } =
    useOrderDetail(id);

  if (loading) return <OrderLoading />;
  if (notFound) return <OrderNotFound />;
  if (!order) return null;

  const user = order.user || {};

  return (
    <main className="min-h-dvh bg-neutral-50 px-4 md:px-6 py-8 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#9334eb]" />
          <h1 className="text-xl font-semibold font-poppins">
            Penjadwalan Berhasil!
          </h1>
        </div>
        <p className="mt-1 text-[13px] text-neutral-700 dark:text-neutral-300">
          Terima kasih telah berkontribusi untuk bumi yang lebih bersih.
        </p>
        <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
        <p className="text-sm">
          <span className="text-neutral-500">ID Penjemputan:</span>{" "}
          <span className="font-mono font-semibold">#{order.id}</span>
        </p>

        <OrderMeta
          user={user}
          schedule={order.schedule}
          timeRange12h={timeRange12h}
        />

        <hr className="my-6 border-neutral-200 dark:border-neutral-800" />

        <h2 className="text-sm font-semibold font-poppins">Daftar Item</h2>
        <OrderItemsList items={items} />

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[12px] text-neutral-500">Perkiraan total</p>
          <p className="text-base font-semibold">{formatRp(total)}</p>
        </div>
        <p className="mt-1 text-[12px] text-neutral-500">
          Total bersifat perkiraan. Penimbangan dilakukan saat penjemputan.
        </p>
        <hr className="my-6 border-neutral-200 dark:border-neutral-800" />

        <h2 className="text-sm font-semibold font-poppins">
          Instruksi Penjemputan
        </h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300">
          <li>Item harus bersih dan dipilah.</li>
          <li>Letakkan item dalam kantong atau wadah yang jelas.</li>
        </ul>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden font-poppins">
          <Link href="/waste-bank/orders">
            <Button className="w-full rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white text-[11px]">
              Lihat Semua Penjemputan
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full rounded-[18px] text-[11px]"
            >
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
