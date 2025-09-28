// app/api/scan/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

const MOCK = process.env.MOCK_API_BASE;
const OFF_BASE = "https://world.openfoodfacts.org/api/v2";

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

function pickOffImage(p) {
  const si = p?.selected_images?.front?.display;
  const langs = ["id", "en", "fr", "de"];
  for (const l of langs) if (si?.[l]) return si[l];
  return (
    p?.image_front_url ||
    p?.image_url ||
    p?.image_small_url ||
    p?.image_thumb_url ||
    ""
  );
}

async function getOffProduct(barcode) {
  const r = await fetch(`${OFF_BASE}/product/${barcode}.json`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error("OFF request failed");
  const data = await r.json();
  if (data.status !== 1 || !data.product) return null;

  const p = data.product;
  const name =
    p.product_name ||
    p.generic_name ||
    p.brands ||
    p._id ||
    `Produk ${barcode}`;
  return {
    name,
    barcode,
    image: pickOffImage(p),
    raw: p,
  };
}

function extractPackagingSignals(pRaw) {
  const buckets = [];
  if (pRaw?.packaging) buckets.push(String(pRaw.packaging));
  if (pRaw?.packaging_text) buckets.push(String(pRaw.packaging_text));
  if (Array.isArray(pRaw?.packaging_tags))
    buckets.push(pRaw.packaging_tags.join(" "));
  if (Array.isArray(pRaw?.packagings)) {
    buckets.push(
      pRaw.packagings
        .map((pp) =>
          [pp?.material, pp?.shape, pp?.recycling, pp?.text]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ")
    );
  }
  const text = buckets.filter(Boolean).join(" ").toLowerCase();
  const hasAny = (arr) => arr.some((k) => text.includes(k));

  return {
    glass: hasAny(["glass", "verre", "vidrio", "vetro", "kaca", "glas"]),
    metal: hasAny(["aluminium", "aluminum", "steel", "metal", "étain", "fer"]),
    carton: hasAny(["cardboard", "carton", "karton", "paperboard"]),
    paper: hasAny(["paper", "papier", "kertas", "papel"]),
    plastic: hasAny([
      "plastic",
      "plastique",
      "plastik",
      "pet",
      "hdpe",
      "pp",
      "pe",
      "pete",
      "ldpe",
      "ps",
    ]),
  };
}

function chooseCategoryFromSignals(sig) {
  if (sig.glass) return "kaca";
  if (sig.metal) return "logam";
  if (sig.carton) return "karton";
  if (sig.paper) return "kertas";
  if (sig.plastic) return "plastik";
  return null;
}

function enforceConsistency(ai, signals) {
  const catFromSig = chooseCategoryFromSignals(signals);
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

  const saysRecycle =
    /daur ulang|recycle|did[ia]ur ulang|pilah.*(kaca|plastik|kertas|karton|logam)/i.test(
      ai.awareness || ""
    );
  if (saysRecycle && !ai.recyclable) {
    ai.recyclable = true;
  }

  return ai;
}

async function ensureResource(path) {
  const r = await fetch(`${MOCK}/${path}`, { method: "HEAD" });
  if (r.status === 404) {
    throw new Error(
      `Resource "${path}" tidak ditemukan di MockAPI. Buat resource itu dulu.`
    );
  }
}

async function upsertProduct({ name, barcode, image }) {
  await ensureResource("products");
  const q = await fetch(
    `${MOCK}/products?barcode=${encodeURIComponent(barcode)}`
  );
  if (!q.ok) throw new Error("Gagal cek products di MockAPI");
  const list = await q.json();

  if (Array.isArray(list) && list.length) {
    const existing = list[0];
    await fetch(`${MOCK}/products/${existing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || existing.name,
        barcode: existing.barcode || barcode,
        image: image || existing.image || "",
      }),
    });
    return { ...existing, name, barcode, image, id: existing.id };
  } else {
    const createdRes = await fetch(`${MOCK}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, barcode, image }),
    });
    if (!createdRes.ok) throw new Error("Gagal membuat product di MockAPI");
    return createdRes.json();
  }
}

async function fetchLatestEnrichmentByBarcode(barcode) {
  await ensureResource("enrichments");
  const r = await fetch(
    `${MOCK}/enrichments?barcode=${encodeURIComponent(
      barcode
    )}&sortBy=createdAt&order=desc`
  );
  if (!r.ok) throw new Error("Gagal membaca enrichment di MockAPI");
  const arr = await r.json();
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

async function saveEnrichment(e) {
  await ensureResource("enrichments");
  const res = await fetch(`${MOCK}/enrichments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(e),
  });
  if (!res.ok) throw new Error("Gagal membuat enrichment di MockAPI");
  return res.json();
}

async function saveScan(s) {
  await ensureResource("scans");
  const res = await fetch(`${MOCK}/scans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(s),
  });
  if (!res.ok) throw new Error("Gagal membuat scan di MockAPI");
  return res.json();
}

export async function POST(req) {
  try {
    if (!MOCK) {
      return NextResponse.json(
        { ok: false, message: "MOCK_API_BASE belum di-set" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "1";

    const { barcode } = await req.json();
    if (!barcode || typeof barcode !== "string") {
      return NextResponse.json(
        { ok: false, message: "Barcode wajib diisi" },
        { status: 400 }
      );
    }

    const off = await getOffProduct(barcode);
    const productBase = off || {
      name: `Produk ${barcode}`,
      barcode,
      image: "",
    };

    const savedProduct = await upsertProduct({
      name: productBase.name,
      barcode: productBase.barcode,
      image: productBase.image,
    });

    let ai = null;
    if (!force) {
      const latest = await fetchLatestEnrichmentByBarcode(barcode);
      if (latest) {
        ai = {
          category: latest.category || "lainnya",
          recyclable: !!latest.recyclable,
          awareness: latest.awareness || "",
          tips: Array.isArray(latest.tips)
            ? latest.tips
            : latest.tips
            ? [String(latest.tips)]
            : [],
        };
      }
    }

    let signals = {};
    if (!ai) {
      signals = off?.raw ? extractPackagingSignals(off.raw) : {};
      const sigOn =
        Object.entries(signals)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(", ") || "tidak diketahui";

      const { object: aiRaw } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: AiSchema,
        prompt: `
Anda asisten daur ulang untuk keluarga di Indonesia.
Produk: "${productBase.name}" (barcode: ${barcode})
Kemasan terdeteksi dari OFF: ${sigOn}

TUGAS:
1) Tentukan "category" (plastik|kertas|karton|kaca|logam|organik|elektronik|tekstil|lainnya).
2) "recyclable": true/false (realistis di fasilitas umum Indonesia).
3) "awareness": 1–2 kalimat, konsisten dengan kategori (jangan sebut plastik jika kategori kaca, dst).
4) "tips": 5 butir, super praktis untuk rumah tangga, pakai alat sederhana (air hangat + sabun, gunting/cutter, toples/wadah bekas, lap kain).
   - Maks 90 karakter per butir.
   - Hindari tips generik; sebut langkah & alat. Contoh: "rendam tutup di air hangat 5 mnt, lalu kupas label".
   - Sesuaikan kategori:
     • Kaca: lepas tutup plastik/metal, keringkan terbalik, bungkus pecahan.
     • Plastik: cek kode resin, bilas sabun, jemur 15 mnt, pipihkan botol.
     • Karton/Kertas: pastikan kering, pipihkan, pisah lapisan aluminium (UHT).
     • Logam: cek magnet, bilas minyak, keringkan.
KONSISTENSI:
- Jika "awareness" menganjurkan daur ulang, set "recyclable"=true.
Hanya balas JSON sesuai schema.
        `,
      });

      ai = {
        category: aiRaw.category || "lainnya",
        recyclable: !!aiRaw.recyclable,
        awareness: aiRaw.awareness || "",
        tips: Array.isArray(aiRaw.tips)
          ? aiRaw.tips
          : aiRaw.tips
          ? [String(aiRaw.tips)]
          : [],
      };

      ai = enforceConsistency(ai, signals);

      await saveEnrichment({
        productId: savedProduct.id,
        barcode,
        ...ai,
        createdAt: new Date().toISOString(),
      });
    }

    const scan = await saveScan({
      productId: savedProduct.id,
      barcode,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      product: {
        id: savedProduct.id,
        name: savedProduct.name,
        barcode: savedProduct.barcode,
        image: savedProduct.image || productBase.image || "",
      },
      ai,
      scan,
      debug: { signals },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e.message || "Gagal memproses scan" },
      { status: 500 }
    );
  }
}
