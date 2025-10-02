"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { formatRp } from "@/lib/format";

export default function OrderRow({ order }) {
  const o = order || {};
  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold truncate font-poppins">
            {o?.bank?.nama || "Bank Sampah"}
          </p>
          <p className="mt-0.5 text-[12px] text-neutral-500">
            Jadwal: {o?.schedule?.date || "-"} • {o?.schedule?.time || "-"}
          </p>
          <p className="text-[12px] text-neutral-500">
            Total: {formatRp(o?.total || 0)}
          </p>
        </div>
        <div className="flex items-center gap-2 font-poppins">
          <StatusBadge status={o.status} />
          <Link
            href={`/waste-bank/orders/${o.id}`}
            className="text-[12px] font-medium text-[#9334eb] hover:underline"
          >
            Detail
          </Link>
        </div>
      </div>
    </li>
  );
}
