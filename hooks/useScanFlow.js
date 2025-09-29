"use client";

import { useCallback, useMemo, useRef, useState } from "react";

const digits = (s) => String(s || "").replace(/\D/g, "");

export default function useScanFlow() {
  const [barcode, _setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(false);

  const [offModalOpen, setOffModalOpen] = useState(false);
  const [pendingBarcode, setPendingBarcode] = useState("");
  const [manualName, setManualName] = useState("");
  const [submittingName, setSubmittingName] = useState(false);

  const inflightRef = useRef(false);
  const lastScanRef = useRef({ code: "", t: 0 });

  const setBarcode = (v) => _setBarcode(digits(v));

  const callScan = useCallback(
    async (code, { name, requireOff = true } = {}) => {
      setLoading(true);
      setErrorMsg("");
      try {
        const url = `/api/scan${requireOff ? "?requireOff=1" : ""}`;
        const body = name ? { barcode: code, name } : { barcode: code };

        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await r.json().catch(() => ({}));

        if (
          r.status === 404 &&
          (data?.code === "NEED_NAME" || data?.code === "OFF_NOT_FOUND")
        ) {
          setPendingBarcode(code);
          setManualName("");
          setOffModalOpen(true);
          return { ok: false, needName: true };
        }

        if (!r.ok || !data?.ok) {
          throw new Error(data?.message || "Gagal memproses scan.");
        }

        setResult(data);
        if (!open) setOpen(true);
        return { ok: true, data };
      } catch (e) {
        setErrorMsg(e.message || "Terjadi kesalahan.");
        return { ok: false, error: e };
      } finally {
        setLoading(false);
      }
    },
    [open]
  );

  const submitManualName = useCallback(async () => {
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
  }, [manualName, pendingBarcode, callScan, open]);

  const onDetected = useMemo(() => {
    return async (raw) => {
      const code = digits(raw);
      if (!code) return;

      if (inflightRef.current || open || offModalOpen || loading || locked)
        return;

      const now = Date.now();
      if (
        lastScanRef.current.code === code &&
        now - lastScanRef.current.t < 30000
      ) {
        return;
      }

      inflightRef.current = true;
      setLocked(true);
      setBarcode(code);
      lastScanRef.current = { code, t: now };

      try {
        await callScan(code, { requireOff: true });
      } finally {
        inflightRef.current = false;
        setLocked(false);
      }
    };
  }, [open, offModalOpen, loading, locked, callScan]);

  const submitManualBarcode = useCallback(async () => {
    const code = digits(barcode.trim());
    if (!code) return;
    if (inflightRef.current) return;

    inflightRef.current = true;
    setLocked(true);
    try {
      await callScan(code, { requireOff: true });
    } finally {
      inflightRef.current = false;
      setLocked(false);
    }
  }, [barcode, callScan]);

  const paused =
    open || offModalOpen || loading || locked || inflightRef.current;

  const onCameraError = useCallback((err) => {
    setErrorMsg(err?.message || "Kamera tidak tersedia.");
  }, []);

  return {
    barcode,
    setBarcode,
    loading,
    locked,
    errorMsg,
    setErrorMsg,
    result,
    open,
    setOpen,
    paused,

    offModalOpen,
    setOffModalOpen,
    pendingBarcode,
    manualName,
    setManualName,
    submittingName,

    onDetected,
    submitManualBarcode,
    submitManualName,
    onCameraError,

    inflight: inflightRef.current,
  };
}
