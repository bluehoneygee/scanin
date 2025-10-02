"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function RowLink({
  href,
  icon,
  label,
  desc,
  prefetch = false,
  danger = false,
  rightIcon = true,
}) {
  return (
    <li className="list-none border-b border-neutral-200 last:border-b-0 dark:border-neutral-800">
      <Link
        href={href}
        prefetch={prefetch}
        className={[
          "group flex items-center justify-between px-1 py-3",
          "hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40",
          danger ? "text-red-600 dark:text-red-400" : "text-inherit",
        ].join(" ")}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="inline-flex h-5 w-5 items-center justify-center">
            {icon}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium font-poppins text-[13px]">
              {label}
            </span>
            {desc ? (
              <span className="block truncate text-[12px] text-neutral-500 dark:text-neutral-400">
                {desc}
              </span>
            ) : null}
          </span>
        </span>
        {rightIcon ? (
          <ChevronRight className="h-4 w-4 opacity-60 group-hover:opacity-80" />
        ) : null}
      </Link>
    </li>
  );
}
