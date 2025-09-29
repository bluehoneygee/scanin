import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { enforceConsistency, normalizeTips } from "./off";

const AiSchema = z.object({
  category: z
    .enum([
      "plastik",
      "kertas",
      "karton",
      "kaca",
      "logam",
      "organik",
      "elektronik",
      "tekstil",
      "lainnya",
    ])
    .optional()
    .default("lainnya"),
  recyclable: z.boolean().optional().default(false),
  awareness: z.string().optional().default(""),
  tips: z.array(z.string()).optional().default([]),
});

export async function generateEnrichment({ productBase, barcode, signals }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY belum di-set. Tidak bisa membuat enrichment AI."
    );
  }

  const sigOn =
    Object.entries(signals || {})
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ") || "tidak diketahui";

  const { object: aiRaw } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: AiSchema,
    temperature: 0,
    prompt: `
Anda konsultan daur ulang untuk **ibu rumah tangga di Indonesia**.

Produk: "${productBase.name}" (barcode: ${barcode})
Kemasan terdeteksi dari OFF: ${sigOn}

TUGAS:
1) "category": salah satu (plastik|kertas|karton|kaca|logam|organik|elektronik|tekstil|lainnya).
2) "recyclable": true/false (realistis fasilitas Indonesia).
3) "awareness": 1–2 kalimat, konsisten dgn kategori.
   - Jika recyclable=true: JANGAN pakai frasa "sulit/tidak dapat didaur ulang".
   - Jika recyclable=false: JANGAN menganjurkan daur ulang.
4) "tips": 5 butir, praktis & aman, ≤80 karakter/point:
   - Alat rumahan: baskom, sabun cuci piring, air hangat, lap, gunting, tali rafia, rak jemur.
   - Format: tindakan + lokasi (dapur/kamar mandi/teras).
   - Hindari tips generik & larangan "DIY/kerajinan/dekorasi".

KONSISTENSI WAJIB:
- Awareness NEGATIF ⇒ recyclable=false.
- Awareness sarankan daur ulang ⇒ recyclable=true.

Balas **HANYA JSON** sesuai schema.`,
  });

  let ai = {
    category: aiRaw.category || "lainnya",
    recyclable: !!aiRaw.recyclable,
    awareness: aiRaw.awareness || "",
    tips: normalizeTips(aiRaw.tips),
  };

  ai = enforceConsistency(ai, signals || {});
  return ai;
}
