import { NextResponse } from "next/server";

const BASE = process.env.MOCK_API_BASE;

const RES = "pickupOrders";

function itemsArrayToObject(items) {
  if (!Array.isArray(items)) return items || {};
  const obj = {};
  for (const it of items) {
    if (!it) continue;
    const id = String(it.id ?? it.itemId ?? "").trim();
    if (!id) continue;
    obj[id] = {
      nama: it.nama ?? it.name ?? "",
      harga: Number(it.harga ?? it.price ?? 0),
      qty: Number(it.qty ?? 0),
    };
  }
  return obj;
}
function itemsObjectToArray(items) {
  if (!items || Array.isArray(items)) return items || [];
  return Object.entries(items).map(([id, v]) => ({
    id,
    nama: v?.nama ?? "",
    harga: Number(v?.harga ?? 0),
    qty: Number(v?.qty ?? 0),
  }));
}

export async function GET(req) {
  if (!BASE) {
    return NextResponse.json(
      { ok: false, message: "MOCK_API_BASE belum diset di .env.local" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || "";
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "20";
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const order = url.searchParams.get("order") || "desc";

  const qs = new URLSearchParams({
    ...(userId ? { userId } : {}),
    page,
    limit,
    sortBy,
    order,
  }).toString();

  const r = await fetch(`${BASE}/${RES}?${qs}`, { cache: "no-store" });
  let raw;
  try {
    raw = await r.json();
  } catch {
    raw = null;
  }

  if (!r.ok) {
    return NextResponse.json(
      { ok: false, message: "Upstream GET gagal", detail: raw },
      { status: r.status }
    );
  }

  const items = Array.isArray(raw)
    ? raw.map((o) => ({ ...o, items: itemsObjectToArray(o.items) }))
    : [];

  return NextResponse.json({ ok: true, items });
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Body bukan JSON yang valid." },
      { status: 400 }
    );
  }

  if (!BASE) {
    return NextResponse.json(
      { ok: false, message: "MOCK_API_BASE belum diset di .env.local" },
      { status: 500 }
    );
  }

  const payload = {
    ...body,
    items: itemsArrayToObject(body.items),
    createdAt: body.createdAt || new Date().toISOString(),
  };

  const r = await fetch(`${BASE}/${RES}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let raw;
  try {
    raw = await r.json();
  } catch {
    raw = null;
  }
  if (!r.ok) {
    return NextResponse.json(
      { ok: false, message: "Upstream POST gagal", detail: raw },
      { status: r.status }
    );
  }

  const order = { ...raw, items: itemsObjectToArray(raw.items) };
  return NextResponse.json({ ok: true, order });
}
