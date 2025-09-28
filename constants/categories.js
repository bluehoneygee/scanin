export const CATEGORY_STYLES = {
  plastik: { badge: "border-pink-200 text-pink-700 bg-pink-50" },
  kaca: { badge: "border-emerald-200 text-emerald-700 bg-emerald-50" },
  kertas: { badge: "border-sky-200 text-sky-700 bg-sky-50" },
  karton: { badge: "border-amber-200 text-amber-700 bg-amber-50" },
  logam: { badge: "border-gray-300 text-gray-700 bg-gray-50" },
  organik: { badge: "border-lime-200 text-lime-700 bg-lime-50" },
  elektronik: { badge: "border-purple-200 text-purple-700 bg-purple-50" },
  tekstil: { badge: "border-fuchsia-200 text-fuchsia-700 bg-fuchsia-50" },
  lainnya: { badge: "border-neutral-300 text-neutral-700 bg-neutral-50" },
};

export function getCategoryBadgeClasses(cat) {
  const key = (cat || "lainnya").toLowerCase();
  return CATEGORY_STYLES[key]?.badge || CATEGORY_STYLES.lainnya.badge;
}
