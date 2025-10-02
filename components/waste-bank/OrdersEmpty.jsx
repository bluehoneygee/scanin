"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrdersEmpty() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
      Belum ada permintaan penjemputan.
      <div className="mt-3">
        <Link href="/waste-bank">
          <Button className="rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white">
            Buat Permintaan Penjemputan
          </Button>
        </Link>
      </div>
    </div>
  );
}
