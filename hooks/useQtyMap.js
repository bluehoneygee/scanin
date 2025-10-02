"use client";

import { useState } from "react";

export default function useQtyMap(initial = {}) {
  const [qty, setQty] = useState(initial || {});

  const inc = (id, step = 0.5) =>
    setQty((p) => ({
      ...p,
      [id]: +((parseFloat(p[id] || 0) || 0) + step).toFixed(1),
    }));

  const dec = (id, step = 0.5) =>
    setQty((p) => {
      const v = (parseFloat(p[id] || 0) || 0) - step;
      return { ...p, [id]: +Math.max(0, v).toFixed(1) };
    });

  const onInput = (id, val) => {
    const raw = String(val || "").replace(",", ".");
    const num = Math.max(0, parseFloat(raw) || 0);
    setQty((p) => ({ ...p, [id]: +num.toFixed(1) }));
  };

  const resetAll = () => setQty({});

  return { qty, setQty, inc, dec, onInput, resetAll };
}
