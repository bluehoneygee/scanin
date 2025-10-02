"use client";

import Link from "next/link";
import HeroHeader from "@/components/home/HeroHeader";
import QuickTile from "@/components/home/QuickTile";
import { useAuthUser, getAuthUserId } from "@/lib/use-auth-user";
import ROUTES from "@/constants/routes";
import OrdersPreview from "@/components/home/OrdersPreview";
import RiwayatPreview from "@/components/home/RiwayatPreview";

export default function HomeMobile() {
  const user = useAuthUser();
  const userId = getAuthUserId(user);

  const displayName = user?.name || user?.username || user?.email || "User";
  const points = Number.isFinite(Number(user?.points))
    ? Number(user?.points)
    : 0;

  return (
    <div className="min-h-dvh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <section className="sticky top-0 z-40">
        <div className="relative left-1/2 w-[100vw] -ml-[50vw] -mr-[50vw] rounded-b-3xl bg-gradient-to-br from-[#9334eb] to-[#6b21a8] pb-6 pt-10 text-neutral-50 shadow-md md:left-0 md:ml-0 md:mr-0 md:w-full md:rounded-b-2xl">
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <HeroHeader name={displayName} points={points} />
          </div>
        </div>
      </section>

      <main className="relative left-1/2 w-[100vw] -ml-[50vw] -mr-[50vw] pb-28 md:pb-8">
        <section className="mt-4 px-4 md:px-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            <QuickTile
              title="Daftar Bank Sampah"
              iconPath="/icons/map-pin.svg"
              href={ROUTES.WASTE_BANK}
            />
            <QuickTile
              title="Tips Daur Ulang"
              iconPath="/icons/lightbulb.svg"
              href={ROUTES.SCAN_PRODUCT}
            />
          </div>
        </section>

        <OrdersPreview
          userId={userId}
          limit={3}
          className="mt-5 px-4 md:px-6"
          title="Penjemputan Terbaru"
          showHeader
        />

        <section className="mt-4 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <h2 className="font-poppins text-sm font-semibold md:text-base">
              Riwayat Terkini
            </h2>
            <Link
              href="/riwayat"
              prefetch={false}
              className="font-grotesk text-xs font-medium text-[#9334eb] hover:underline md:text-sm"
            >
              Lihat semua
            </Link>
          </div>

          {!userId ? (
            <p className="font-grotesk mt-2 text-[13px] text-neutral-500">
              Masuk untuk melihat riwayatmu.
            </p>
          ) : (
            <RiwayatPreview userId={userId} limit={3} />
          )}
        </section>
      </main>
    </div>
  );
}
