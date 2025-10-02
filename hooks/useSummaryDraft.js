"use client";

import { useEffect, useMemo, useState } from "react";
import { readDraft, writeDraftMerge } from "@/lib/pickup-draft";
import { todayISO } from "@/lib/format";

export default function useSummaryDraft() {
  const [qty, setQty] = useState({});
  const [itemsMaster, setItemsMaster] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [loadErr, setLoadErr] = useState("");

  const [nama, setNama] = useState("");
  const [telp, setTelp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("08:00");

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const d = readDraft();
    if (!d || d.qty == null) {
      setHydrated(true);
      return;
    }
    setQty(d.qty || {});
    setItemsMaster(d.itemsMaster || []);
    setDate(d.date || todayISO());
    setTime(d.time || "08:00");
    setNama(d.nama || "");
    setTelp(d.telp || "");
    setAlamat(d.alamat || "");
    setCatatan(d.catatan || "");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (itemsMaster && itemsMaster.length) return;
    let alive = true;
    (async () => {
      try {
        setLoadingMaster(true);
        setLoadErr("");
        const r = await fetch("/api/waste-items", { cache: "no-store" });
        const data = await r.json().catch(() => ({}));
        const arr = data?.items ?? data ?? [];
        if (!Array.isArray(arr)) throw new Error("Gagal memuat items");
        const normalized = arr.map((it) => ({
          id: String(it.id),
          nama: String(it.name ?? it.nama ?? "").trim(),
          harga: Number(it.price ?? it.harga ?? 0),
        }));
        if (!alive) return;
        setItemsMaster(normalized);
        writeDraftMerge({
          itemsMaster: normalized,
          itemsMasterUpdatedAt: Date.now(),
        });
      } catch (e) {
        if (alive) setLoadErr(e.message || "Terjadi kesalahan.");
      } finally {
        if (alive) setLoadingMaster(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [itemsMaster]);

  useEffect(() => {
    if (!hydrated) return;
    writeDraftMerge({ qty, date, time, nama, telp, alamat, catatan });
  }, [qty, date, time, nama, telp, alamat, catatan, hydrated]);

  const selectedList = useMemo(
    () =>
      (itemsMaster || [])
        .map((it) => ({ ...it, qty: parseFloat(qty[it.id] || 0) || 0 }))
        .filter((it) => it.qty > 0),
    [itemsMaster, qty]
  );

  const total = useMemo(
    () => selectedList.reduce((s, it) => s + it.qty * it.harga, 0),
    [selectedList]
  );

  return {
    qty,
    setQty,
    itemsMaster,
    setItemsMaster,
    loadingMaster,
    loadErr,
    nama,
    setNama,
    telp,
    setTelp,
    alamat,
    setAlamat,
    catatan,
    setCatatan,
    date,
    setDate,
    time,
    setTime,
    hydrated,

    selectedList,
    total,
  };
}
