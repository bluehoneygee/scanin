"use client";

import { getCategoryClass } from "@/constants/categories";
import { cn } from "@/lib/utils";

export default function CategoryChip({ label }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-1 text-[11px] font-medium ring-1",
        getCategoryClass(label)
      )}
    >
      {label}
    </span>
  );
}
