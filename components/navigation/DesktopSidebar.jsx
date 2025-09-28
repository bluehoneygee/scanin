"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { bottomNavLinks } from "@/constants";

const BRAND = "#9334eb";
const INACTIVE = "#9ca3af";

export default function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-72 flex-col border-r border-neutral-200 bg-white/90 px-4 py-6 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90 lg:flex">
      <div className="mb-4 flex items-center gap-3 px-1">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ backgroundColor: `${BRAND}1A` }}
        >
          <Image src="/icons/logo.svg" alt="BuBot" width={18} height={18} />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Scanin</p>
          <p className="text-xs text-neutral-500">Scan & kelola sampah</p>
        </div>
      </div>
      <nav className="mt-2 space-y-1 overflow-y-auto pr-1">
        {bottomNavLinks.map((item) => {
          const isActive =
            item.route === "/"
              ? pathname === "/"
              : pathname.startsWith(item.route);

          if (item.label === "Scan Produk") {
            return (
              <Link
                key={item.route}
                href={item.route}
                className="group mt-2 flex items-center gap-3 rounded-xl bg-[#9334eb] px-4 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-[#9334eb]/20 hover:shadow-md"
              >
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  width={20}
                  height={20}
                  className="invert"
                />
                <span>Scan Produk</span>
              </Link>
            );
          }

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
            >
              {item.noInvert ? (
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  width={20}
                  height={20}
                />
              ) : (
                <span
                  aria-hidden
                  className="inline-block h-5 w-5"
                  style={{
                    backgroundColor: isActive ? BRAND : INACTIVE,
                    WebkitMaskImage: `url(${item.imgURL})`,
                    maskImage: `url(${item.imgURL})`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                  }}
                />
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
