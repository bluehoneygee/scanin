export const dynamic = "force-dynamic";

import { Suspense } from "react";
import RiwayatClient from "./_client";

export default async function RiwayatPage({ searchParams }) {
  const sp = await searchParams; // Next 15: wajib await
  const initialPage = Number(sp?.page ?? 1);
  const initialLimit = Number(sp?.limit ?? 10);

  return (
    <Suspense fallback={<div className="p-6">Memuat riwayat…</div>}>
      <RiwayatClient initialPage={initialPage} initialLimit={initialLimit} />
    </Suspense>
  );
}
