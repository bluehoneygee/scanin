export const CATEGORY_CLASS = {
  plastik:
    "bg-amber-100 text-amber-700 ring-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  karton:
    "bg-orange-100 text-orange-700 ring-orange-300 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/30",
  kaca: "bg-sky-100 text-sky-700 ring-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30",
  kertas:
    "bg-indigo-100 text-indigo-700 ring-indigo-300 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/30",
  logam:
    "bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-500/30",
  organik:
    "bg-stone-100 text-stone-700 ring-stone-300 dark:bg-stone-500/15 dark:text-stone-300 dark:ring-stone-500/30",
  elektronik:
    "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-300 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:ring-fuchsia-500/30",
  b3: "bg-rose-100 text-rose-700 ring-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30",

  default:
    "bg-[#9334eb]/10 text-[#4b1c80] ring-[#9334eb]/30 dark:text-[#9334eb]",
};

export const getCategoryClass = (label = "") => {
  const key = label.toLowerCase().trim().replace(/\s+/g, "");
  return CATEGORY_CLASS[key] || CATEGORY_CLASS.default;
};
