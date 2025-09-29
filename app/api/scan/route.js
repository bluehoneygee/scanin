import { NextResponse } from "next/server";
import { withBarcodeLock } from "@/lib/server/scan/locks";
import { getUserIdFromRequest } from "@/lib/utils";
import {
  fetchProductsByBarcode,
  upsertProduct,
  saveScanDedup,
} from "@/lib/server/scan/mockapi";
import { getOffProduct, extractPackagingSignals } from "@/lib/server/scan/off";
import {
  fetchLatestEnrichmentByBarcode,
  saveEnrichmentIfChanged,
  normalizeTips,
  generateEnrichmentFromAI,
} from "@/lib/server/scan/enrichment";

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "1";
    const requireOff = url.searchParams.get("requireOff") === "1";

    const { barcode, name: userName } = await req.json();
    if (!barcode || typeof barcode !== "string") {
      return NextResponse.json(
        { ok: false, message: "Barcode wajib diisi" },
        { status: 400 }
      );
    }
    return await withBarcodeLock(`${userId}:${barcode}`, async () => {
      const existingList = await fetchProductsByBarcode(barcode);
      const existing = Array.isArray(existingList) && existingList[0];
      let off = null;
      if (!existing) off = await getOffProduct(barcode);
      if (requireOff && !existing && !off && !userName?.trim()) {
        return NextResponse.json(
          {
            ok: false,
            code: "NEED_NAME",
            message:
              "Produk tidak ditemukan. Masukkan nama produk agar kami bisa memberi kategori & tips.",
          },
          { status: 404 }
        );
      }

      const userProvidedName = !!userName?.trim();
      const productBase = existing
        ? {
            name: existing.name || `Produk ${barcode}`,
            barcode,
            image: existing.image || existing.imageUrl || "",
          }
        : off
        ? off
        : userProvidedName
        ? { name: userName.trim(), barcode, image: "" }
        : { name: `Produk ${barcode}`, barcode, image: "" };

      const savedProduct = await upsertProduct({
        name: productBase.name,
        barcode: productBase.barcode,
        image: productBase.image,
      });

      let ai = null;
      let source = "existing-product";
      if (!force && !userProvidedName) {
        const latest = await fetchLatestEnrichmentByBarcode(barcode);
        if (latest) {
          ai = {
            category: latest.category || "lainnya",
            recyclable: !!latest.recyclable,
            awareness: latest.awareness || "",
            tips: normalizeTips(latest.tips),
          };
          source = "cache";
        }
      }

      if (!ai) {
        const signals = off?.raw ? extractPackagingSignals(off.raw) : {};
        ai = await generateEnrichmentFromAI(productBase, barcode, signals);
        await saveEnrichmentIfChanged({
          productId: savedProduct.id,
          barcode,
          ...ai,
          createdAt: new Date().toISOString(),
        });
        source = "ai";
      }

      const scan = await saveScanDedup({
        userId,
        productId: savedProduct.id,
        barcode,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        ok: true,
        source,
        product: {
          id: savedProduct.id,
          name: savedProduct.name,
          barcode: savedProduct.barcode,
          image:
            savedProduct.image ||
            savedProduct.imageUrl ||
            off?.image ||
            "" ||
            "",
        },
        ai,
        scan,
      });
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e.message || "Gagal memproses scan" },
      { status: 500 }
    );
  }
}
