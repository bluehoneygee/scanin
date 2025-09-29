"use client";

import { useMemo, useRef, useState } from "react";
import { digits, postJson } from "@/lib/utils";

export function useScanController() {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(false);

  // modal "OFF tidak ketemu"
  const [offModalOpen, setOffModalOpen] = useState(false);
  const [pendingBarcode, setPendingBarcode] = useState("");
  const [manualName, setManualName] = useState("");
  const [submittingName, setSubmittingName] = useState(false);

  // guard sinkron mencegah request ganda
  const inflightRef = useRef(false);
  // dedupe kode yang sama (30s)
  const lastScanRef = useRef({ code: "", t: 0 });

  async function callScan(code, { name, requireOff = true } = {}) {
    setLoading(true);
    setErrorMsg("");
    try {
      const url = `/api/scan${requireOff ? "?requireOff=1" : ""}`;
      const body = name ? { barcode: code, name } : { barcode: code };

      const { r, data } = await postJson(url, body);

      if (
        r.status === 404 &&
        (data?.code === "NEED_NAME" || data?.code === "OFF_NOT_FOUND")
      ) {
        setPendingBarcode(code);
        setManualName("");
        setOffModalOpen(true);
        return { ok: false, needName: true };
      }

      if (!r.ok || !data?.ok)
        throw new Error(data?.message || "Gagal memproses scan.");

      setResult(data);
      if (!open) setOpen(true);
      return { ok: true, needName: false };
    } catch (e) {
      setErrorMsg(e.message || "Terjadi kesalahan.");
      return { ok: false, needName: false, error: e };
    } finally {
      setLoading(false);
    }
  }

  async function callScanWithName() {
    const name = manualName.trim();
    if (!pendingBarcode || !name) return;
    if (inflightRef.current) return;

    inflightRef.current = true;
    setSubmittingName(true);
    setLocked(true);
    setErrorMsg("");
    try {
      const res = await callScan(pendingBarcode, { name, requireOff: false });
      if (res?.ok) {
        setOffModalOpen(false);
        if (!open) setOpen(true);
        setBarcode(pendingBarcode);
      }
    } finally {
      inflightRef.current = false;
      setLocked(false);
      setSubmittingName(false);
    }
  }

  const onDetected = useMemo(() => {
    return async (raw) => {
      const code = digits(raw);
      if (!code) return;

      // blokir kalau ada request jalan / modal / loading / lock
      if (inflightRef.current || open || offModalOpen || loading || locked)
        return;

      // dedupe 30s untuk kode sama
      const now = Date.now();
      if (
        lastScanRef.current.code === code &&
        now - lastScanRef.current.t < 30000
      )
        return;

      inflightRef.current = true; // kunci sinkron
      setLocked(true); // pause kamera cepat
      setBarcode(code);
      lastScanRef.current = { code, t: now };

      try {
        await callScan(code, { requireOff: true });
      } finally {
        inflightRef.current = false;
        setLocked(false);
      }
    };
  }, [open, offModalOpen, loading, locked]);

  const handleScanButton = async () => {
    const code = digits(barcode.trim());
    if (!code) return alert("Masukkan/scan barcode dulu ya.");
    if (inflightRef.current) return;

    inflightRef.current = true;
    setLocked(true);
    try {
      await callScan(code, { requireOff: true });
    } finally {
      inflightRef.current = false;
      setLocked(false);
    }
  };

  const handleCheckManual = handleScanButton;

  // derived: kamera pause
  const paused =
    open || offModalOpen || loading || locked || inflightRef.current;

  return {
    // state
    barcode,
    loading,
    locked,
    errorMsg,
    result,
    open,

    offModalOpen,
    pendingBarcode,
    manualName,
    submittingName,

    // setters
    setBarcode,
    setOpen,
    setOffModalOpen,
    setManualName,

    // actions
    onDetected,
    callScanWithName,
    handleScanButton,
    handleCheckManual,

    // derived
    paused,
    inflightRef, // opsional kalau mau dibaca di UI (disable tombol)
  };
}
