"use client";

import { Badge } from "@/components/ui/badge";
import { getCategoryBadgeClasses } from "@/constants/categories";

export default function CategoryBadge({ category }) {
  return (
    <Badge variant="outline" className={getCategoryBadgeClasses(category)}>
      {category || "—"}
    </Badge>
  );
}
