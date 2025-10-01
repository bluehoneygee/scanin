import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const BASE = process.env.MOCK_API_BASE;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const username = searchParams.get("username");

    const qs = new URLSearchParams();
    if (email) qs.set("email", email);
    if (username) qs.set("username", username);

    const r = await fetch(
      `${BASE}/users${qs.toString() ? "?" + qs.toString() : ""}`,
      { cache: "no-store" }
    );
    if (!r.ok) {
      return NextResponse.json(
        { ok: false, message: "Gagal memuat data pengguna." },
        { status: 502 }
      );
    }
    const arr = await r.json();
    const sanitized = (Array.isArray(arr) ? arr : []).map(
      ({ passwordHash, ...u }) => u
    );
    return NextResponse.json({ ok: true, users: sanitized });
  } catch (e) {
    console.error("USERS GET ERROR:", e);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { email, password, name, username } = await req.json();

    if (!email || !password || !name || !username) {
      return NextResponse.json(
        {
          ok: false,
          message: "Nama, username, email, dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    const [reEmail, reUser] = await Promise.all([
      fetch(`${BASE}/users?email=${encodeURIComponent(email)}`, {
        cache: "no-store",
      }),
      fetch(`${BASE}/users?username=${encodeURIComponent(username)}`, {
        cache: "no-store",
      }),
    ]);
    const [listEmail, listUser] = await Promise.all([
      reEmail.json(),
      reUser.json(),
    ]);
    if (Array.isArray(listEmail) && listEmail.length) {
      return NextResponse.json(
        { ok: false, message: "Email sudah terdaftar." },
        { status: 409 }
      );
    }
    if (Array.isArray(listUser) && listUser.length) {
      return NextResponse.json(
        { ok: false, message: "Username sudah digunakan." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const create = await fetch(`${BASE}/users`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        username,
        name,
        passwordHash,
        createdAt: new Date().toISOString(),
      }),
    });

    if (!create.ok) {
      const t = await create.text();
      console.error("MockAPI create user failed:", t);
      return NextResponse.json(
        { ok: false, message: "Gagal mendaftar pengguna." },
        { status: 502 }
      );
    }

    const saved = await create.json();
    const { passwordHash: _, ...safeUser } = saved;
    return NextResponse.json({ ok: true, user: safeUser }, { status: 201 });
  } catch (e) {
    console.error("USERS POST ERROR:", e);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan saat mendaftar." },
      { status: 500 }
    );
  }
}
