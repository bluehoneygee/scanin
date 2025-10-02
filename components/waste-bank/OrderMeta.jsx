"use client";

import { CalendarDays, Clock, MapPin, User } from "lucide-react";
import { formatDateID } from "@/lib/format";

export default function OrderMeta({
  user = {},
  schedule = {},
  timeRange12h = "-",
}) {
  return (
    <ul className="mt-3 space-y-2">
      <li className="flex items-start gap-2">
        <User className="mt-0.5 h-4 w-4 text-neutral-500" />
        <span className="text-sm capitalize">{user.nama || "-"}</span>
      </li>
      <li className="flex items-start gap-2">
        <CalendarDays className="mt-0.5 h-4 w-4 text-neutral-500" />
        <span className="text-sm">{formatDateID(schedule?.date)}</span>
      </li>
      <li className="flex items-start gap-2">
        <Clock className="mt-0.5 h-4 w-4 text-neutral-500" />
        <span className="text-sm">{timeRange12h}</span>
      </li>
      <li className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 text-neutral-500" />
        <span className="text-sm whitespace-pre-wrap break-words capitalize">
          {user.alamat || "-"}
        </span>
      </li>
    </ul>
  );
}
