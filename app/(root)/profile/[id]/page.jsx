"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatDateID(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d)) return "-";
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}
function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}

export default function ProfilePage() {
  const router = useRouter();
  const { id } = useParams();

  const [authUser, setAuthUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth-user");
      if (!raw) {
        router.replace(`/sign-in?next=${encodeURIComponent(`/profile/${id}`)}`);
        return;
      }
      const u = JSON.parse(raw);
      setAuthUser(u);
      if (id === "me" && u?.id) {
        router.replace(`/profile/${u.id}`);
        return;
      }
    } finally {
      setHydrated(true);
    }
  }, [id, router]);

  const isMe = useMemo(() => {
    if (!authUser?.id) return false;
    return String(authUser.id) === String(id) || id === "me";
  }, [authUser?.id, id]);

  function handleLogout() {
    try {
      localStorage.removeItem("auth-user");
    } catch {}
    router.replace("/sign-in");
  }

  if (!hydrated) return null;

  if (!authUser) return null;

  const profile = authUser;

  return (
    <main className="min-h-dvh bg-neutral-50 px-4 md:px-6 py-8 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Profil</h1>
          <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-300">
            Kelola informasi akun kamu.
          </p>
        </div>

        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-4">
            <div
              className="
                grid h-14 w-14 place-items-center rounded-full
                bg-gradient-to-br from-[#9334eb] to-[#6b21a8] text-white
                font-semibold
              "
            >
              {initials(profile?.name || profile?.username || profile?.email)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">
                {profile?.name || profile?.username || "Pengguna"}
              </p>
              <p className="truncate text-[13px] text-neutral-500">
                @{profile?.username || "-"}
              </p>
            </div>
          </div>
        </section>
        <section className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] text-neutral-500">Email</dt>
              <dd className="text-sm font-medium break-words">
                {profile?.email || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-neutral-500">ID Akun</dt>
              <dd className="text-sm font-medium break-words">
                {profile?.id || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-neutral-500">Bergabung</dt>
              <dd className="text-sm font-medium">
                {formatDateID(profile?.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-neutral-500">Nama Lengkap</dt>
              <dd className="text-sm font-medium">{profile?.name || "-"}</dd>
            </div>
          </dl>
        </section>
        {!isMe ? (
          <p className="mt-3 text-[13px] text-amber-700 dark:text-amber-300">
            Kamu melihat profil dengan ID berbeda dari akun yang sedang masuk.
            <button
              className="ml-2 font-medium text-[#9334eb] hover:text-[#6b21a8] underline"
              onClick={() => router.replace(`/profile/${authUser.id}`)}
            >
              Lihat profil saya
            </button>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link href="/profile/edit">
            <Button className="rounded-[18px] bg-gradient-to-r from-[#9334eb] to-[#6b21a8] text-white">
              Edit Profil
            </Button>
          </Link>
          <Button
            variant="outline"
            className="rounded-[18px]"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      </div>
    </main>
  );
}
