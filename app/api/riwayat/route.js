import { NextResponse } from "next/server";

const MOCK = process.env.MOCK_API_BASE;

async function fetchJson(url, init) {
  const r = await fetch(url, { cache: "no-store", ...init });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Fetch ${url} gagal (${r.status}): ${t || "(no body)"}`);
  }
  return r.json();
}

async function fetchScansPaged(page, limit) {
  const url = `${MOCK}/scans?sortBy=createdAt&order=desc&page=${page}&limit=${limit}`;
  const r = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (r.status === 404) {
    const all = await fetchJson(`${MOCK}/scans?sortBy=createdAt&order=desc`);
    const start = (page - 1) * limit;
    const slice = (Array.isArray(all) ? all : []).slice(start, start + limit);
    const hasNext = start + limit < (Array.isArray(all) ? all.length : 0);
    return { items: slice, hasNext };
  }
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Gagal membaca scans (${r.status}): ${t || "(no body)"}`);
  }
  const arr = await r.json();
  const items = Array.isArray(arr) ? arr : [];
  const hasNext = items.length === limit;
  return { items, hasNext };
}

async function fetchProductByIdOrBarcode({ productId, barcode }) {
  try {
    if (productId) {
      return await fetchJson(`${MOCK}/products/${productId}`);
    }
  } catch {}
  try {
    const r = await fetch(
      `${MOCK}/products?barcode=${encodeURIComponent(barcode)}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );
    if (!r.ok) return null;
    const data = await r.json();
    if (Array.isArray(data)) return data[0] || null;
    return data || null;
  } catch {
    return null;
  }
}

async function fetchLatestEnrichment(barcode) {
  try {
    const r = await fetch(
      `${MOCK}/enrichments?barcode=${encodeURIComponent(
        barcode
      )}&sortBy=createdAt&order=desc`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    if (!r.ok) return null;
    const arr = await r.json();
    return Array.isArray(arr) && arr.length ? arr[0] : null;
  } catch {
    return null;
  }
}

export async function GET(req) {
  try {
    if (!MOCK) {
      return NextResponse.json(
        { ok: false, message: "MOCK_API_BASE belum di-set" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );

    const { items: scans, hasNext } = await fetchScansPaged(page, limit);
    const merged = await Promise.all(
      scans.map(async (s) => {
        const [product, enrichment] = await Promise.all([
          fetchProductByIdOrBarcode({
            productId: s.productId,
            barcode: s.barcode,
          }),
          fetchLatestEnrichment(s.barcode),
        ]);

        return {
          id: s.id,
          barcode: s.barcode,
          createdAt: s.createdAt,
          product: product
            ? {
                id: product.id,
                name: product.name,
                image: product.image || product.imageUrl || "",
              }
            : null,
          ai: enrichment
            ? {
                category: enrichment.category || "lainnya",
                tips: Array.isArray(enrichment.tips) ? enrichment.tips : [],
                recyclable: !!enrichment.recyclable,
                awareness: enrichment.awareness || "",
              }
            : null,
        };
      })
    );

    return NextResponse.json({ ok: true, items: merged, hasNext });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e.message || "Gagal memuat riwayat" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    if (!MOCK) {
      return NextResponse.json(
        { ok: false, message: "MOCK_API_BASE belum di-set" },
        { status: 500 }
      );
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { ok: false, message: "ID wajib diisi" },
        { status: 400 }
      );
    }

    const r = await fetch(`${MOCK}/scans/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(
        `Gagal menghapus scan (${r.status}): ${t || "(no body)"}`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e.message || "Gagal menghapus riwayat" },
      { status: 500 }
    );
  }
}
