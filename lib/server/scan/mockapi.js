const MOCK = process.env.MOCK_API_BASE;
const VALID_CODE_RE = /^\d{8,14}$/;

export async function fetchProductsByBarcode(barcode) {
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
    if (!resAll.ok) return [];
    const all = await resAll.json().catch(() => []);
    return (Array.isArray(all) ? all : []).filter(
      (p) => String(p?.barcode) === String(barcode)
    );
  }

  if (!res.ok) return [];
  const data = await res.json().catch(() => []);
  const arr = Array.isArray(data) ? data : data ? [data] : [];
  return arr.filter((p) => String(p?.barcode) === String(barcode));
}

export async function upsertProduct({ name, barcode, image }) {
  const list = await fetchProductsByBarcode(barcode);
  const base = { name, barcode, image: image || "", imageUrl: image || "" };

  if (Array.isArray(list) && list.length) {
    const existing = list[0];
    const payload = {
      name: base.name || existing.name,
      barcode: existing.barcode || barcode,
      image: base.image || existing.image || "",
      imageUrl: base.imageUrl || existing.imageUrl || "",
    };
    const upd = await fetch(`${MOCK}/products/${existing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...existing, ...payload }),
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

async function fetchLatestScanByBarcode(barcode) {
  const url = `${MOCK}/scans?barcode=${encodeURIComponent(
    barcode
  )}&sortBy=createdAt&order=desc`;
  let res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (res.status === 404) {
    const resAll = await fetch(`${MOCK}/scans`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!resAll.ok) return null;
    const all = (await resAll.json().catch(() => [])) || [];
    const filtered = all.filter((e) => String(e?.barcode) === String(barcode));
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filtered[0] || null;
  }

  if (!res.ok) return null;
  const data = await res.json().catch(() => []);
  const filtered = (Array.isArray(data) ? data : data ? [data] : []).filter(
    (e) => String(e?.barcode) === String(barcode)
  );
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return filtered[0] || null;
}

export async function saveScanDedup(s, windowMs = 3000) {
  const last = await fetchLatestScanByBarcode(s.barcode);
  if (last) {
    const dt = Date.now() - new Date(last.createdAt).getTime();
    if (dt >= 0 && dt <= windowMs) return last;
  }
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
