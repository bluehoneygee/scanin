"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <main className="min-h-dvh bg-neutral-50 px-4 md:px-6 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-xl font-semibold">Pesanan Tidak Ditemukan</h1>
        <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-300">
          Pesanan tidak ditemukan atau sudah dihapus.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:hidden">
          <Link href="/waste-bank/orders">
            <Button className="w-full rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white">
              Lihat Semua Penjemputan
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full rounded-[18px]">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
