"use client";

import { getCategoryBadgeClasses } from "@/constants/categories";
import { cn } from "@/lib/utils";

export default function CategoryChip({ label }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-1 text-[11px] font-medium ring-1",
        getCategoryBadgeClasses(label)
      )}
    >
      {label}
    </span>
  );
}
