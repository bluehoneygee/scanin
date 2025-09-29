import { NextResponse } from "next/server";
import { withBarcodeLock } from "@/lib/server/scan/lock";
import { getOffProduct, extractPackagingSignals } from "@/lib/server/scan/off";
import {
  fetchProductsByBarcode,
  upsertProduct,
  fetchLatestEnrichmentByBarcode,
  saveEnrichmentIfChanged,
  saveScanDedup,
} from "@/lib/server/scan/mockapi";
import { generateEnrichment } from "@/lib/server/scan/ai";

export async function POST(req) {
  try {
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

    return await withBarcodeLock(barcode, async () => {
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
      let productBase;
      if (existing) {
        productBase = {
          name: existing.name || `Produk ${barcode}`,
          barcode,
          image: existing.image || existing.imageUrl || "",
        };
      } else if (off) {
        productBase = off;
      } else if (userProvidedName) {
        productBase = { name: userName.trim(), barcode, image: "" };
      } else {
        productBase = { name: `Produk ${barcode}`, barcode, image: "" };
      }

      const savedProduct = await upsertProduct({
        name: productBase.name,
        barcode: productBase.barcode,
        image: productBase.image,
      });

      const useCache = !force && !userProvidedName;
      let ai = null;
      let source = "existing-product";

      if (useCache) {
        const latest = await fetchLatestEnrichmentByBarcode(barcode);
        if (latest) {
          ai = {
            category: latest.category || "lainnya",
            recyclable: !!latest.recyclable,
            awareness: latest.awareness || "",
            tips: Array.isArray(latest.tips) ? latest.tips : [],
          };
          source = "cache";
        }
      }

      if (!ai) {
        const signals = off?.raw ? extractPackagingSignals(off.raw) : {};
        ai = await generateEnrichment({ productBase, barcode, signals });

        await saveEnrichmentIfChanged({
          productId: savedProduct.id,
          barcode,
          ...ai,
          createdAt: new Date().toISOString(),
        });
        source = "ai";
      }

      const scan = await saveScanDedup({
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
