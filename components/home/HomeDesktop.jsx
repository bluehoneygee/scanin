"use client";

import Link from "next/link";
import HeroHeader from "@/components/home/HeroHeader";
import QuickTile from "@/components/home/QuickTile";
import EduCard from "@/components/home/EduCard";
import HistoryItem from "@/components/home/HistoryItem";

export default function HomeDesktop() {
  const history = [
    {
      title: "Botol PET 600ml",
      timestamp: "Kemarin • 14.22",
      chipLabel: "Plastik",
    },
    {
      title: "Karton Susu UHT",
      timestamp: "Kemarin • 09.10",
      chipLabel: "Karton",
    },
    {
      title: "Gelas Kaca",
      timestamp: "2 hari lalu • 11.05",
      chipLabel: "Kaca",
    },
  ];

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

            <ul className="space-y-2">
              {history.map((h, i) => (
                <HistoryItem
                  key={i}
                  title={h.title}
                  timestamp={h.timestamp}
                  chipLabel={h.chipLabel}
                />
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
