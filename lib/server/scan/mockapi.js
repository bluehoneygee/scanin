const MOCK = process.env.MOCK_API_BASE;

function assertMock() {
  if (!MOCK) {
    throw new Error("MOCK_API_BASE belum di-set");
  }
}

export async function fetchProductsByBarcode(barcode) {
  assertMock();
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
      throw new Error(`Resource "products" tidak ditemukan di MockAPI.`);
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

export async function upsertProduct({ name, barcode, image }) {
  assertMock();
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

export async function fetchLatestEnrichmentByBarcode(barcode) {
  assertMock();
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

export async function fetchAllEnrichmentsByBarcode(barcode) {
  assertMock();
  const url = `${MOCK}/enrichments?barcode=${encodeURIComponent(barcode)}`;
  let res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (res.status === 404) {
    const resAll = await fetch(`${MOCK}/enrichments`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!resAll.ok) return [];
    const all = (await resAll.json()) || [];
    return all.filter((e) => String(e.barcode) === String(barcode));
  }
  if (!res.ok) return [];
  const arr = await res.json();
  return Array.isArray(arr) ? arr : [];
}

export function sameEnrichment(a, b) {
  if (!a || !b) return false;
  const tipsA = Array.isArray(a.tips) ? a.tips.join("|") : "";
  const tipsB = Array.isArray(b.tips) ? b.tips.join("|") : "";
  return (
    String(a.category || "") === String(b.category || "") &&
    Boolean(a.recyclable) === Boolean(b.recyclable) &&
    String((a.awareness || "").trim()) === String((b.awareness || "").trim()) &&
    tipsA === tipsB
  );
}

export async function saveEnrichmentIfChanged(e) {
  assertMock();
  const all = await fetchAllEnrichmentsByBarcode(e.barcode);
  const dup = all.find((x) => sameEnrichment(x, e));
  if (dup) return dup;

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

export async function fetchLatestScanByBarcode(barcode) {
  assertMock();
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
    const all = (await resAll.json()) || [];
    const filtered = all.filter((e) => String(e.barcode) === String(barcode));
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filtered[0] || null;
  }

  if (!res.ok) return null;
  const arr = await res.json();
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

export async function saveScanDedup(s, windowMs = 3000) {
  assertMock();
  const last = await fetchLatestScanByBarcode(s.barcode);
  if (last) {
    const dt = Date.now() - new Date(last.createdAt).getTime();
    if (dt >= 0 && dt <= windowMs) return last; // duplikat → reuse
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
