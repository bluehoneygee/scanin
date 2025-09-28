"use client";

import { QuickTile, EduCard, HistoryItem, HeroHeader } from "@/components/home";

export default function HomeMobile() {
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
      title: "Sachet Kopi",
      timestamp: "2 hari lalu • 17.05",
      chipLabel: "Plastik",
    },
  ];

  return (
    <div className="min-h-dvh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <section className="sticky top-0 z-40">
        <div
          className="
            relative w-[100vw] left-1/2 -ml-[50vw] -mr-[50vw]
            rounded-b-3xl bg-gradient-to-br from-[#9334eb] to-[#6b21a8]
            pb-6 pt-10 text-neutral-50 shadow-md
            md:left-0 md:ml-0 md:mr-0 md:w-full md:rounded-b-2xl
          "
        >
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <HeroHeader
              name="User"
              points={77.25}
              cardNumber="7677 5588 4490"
            />
          </div>
        </div>
      </section>
      <main className="pb-28 md:pb-8  relative w-[100vw] left-1/2 -ml-[50vw] -mr-[50vw]">
        <section className="mt-4 px-4 md:px-6 ">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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
        </section>
        <section className="mt-4 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-base font-semibold">
              Edukasi Minggu Ini
            </h2>
            <button className="text-xs md:text-sm font-medium text-[#9334eb] hover:underline dark:text-[#9334eb]">
              Lihat semua
            </button>
          </div>
          <div className="mt-2 md:mt-3">
            <EduCard
              title="Pilah Pouch Minyak Goreng"
              subtitle="Tips: bilas ringan, keringkan, masuk plastik daur ulang"
              badgeLabel="Baru"
            />
          </div>
        </section>
        <section className="mt-4 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-base font-semibold">
              Riwayat Terkini
            </h2>
            <button className="text-xs md:text-sm font-medium text-[#9334eb] hover:underline dark:text-[#9334eb]">
              Lihat semua
            </button>
          </div>
          <ul className="mt-2 space-y-2">
            {history.map((item, i) => (
              <HistoryItem
                key={i}
                title={item.title}
                timestamp={item.timestamp}
                chipLabel={item.chipLabel}
              />
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
