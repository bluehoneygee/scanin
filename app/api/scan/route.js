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
  try {
    const r = await fetch(`${OFF_BASE}/product/${barcode}.json`, {
      cache: "no-store",
    });
    if (!r.ok) return null;
    const data = await r.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const name =
      p.product_name ||
      p.generic_name ||
      p.brands ||
      p._id ||
      `Produk ${barcode}`;

    return { name, barcode, image: pickOffImage(p), raw: p };
  } catch {
    return null;
  }
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
  if (saysRecycle && !ai.recyclable) ai.recyclable = true;

  return ai;
}

function normalizeTips(tips) {
  return (Array.isArray(tips) ? tips : tips ? [String(tips)] : [])
    .map((s) => String(s).trim())
    .filter(Boolean)
    .map((s) => (s.length > 90 ? s.slice(0, 87) + "…" : s));
}

async function fetchProductsByBarcode(barcode) {
  const byFieldURL = `${MOCK}/products?barcode=${encodeURIComponent(barcode)}`;
  let res = await fetch(byFieldURL, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (res.status === 404) {
    const resAll = await fetch(`${MOCK}/products`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (resAll.status === 404) {
      throw new Error(
        `Resource "products" tidak ditemukan di MockAPI. Pastikan MOCK_API_BASE benar (pakai /api/v1) & resource sudah dibuat.`
      );
    }
    if (!resAll.ok) {
      const t = await resAll.text().catch(() => "");
      throw new Error(
        `Gagal membaca products di MockAPI (${resAll.status}). Detail: ${
          t || "(no body)"
        }`
      );
    }
    const all = await resAll.json();
    return (Array.isArray(all) ? all : []).filter(
      (p) => String(p.barcode) === String(barcode)
    );
  }

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(
      `Gagal cek products di MockAPI (${res.status}). Detail: ${
        t || "(no body)"
      }`
    );
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data ? [data] : [];
}

async function upsertProduct({ name, barcode, image }) {
  const list = await fetchProductsByBarcode(barcode);
  const base = {
    name,
    barcode,
    image: image || "",
    imageUrl: image || "",
  };

  if (Array.isArray(list) && list.length) {
    const existing = list[0];
    const upd = await fetch(`${MOCK}/products/${existing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...existing, ...base }),
    });
    if (!upd.ok) {
      const t = await upd.text().catch(() => "");
      throw new Error(
        `Gagal update product di MockAPI (${upd.status}). Detail: ${
          t || "(no body)"
        }`
      );
    }
    return await upd.json();
  } else {
    const crt = await fetch(`${MOCK}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(base),
    });
    if (!crt.ok) {
      const t = await crt.text().catch(() => "");
      throw new Error(
        `Gagal membuat product di MockAPI (${crt.status}). Detail: ${
          t || "(no body)"
        }`
      );
    }
    return await crt.json();
  }
}

async function fetchLatestEnrichmentByBarcode(barcode) {
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
    if (!resAll.ok) {
      const t = await resAll.text().catch(() => "");
      throw new Error(
        `Gagal membaca enrichments di MockAPI (${resAll.status}). Detail: ${
          t || "(no body)"
        }`
      );
    }
    const all = (await resAll.json()) || [];
    const filtered = all.filter((e) => String(e.barcode) === String(barcode));
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filtered[0] || null;
  }

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(
      `Gagal membaca enrichment di MockAPI (${res.status}). Detail: ${
        t || "(no body)"
      }`
    );
  }

  const arr = await res.json();
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

async function saveEnrichment(e) {
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

async function saveScan(s) {
  const res = await fetch(`${MOCK}/scans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(s),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(
      `Gagal membuat scan di MockAPI (${res.status}). Detail: ${
        t || "(no body)"
      }`
    );
  }
  return await res.json();
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
    const requireOff = url.searchParams.get("requireOff") === "1";

    const { barcode } = await req.json();
    if (!barcode || typeof barcode !== "string") {
      return NextResponse.json(
        { ok: false, message: "Barcode wajib diisi" },
        { status: 400 }
      );
    }

    const off = await getOffProduct(barcode);
    if (requireOff && !off) {
      return NextResponse.json(
        {
          ok: false,
          code: "OFF_NOT_FOUND",
          message:
            "Produk tidak ditemukan di Open Food Facts. Coba barcode lain atau input manual.",
        },
        { status: 404 }
      );
    }

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
          tips: normalizeTips(latest.tips),
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
Anda konsultan daur ulang untuk **ibu rumah tangga di Indonesia**.

Produk: "${productBase.name}" (barcode: ${barcode})
Kemasan terdeteksi dari OFF: ${sigOn}

TUGAS:
1) "category": salah satu dari (plastik|kertas|karton|kaca|logam|organik|elektronik|tekstil|lainnya).
2) "recyclable": true/false (realistis di fasilitas umum Indonesia).
3) "awareness": 1–2 kalimat, **konsisten** dengan kategori.
4) "tips": 5 butir, **super praktis untuk rumah tangga**, ≤80 karakter/point:
   - Alat rumahan: baskom, sabun cuci piring, air hangat, lap, gunting/tali rafia, rak jemur.
   - Format langkah nyatakan tindakan + lokasi (dapur/kamar mandi/teras).
   - Hindari tips generik.
   - Sesuaikan kategori (kaca/plastik/kertas-karton/logam).
KONSISTENSI:
- Jika "awareness" menganjurkan daur ulang, set "recyclable"=true.

Balas **HANYA JSON** sesuai schema.`,
      });

      ai = {
        category: aiRaw.category || "lainnya",
        recyclable: !!aiRaw.recyclable,
        awareness: aiRaw.awareness || "",
        tips: normalizeTips(aiRaw.tips),
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
        image:
          savedProduct.image ||
          savedProduct.imageUrl ||
          productBase.image ||
          "",
      },
      ai,
      scan,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e.message || "Gagal memproses scan" },
      { status: 500 }
    );
  }
}
