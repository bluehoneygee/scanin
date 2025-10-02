"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useSelectedBank() {
  const router = useRouter();
  const [bank, setBank] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("selected-bank");
      if (!s) {
        router.replace("/waste-bank");
        return;
      }
      const parsed = JSON.parse(s);
      setBank(parsed);
      localStorage.setItem("last-used-bank", s);
      if (parsed?.wilayah)
        localStorage.setItem("wb-last-wilayah", parsed.wilayah);
    } finally {
      setHydrated(true);
    }
  }, [router]);

  return { bank, hydrated };
}
