import { NextResponse } from "next/server";

const BASE = process.env.MOCK_API_BASE;

const RES = "pickupOrders";

function itemsObjectToArray(items) {
  if (!items || Array.isArray(items)) return items || [];
  return Object.entries(items).map(([id, v]) => ({
    id,
    nama: v?.nama ?? "",
    harga: Number(v?.harga ?? 0),
    qty: Number(v?.qty ?? 0),
  }));
}

export async function GET(_req, { params }) {
  if (!BASE) {
    return NextResponse.json(
      { ok: false, message: "MOCK_API_BASE belum diset di .env.local" },
      { status: 500 }
    );
  }

  const id = params?.id;
  if (!id) {
    return NextResponse.json(
      { ok: false, message: "Missing id" },
      { status: 400 }
    );
  }

  const r = await fetch(`${BASE}/${RES}/${id}`, { cache: "no-store" });
  let raw;
  try {
    raw = await r.json();
  } catch {
    raw = null;
  }

  if (!r.ok) {
    return NextResponse.json(
      { ok: false, message: "Upstream GET by id gagal", detail: raw },
      { status: r.status }
    );
  }

  const order = { ...raw, items: itemsObjectToArray(raw.items) };
  return NextResponse.json({ ok: true, order });
}
