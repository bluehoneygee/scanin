import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const BASE = process.env.MOCK_API_BASE;

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const base = String(BASE || "").replace(/\/+$/, "");
    const url = `${base}/users?email=${encodeURIComponent(email)}`;

    const r = await fetch(url, { cache: "no-store" });

    if (process.env.NODE_ENV !== "production") {
      console.log("[SIGN-IN] GET", url, "->", r.status);
    }

    let list = [];
    if (r.ok) {
      list = await r.json();
    } else if (r.status === 404) {
      list = [];
    } else if (r.status === 429) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Server pengguna membatasi permintaan (rate limit). Coba lagi sebentar.",
        },
        { status: 502 }
      );
    } else if (r.status === 401 || r.status === 403) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Tidak diizinkan mengakses server pengguna. Cek apakah endpoint MockAPI private / butuh API key.",
        },
        { status: 502 }
      );
    } else {
      const bodyText = await r.text().catch(() => "");
      return NextResponse.json(
        {
          ok: false,
          message: `Gagal menghubungi server pengguna (status ${r.status}).`,
          detail: bodyText?.slice(0, 300),
        },
        { status: 502 }
      );
    }

    const user = Array.isArray(list) ? list[0] : null;
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Email tidak terdaftar." },
        { status: 404 }
      );
    }

    const match = await bcrypt.compare(
      String(password),
      String(user.passwordHash || "")
    );
    if (!match) {
      return NextResponse.json(
        { ok: false, message: "Password salah." },
        { status: 401 }
      );
    }

    const { passwordHash, ...safeUser } = user;
    return NextResponse.json({ ok: true, user: safeUser });
  } catch (e) {
    console.error("SIGN-IN ERROR:", e);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan saat masuk." },
      { status: 500 }
    );
  }
}
