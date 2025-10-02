"use client";

import { UserRound, ClipboardList, LogOut } from "lucide-react";
import { useMenuModel } from "@/hooks/useMenuModel";
import RowLink from "@/components/navigation/Rowlink";

export default function MenuPage() {
  const {
    userId,
    displayName,
    avatarFallback,
    profileHref,
    ordersHref,
    handleLogout,
  } = useMenuModel();

  return (
    <main className="min-h-dvh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-6 pb-[calc(env(safe-area-inset-bottom)+72px)]">
        <header className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#9334eb] to-[#6b21a8] text-white text-sm font-semibold">
            {avatarFallback}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{displayName}</p>
            <p className="truncate text-[12px] text-neutral-500 dark:text-neutral-400">
              {userId ? "Sedang masuk" : "Belum masuk"}
            </p>
          </div>
        </header>

        <section>
          <ul className="list-none divide-y divide-transparent">
            <RowLink
              href={profileHref}
              label="Profil"
              desc="Lihat & kelola informasi akun"
              icon={<UserRound className="h-5 w-5" />}
            />
            <RowLink
              href={ordersHref}
              label="Daftar Penjemputan"
              desc="Semua permintaan penjemputanmu"
              icon={<ClipboardList className="h-5 w-5" />}
            />
          </ul>
        </section>
        <section className="mt-auto pt-2 ">
          <ul className="list-none divide-y divide-transparent">
            {userId ? (
              <li className="lg:hidden list-none border-b border-neutral-200 last:border-b-0 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="group flex w-full items-center justify-between bg-transparent px-1 py-3 text-left text-red-600 hover:bg-neutral-100/60 dark:text-red-400 dark:hover:bg-neutral-800/40"
                >
                  <span className="flex items-center gap-3">
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Keluar</span>
                  </span>
                </button>
              </li>
            ) : (
              <RowLink
                href="/sign-in?next=%2F"
                label="Masuk / Daftar"
                desc="Akses fitur lengkap"
                icon={<UserRound className="h-5 w-5" />}
              />
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}
