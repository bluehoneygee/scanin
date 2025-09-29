const OFF_BASE = "https://world.openfoodfacts.org/api/v2";

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

export async function getOffProduct(barcode) {
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

export function extractPackagingSignals(pRaw) {
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
