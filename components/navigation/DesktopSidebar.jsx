"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { bottomNavLinks } from "@/constants";
import {
  useAuthUser,
  getAuthUserId,
  clearAuthUserLocal,
} from "@/lib/use-auth-user";

const BRAND = "#9334eb";
const INACTIVE = "#9ca3af";

function nextify(target) {
  return `/sign-in?next=${encodeURIComponent(target || "/")}`;
}

function MaskIcon({ src, active }) {
  return (
    <span
      aria-hidden
      className="inline-block h-5 w-5"
      style={{
        backgroundColor: active ? BRAND : INACTIVE,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthUser();
  const userId = getAuthUserId(user);

  const primaryLinks = bottomNavLinks.filter((l) => l.route !== "/menu");

  const profileRoute = "/profile/me";
  const ordersRoute = "/waste-bank/orders";
  const accountLinks = [
    {
      imgURL: "/icons/user.svg",
      route: profileRoute,
      href: userId ? profileRoute : nextify(profileRoute),
      label: "Profil",
    },
    {
      imgURL: "/icons/list.svg",
      route: ordersRoute,
      href: userId ? ordersRoute : nextify(ordersRoute),
      label: "Daftar Penjemputan",
    },
  ];

  function handleLogout(e) {
    e.preventDefault();
    clearAuthUserLocal();
    router.replace("/sign-in?justLoggedOut=1");
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-72 flex-col border-r border-neutral-200 bg-white/90 px-4 py-6 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90 lg:flex">
      <div className="mb-4 flex items-center gap-3 px-1">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ backgroundColor: `${BRAND}1A` }}
        >
          <Image
            src="/icons/logo2.png"
            alt="Logo Scanin"
            width={18}
            height={18}
          />
        </div>
        <div>
          <p className="font-poppins text-sm font-bold leading-tight">Scanin</p>
          <p className="font-grotesk text-xs text-neutral-500">
            Scan & kelola sampah
          </p>
        </div>
      </div>

      <div className="px-1 pb-1 text-[11px] uppercase tracking-wide text-neutral-400">
        Utama
      </div>
      <nav className="space-y-1 overflow-y-auto pr-1">
        {primaryLinks.map((item) => {
          const isActive =
            item.route === "/"
              ? pathname === "/"
              : pathname.startsWith(item.route);

          return (
            <Link
              key={item.route}
              href={item.route}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm",
                isActive
                  ? "bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                  : "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-50"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <MaskIcon src={item.imgURL} active={isActive} />
              <span className="font-poppins">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 px-1 pb-1 text-[11px] uppercase tracking-wide text-neutral-400">
        Akun
      </div>
      <nav className="space-y-1 overflow-y-auto pr-1">
        {accountLinks.map((item) => {
          const isActive = pathname.startsWith(item.route);
          return (
            <Link
              key={item.route}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm",
                isActive
                  ? "bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                  : "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-50"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <MaskIcon src={item.imgURL} active={isActive} />
              <span className="font-poppins">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        {userId ? (
          <button
            onClick={handleLogout}
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm",
              "text-red-600 hover:bg-neutral-100 dark:text-red-400 dark:hover:bg-neutral-800/80"
            )}
            aria-label="Keluar"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-poppins font-semibold">Keluar</span>
          </button>
        ) : (
          <Link
            href={nextify("/")}
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm",
              "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-50"
            )}
          >
            <UserRound className="h-5 w-5" />
            <span className="font-poppins">Masuk / Daftar</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
