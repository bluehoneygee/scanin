"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { bottomNavLinks } from "@/constants";

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed bottom-0 left-1/2 z-50
        w-[100vw] -ml-[50vw] -mr-[50vw]  /* full-bleed */
        pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]
        border-t border-neutral-200 bg-white/95 backdrop-blur-md
        dark:border-neutral-800 dark:bg-neutral-900/90
      "
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-5 items-center gap-1 px-3 py-2">
        {bottomNavLinks.map((item) => {
          const isActive =
            item.route === "/"
              ? pathname === "/"
              : pathname.startsWith(item.route);

          if (item.label === "Scan Produk") {
            return (
              <div key={item.route} className="col-span-1 flex justify-center">
                <Link
                  href={item.route}
                  className="inline-flex h-14 w-14 -mt-8 items-center justify-center rounded-full bg-[#9334eb] text-white shadow-lg ring-4 ring-[#9334eb]/30 active:scale-95"
                  aria-label="Scan Produk"
                >
                  <Image
                    src={item.imgURL}
                    alt={item.label}
                    width={24}
                    height={24}
                    className="invert"
                  />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.route}
              href={item.route}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px]",
                isActive
                  ? "text-[#9334eb]"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              <span
                aria-hidden
                className="mb-0.5 inline-block h-5 w-5"
                style={{
                  backgroundColor: isActive ? "#9334eb" : "#9ca3af",
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
              <span className="font-medium font-poppins">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
