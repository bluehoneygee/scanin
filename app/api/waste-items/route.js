import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CANDIDATES = ["waste_items", "waste-items"];

export async function GET() {
  const base = process.env.MOCK_API_BASE;
  if (!base) {
    return NextResponse.json(
      { ok: false, message: "MOCK_API_BASE belum di-set" },
      { status: 500 }
    );
  }

  let lastErr = null;

  for (const name of CANDIDATES) {
    const url = `${base.replace(/\/+$/, "")}/${name}`;
    try {
      const r = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (r.status === 404) {
        lastErr = { status: 404, name };
        continue;
      }
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        return NextResponse.json(
          {
            ok: false,
            message: `Gagal baca ${name} di MockAPI (${r.status}). ${t || ""}`,
          },
          { status: r.status }
        );
      }

      const raw = await r.json();
      const arr = Array.isArray(raw) ? raw : raw?.items || [];
      const items = arr
        .map((it) => ({
          id: String(it.id),
          name: String(it.name || it.nama || "").trim(),
          price: Number(it.price ?? it.harga ?? 0),
        }))
        .filter((x) => x.id && x.name);

      return NextResponse.json({ ok: true, items });
    } catch (e) {
      lastErr = { status: 500, name, error: e?.message || String(e) };
    }
  }

  if (lastErr?.status === 404) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Resource "waste_items" / "waste-items" belum ada di MockAPI. Buat collection dengan salah satu nama itu dan seed data berupa array objek {id, name, price}.',
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { ok: false, message: lastErr?.error || "Tidak bisa menghubungi MockAPI." },
    { status: 500 }
  );
}
