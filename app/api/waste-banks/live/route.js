import { NextResponse } from "next/server";

const SRC =
  "https://ws.jakarta.go.id/gateway/DataPortalSatuDataJakarta/1.0/satudata?kategori=dataset&tipe=detail&url=data-lokasi-bank-sampah";

const slug = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const wilayahFilter = (searchParams.get("wilayah") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("limit") || "20", 10))
    );

    const r = await fetch(SRC, { next: { revalidate: 3600 } });
    if (!r.ok) {
      return NextResponse.json(
        { ok: false, message: `Gagal fetch sumber DKI (${r.status})` },
        { status: 502 }
      );
    }
    const json = await r.json().catch(() => ({}));
    const rows = Array.isArray(json?.data) ? json.data : [];

    let all = rows

      .filter((x) => (x?.status_kegiatan || "").toLowerCase().includes("aktif"))
      .map((x, i) => {
        const nama = x?.nama_bank_sampah || "Bank Sampah";
        const wilayah = x?.wilayah || "";
        const kecamatan = x?.kecamatan || "";
        const kelurahan = x?.kelurahan || "";
        const alamat = (x?.alamat || "").replace(/\s+/g, " ").trim();
        return {
          id:
            `${slug(nama)}-${slug(kelurahan || kecamatan || wilayah)}` ||
            `wb-${i}`,
          nama,
          wilayah,
          kecamatan,
          kelurahan,
          alamat,
          status_kegiatan: x?.status_kegiatan || "",
          sumber: "DKI",
        };
      });

    if (wilayahFilter && wilayahFilter !== "Semua Wilayah") {
      all = all.filter((b) => (b.wilayah || "") === wilayahFilter);
    }
    if (q) {
      all = all.filter((b) => {
        const blob = [
          b.nama,
          b.wilayah,
          b.kecamatan,
          b.kelurahan,
          b.alamat,
          b.status_kegiatan,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }

    all.sort((a, b) => a.nama.localeCompare(b.nama));

    const total = all.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = all.slice(start, end);
    const hasNext = end < total;

    const wilayahOptions = [
      ...new Set(rows.map((x) => x?.wilayah).filter(Boolean)),
    ].sort();

    return NextResponse.json(
      {
        ok: true,
        items,
        hasNext,
        total,
        wilayahOptions,
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=300, stale-while-revalidate=300",
        },
      }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e.message || "Gagal memproses permintaan" },
      { status: 500 }
    );
  }
}
