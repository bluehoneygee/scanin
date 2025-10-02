"use client";

import Link from "next/link";
import HeroHeader from "@/components/home/HeroHeader";
import QuickTile from "@/components/home/QuickTile";
import ROUTES from "@/constants/routes";
import { useAuthUser, getAuthUserId } from "@/lib/use-auth-user";
import OrdersPreview from "@/components/home/OrdersPreview";
import RiwayatPreview from "@/components/home/RiwayatPreview";

export default function HomeDesktop() {
  const user = useAuthUser();
  const userId = getAuthUserId(user);

  const displayName = user?.name || user?.username || user?.email || "User";
  const points = Number.isFinite(Number(user?.points))
    ? Number(user?.points)
    : 0;

  return (
    <>
      <section className="bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white">
        <div className="px-8 py-8">
          <HeroHeader name={displayName} points={points} />
        </div>
      </section>

      <div className="px-8 py-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid grid-cols-3 gap-5">
            <QuickTile
              title="Peta Bank Sampah"
              iconPath="/icons/map-pin.svg"
              href={ROUTES.WASTE_BANK}
            />
            <QuickTile
              title="Tips Daur Ulang"
              iconPath="/icons/lightbulb.svg"
              href={ROUTES.SCAN_PRODUCT}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <OrdersPreview
              userId={userId}
              limit={3}
              className="mt-5 px-4 md:px-6"
              title="Penjemputan Terbaru"
              showHeader
            />
          </div>
          <section className="col-span-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold font-poppins">
                Riwayat Terkini
              </h2>
              <Link
                href="/riwayat"
                prefetch={false}
                className="text-sm font-medium text-[#9334eb] hover:underline font-grotesk"
              >
                Lihat semua
              </Link>
            </div>

            {!userId ? (
              <p className="text-[13px] text-neutral-500">
                Masuk untuk melihat riwayatmu.
              </p>
            ) : (
              <RiwayatPreview userId={userId} limit={3} />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
