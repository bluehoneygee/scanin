import { z } from "zod";

export const CATEGORIES = [
  "plastik",
  "kertas",
  "karton",
  "kaca",
  "logam",
  "organik",
  "elektronik",
  "tekstil",
  "lainnya",
];

export const AiSchema = z.object({
  category: z.enum(CATEGORIES).default("lainnya"),
  recyclable: z.boolean().default(false),
  awareness: z.string().default(""),
  tips: z.array(z.string()).default([]),
});

export function normalizeAiOutput(input = {}) {
  const clean = {
    category: String(input.category || "lainnya").toLowerCase(),
    recyclable: Boolean(input.recyclable),
    awareness: String(input.awareness || "")
      .trim()
      .replace(/\s+/g, " "),
    tips: Array.isArray(input.tips)
      ? input.tips.map((t) => String(t).trim()).filter(Boolean)
      : [],
  };

  if (!CATEGORIES.includes(clean.category)) clean.category = "lainnya";

  clean.tips = clean.tips.slice(0, 5);

  if (clean.awareness.length > 500) {
    clean.awareness = clean.awareness.slice(0, 500) + "…";
  }

  return clean;
}
