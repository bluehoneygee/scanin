"use client";

import { useEffect, useRef, useState } from "react";

const EMIT_GUARD =
  globalThis.__BARCODE_EMIT_GUARD__ ||
  (globalThis.__BARCODE_EMIT_GUARD__ = {
    lastVal: "",
    lastAt: 0,
    coolUntil: 0,
  });

export default function CameraScanner({
  onDetected,
  onError,
  paused = false,
  facingMode = "environment",
  className = "",
  cooldownMs = 2500,
  dedupeWindowMs = 30000,
}) {
  const videoRef = useRef(null);
  const stopRef = useRef(() => {});
  const [supported, setSupported] = useState(true);

  const onDetectedRef = useRef(onDetected);
  const onErrorRef = useRef(onError);
  const pausedRef = useRef(paused);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let stream;
    let stopped = false;
    let rafId;

    async function start() {
      if (pausedRef.current) return;

      if (!("BarcodeDetector" in window)) {
        setSupported(false);
        onErrorRef.current?.(
          new Error(
            "Pemindaian kamera tidak didukung browser ini. Gunakan input manual."
          )
        );
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        setSupported(false);
        onErrorRef.current?.(
          new Error("Izin kamera ditolak atau kamera tidak tersedia.")
        );
        return;
      }

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      try {
        await videoRef.current.play();
      } catch {}

      const supportedFormats =
        (await window.BarcodeDetector.getSupportedFormats().catch(() => [])) ||
        [];
      const prefer = ["ean_13", "ean_8", "upc_a", "upc_e"];
      const formats = prefer.filter((f) => supportedFormats.includes(f)).length
        ? prefer.filter((f) => supportedFormats.includes(f))
        : supportedFormats;

      let detector;
      try {
        detector = new window.BarcodeDetector({ formats });
      } catch {
        setSupported(false);
        onErrorRef.current?.(
          new Error("BarcodeDetector tidak dapat diinisialisasi.")
        );
        return;
      }

      const tick = async () => {
        if (stopped || !videoRef.current) return;

        try {
          if (pausedRef.current) {
            rafId = requestAnimationFrame(tick);
            return;
          }

          const now = Date.now();
          if (now < EMIT_GUARD.coolUntil) {
            rafId = requestAnimationFrame(tick);
            return;
          }

          const barcodes = await detector.detect(videoRef.current);
          const first = barcodes?.find?.((b) => b?.rawValue) || barcodes?.[0];
          const text = first?.rawValue || first?.rawvalue || "";

          if (text) {
            if (
              EMIT_GUARD.lastVal === String(text) &&
              now - EMIT_GUARD.lastAt < dedupeWindowMs
            ) {
            } else {
              EMIT_GUARD.lastVal = String(text);
              EMIT_GUARD.lastAt = now;
              EMIT_GUARD.coolUntil = now + cooldownMs;
              onDetectedRef.current?.(text);
            }
          }
        } catch {}

        rafId = requestAnimationFrame(tick);
      };

      tick();

      stopRef.current = () => {
        stopped = true;
        if (rafId) cancelAnimationFrame(rafId);
        try {
          stream?.getTracks?.().forEach((t) => t.stop());
        } catch {}
      };
    }

    start();
    return () => stopRef.current?.();
  }, [facingMode, cooldownMs, dedupeWindowMs]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
        autoPlay
      />
      {!supported && (
        <div className="absolute inset-0 grid place-items-center bg-black/50 text-sm text-white">
          Kamera tidak didukung. Gunakan input manual.
        </div>
      )}
    </div>
  );
}
