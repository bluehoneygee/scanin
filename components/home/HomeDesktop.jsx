"use client";

import Link from "next/link";
import HeroHeader from "@/components/home/HeroHeader";
import QuickTile from "@/components/home/QuickTile";
import EduCard from "@/components/home/EduCard";
import HistoryItem from "@/components/home/HistoryItem";
import { useRiwayat } from "@/lib/swr-riwayat";

export default function HomeDesktop() {
  const { data, isLoading } = useRiwayat({ page: 1, limit: 3 });
  const items = data?.items || [];

  return (
    <>
      <section className="bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white">
        <div className="px-8 py-8">
          <HeroHeader name="User" points={77.25} cardNumber="7677 5588 4490" />
        </div>
      </section>
      <div className="px-8 py-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid grid-cols-3 gap-5">
            <QuickTile
              title="Promosi"
              badge="-16%"
              iconPath="/icons/promo.svg"
            />
            <QuickTile title="Peta Bank Sampah" iconPath="/icons/map-pin.svg" />
            <QuickTile
              title="Tips Daur Ulang"
              iconPath="/icons/lightbulb.svg"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-6">
          <section className="col-span-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Edukasi Minggu Ini</h2>
              <Link
                href="#"
                className="text-sm font-medium text-[#9334eb] hover:underline"
              >
                Lihat semua
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <EduCard
                title="Pilah Pouch Minyak Goreng"
                subtitle="Bilas ringan, keringkan, bungkus terpisah"
                badgeLabel="Baru"
              />
              <EduCard
                title="Karton UHT: Cara Lipat"
                subtitle="Keringkan, pipihkan, buang sedotan"
              />
            </div>
          </section>

          <section className="col-span-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Riwayat Terkini</h2>
              <Link
                href="/riwayat"
                className="text-sm font-medium text-[#9334eb] hover:underline"
              >
                Lihat semua
              </Link>
            </div>

            {isLoading && !items.length ? (
              <ul className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <li
                    key={`desk-skeleton-${i}`}
                    className="h-16 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
                  />
                ))}
              </ul>
            ) : !items.length ? (
              <p className="text-[13px] text-neutral-500">Belum ada riwayat.</p>
            ) : (
              <ul className="space-y-2">
                {items.map((it) => {
                  const name = it?.product?.name || `Produk ${it.barcode}`;
                  const timeStr = it?.createdAt
                    ? new Date(it.createdAt).toLocaleString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                      })
                    : "-";
                  const chip = it?.ai?.category || "";
                  const imageUrl = it?.product?.image || "";

                  return (
                    <HistoryItem
                      key={it.id}
                      title={name}
                      timestamp={timeStr}
                      chipLabel={chip}
                      imageUrl={imageUrl}
                    />
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
