import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

const MOCK = process.env.MOCK_API_BASE;
const AiSchema = z.object({
  category: z
    .enum([
      "plastik",
      "kertas",
      "karton",
      "kaca",
      "logam",
      "organik",
      "elektronik",
      "tekstil",
      "lainnya",
    ])
    .optional()
    .default("lainnya"),
  recyclable: z.boolean().optional().default(false),
  awareness: z.string().optional().default(""),
  tips: z.array(z.string()).optional().default([]),
});

const NEG_RECYCLE_RE =
  /(sulit|tidak\s*(bisa|dapat)|bukan).*daur ulang|tidak.*daur ulang/i;
const POS_RECYCLE_RE =
  /daur ulang|recycle|pilah.*(kaca|plastik|kertas|karton|logam)|masukkan ke bank\s*sampah/i;

function chooseCategoryFromSignals(sig) {
  if (sig?.glass) return "kaca";
  if (sig?.metal) return "logam";
  if (sig?.carton) return "karton";
  if (sig?.paper) return "kertas";
  if (sig?.plastic) return "plastik";
  return null;
}

function enforceConsistency(ai, signals) {
  const catFromSig = chooseCategoryFromSignals(signals || {});
  if (catFromSig) {
    ai.category = catFromSig;
    ai.recyclable = ["kaca", "logam", "karton", "kertas", "plastik"].includes(
      catFromSig
    );
    if (!ai.awareness) {
      const map = {
        kaca: "Kaca umumnya dapat didaur ulang. Cuci bersih, lepaskan tutup/label bila perlu.",
        logam:
          "Logam (aluminium/baja) umumnya dapat didaur ulang. Bilas & keringkan.",
        karton:
          "Karton dapat didaur ulang jika bersih & kering. Pipihkan sebelum dikumpulkan.",
        kertas:
          "Kertas bersih & kering dapat didaur ulang. Hindari kertas berminyak/basah.",
        plastik:
          "Plastik tertentu bisa didaur ulang (PET/HDPE). Cek kode resin & fasilitas setempat.",
      };
      ai.awareness = map[catFromSig] || ai.awareness;
    }
  }
  if (NEG_RECYCLE_RE.test(ai.awareness || "")) ai.recyclable = false;
  else if (POS_RECYCLE_RE.test(ai.awareness || "")) ai.recyclable = true;
  return ai;
}

export function normalizeTips(tips) {
  return (Array.isArray(tips) ? tips : tips ? [String(tips)] : [])
    .map((s) => String(s).trim())
    .filter(Boolean)
    .map((s) => (s.length > 90 ? s.slice(0, 87) + "…" : s));
}

export async function fetchLatestEnrichmentByBarcode(barcode) {
  const url = `${MOCK}/enrichments?barcode=${encodeURIComponent(
    barcode
  )}&sortBy=createdAt&order=desc`;
  let res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (res.status === 404) {
    const resAll = await fetch(`${MOCK}/enrichments`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (resAll.status === 404) return null;
    if (!resAll.ok) return null;
    const all = (await resAll.json()) || [];
    const filtered = all.filter((e) => String(e.barcode) === String(barcode));
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filtered[0] || null;
  }

  if (!res.ok) return null;
  const arr = await res.json();
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

async function fetchAllEnrichmentsByBarcode(barcode) {
  const url = `${MOCK}/enrichments?barcode=${encodeURIComponent(barcode)}`;
  let res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (res.status === 404) {
    const resAll = await fetch(`${MOCK}/enrichments`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!resAll.ok) return [];
    const all = (await resAll.json()) || [];
    return all.filter((e) => String(e.barcode) === String(barcode));
  }
  if (!res.ok) return [];
  const arr = await res.json();
  return Array.isArray(arr) ? arr : [];
}

function sameEnrichment(a, b) {
  if (!a || !b) return false;
  const tipsA = Array.isArray(a.tips) ? a.tips.join("|") : "";
  const tipsB = Array.isArray(b.tips) ? b.tips.join("|") : "";
  return (
    String(a.category || "") === String(b.category || "") &&
    Boolean(a.recyclable) === Boolean(b.recyclable) &&
    String((a.awareness || "").trim()) === String((b.awareness || "").trim()) &&
    tipsA === tipsB
  );
}

export async function saveEnrichmentIfChanged(e) {
  const all = await fetchAllEnrichmentsByBarcode(e.barcode);
  const dup = all.find((x) => sameEnrichment(x, e));
  if (dup) return dup;

  const res = await fetch(`${MOCK}/enrichments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(e),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(
      `Gagal membuat enrichment di MockAPI (${res.status}). Detail: ${
        t || "(no body)"
      }`
    );
  }
  return await res.json();
}

export async function generateEnrichmentFromAI(productBase, barcode, signals) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY belum di-set. Tidak bisa membuat enrichment AI."
    );
  }

  const sigOn =
    Object.entries(signals || {})
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ") || "tidak diketahui";

  const { object: aiRaw } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: AiSchema,
    temperature: 0,
    prompt: `
Anda konsultan daur ulang untuk **ibu rumah tangga di Indonesia**.

Produk: "${productBase.name}" (barcode: ${barcode})
Kemasan terdeteksi dari OFF: ${sigOn}

TUGAS:
1) "category": salah satu (plastik|kertas|karton|kaca|logam|organik|elektronik|tekstil|lainnya).
2) "recyclable": true/false (realistis fasilitas Indonesia).
3) "awareness": 1–2 kalimat, konsisten dgn kategori.
   - Jika recyclable=true: JANGAN pakai frasa "sulit/tidak dapat didaur ulang".
   - Jika recyclable=false: JANGAN menganjurkan daur ulang.
4) "tips": 5 butir, praktis & aman, ≤80 karakter/point:
   - Alat rumahan: baskom, sabun cuci piring, air hangat, lap, gunting, tali rafia, rak jemur.
   - Format: tindakan + lokasi (dapur/kamar mandi/teras).
   - Hindari tips generik & larangan "DIY/kerajinan/dekorasi".

KONSISTENSI WAJIB:
- Awareness NEGATIF ⇒ recyclable=false.
- Awareness sarankan daur ulang ⇒ recyclable=true.

Balas **HANYA JSON** sesuai schema.`,
  });

  let ai = {
    category: aiRaw.category || "lainnya",
    recyclable: !!aiRaw.recyclable,
    awareness: aiRaw.awareness || "",
    tips: normalizeTips(aiRaw.tips),
  };
  ai = enforceConsistency(ai, signals || {});
  return ai;
}
