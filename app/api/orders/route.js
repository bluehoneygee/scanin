import { NextResponse } from "next/server";

const BASE = process.env.MOCK_API_BASE?.replace(/\/+$/, "");
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
function getUserId(req, bodyUserId) {
  try {
    const url = new URL(req.url);
    const fromQuery = url.searchParams.get("userId") || "";
    const fromHeader = req.headers.get("x-user-id") || "";
    const cookie = req.headers.get("cookie") || "";
    const m = cookie?.match?.(/(?:^|;\s*)auth_user_id=([^;]+)/i);
    const fromCookie = m ? decodeURIComponent(m[1]) : "";
    return fromQuery || fromHeader || bodyUserId || fromCookie || "";
  } catch {
    return bodyUserId || "";
  }
}

export async function GET(req) {
  if (!BASE) {
    return NextResponse.json(
      { ok: false, message: "MOCK_API_BASE belum diset di .env.local" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.max(
    1,
    parseInt(url.searchParams.get("limit") || "20", 10)
  );
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const order = url.searchParams.get("order") || "desc";
  const userId = getUserId(req, "");

  if (!userId) {
    return NextResponse.json(
      { ok: false, message: "userId tidak ditemukan (login dulu)" },
      { status: 401 }
    );
  }

  const upstreamBase = `${BASE}/${RES}`;
  const mapItems = (arr) =>
    (Array.isArray(arr) ? arr : []).map((o) => ({
      ...o,
      items: itemsObjectToArray(o.items),
    }));

  const qs1 = new URLSearchParams({
    userId,
    page: String(page),
    limit: String(limit),
    sortBy,
    order,
  }).toString();

  let r = await fetch(`${upstreamBase}?${qs1}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (r.ok) {
    const raw = await r.json().catch(() => []);
    return NextResponse.json({ ok: true, items: mapItems(raw) });
  }

  if (r.status === 404) {
    const rAll = await fetch(
      `${upstreamBase}?userId=${encodeURIComponent(userId)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    if (rAll.ok) {
      const all = (await rAll.json().catch(() => [])) || [];
      all.sort((a, b) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return order.toLowerCase() === "asc" ? ta - tb : tb - ta;
      });
      const start = (page - 1) * limit;
      const slice = all.slice(start, start + limit);
      return NextResponse.json({ ok: true, items: mapItems(slice) });
    }

    const qs2 = new URLSearchParams({
      userId,
      _page: String(page),
      _limit: String(limit),
      _sort: sortBy,
      _order: order,
    }).toString();

    const rJS = await fetch(`${upstreamBase}?${qs2}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (rJS.ok) {
      const raw = await rJS.json().catch(() => []);
      return NextResponse.json({ ok: true, items: mapItems(raw) });
    }

    if (rJS.status === 404) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const detail = await rJS.json().catch(() => null);
    return NextResponse.json(
      { ok: false, message: "Upstream GET gagal", detail },
      { status: rJS.status || 502 }
    );
  }

  let detail;
  try {
    detail = await r.json();
  } catch {
    detail = null;
  }
  return NextResponse.json(
    { ok: false, message: "Upstream GET gagal", detail },
    { status: r.status || 502 }
  );
}

export async function POST(req) {
  if (!BASE) {
    return NextResponse.json(
      { ok: false, message: "MOCK_API_BASE belum diset di .env.local" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Body bukan JSON yang valid." },
      { status: 400 }
    );
  }

  const userId = getUserId(req, body?.userId || "");
  if (!userId) {
    return NextResponse.json(
      { ok: false, message: "userId tidak ditemukan (login dulu)" },
      { status: 401 }
    );
  }

  const payload = {
    ...body,
    userId, // enforce
    items: itemsArrayToObject(body.items), // normalize ke map
    createdAt: body.createdAt || new Date().toISOString(),
  };

  const upstream = await fetch(`${BASE}/${RES}`, {
    method: "POST",
    headers: { "content-type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let raw;
  try {
    raw = await upstream.json();
  } catch {
    raw = null;
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { ok: false, message: "Upstream POST gagal", detail: raw },
      { status: upstream.status }
    );
  }

  const order = { ...raw, items: itemsObjectToArray(raw.items) };
  return NextResponse.json({ ok: true, order });
}
