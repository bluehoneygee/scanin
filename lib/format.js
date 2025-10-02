export function formatRp(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}

export function formatDateID(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function initials(name = "") {
  const s = String(name || "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => (p[0] || "").toUpperCase()).join("") || "U";
}

export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function timeSlots(start = 8, end = 17, step = 30) {
  const out = [];
  for (let h = start; h <= end; h++) {
    for (let m = 0; m < 60; m += step) {
      if (h === end && m > 0) break;
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}

export function to12h(hhmm = "") {
  const [H, M] = hhmm.split(":").map((x) => parseInt(x || "0", 10));
  if (Number.isNaN(H) || Number.isNaN(M)) return "-";
  const h = ((H + 11) % 12) + 1;
  const ampm = H < 12 ? "AM" : "PM";
  return `${h}:${String(M).padStart(2, "0")}${ampm}`;
}

export function addMinutes(hhmm, minutes) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  d.setMinutes(d.getMinutes() + (minutes || 0));
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}
