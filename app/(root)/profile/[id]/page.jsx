"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuthUser, getAuthUserId } from "@/lib/use-auth-user";
import { formatDateID, initials } from "@/lib/format";

export default function ProfilePage() {
  const router = useRouter();
  const { id } = useParams();

  const user = useAuthUser();
  const uid = getAuthUserId(user);

  useEffect(() => {
    if (user === null) return;

    if (!uid) {
      router.replace(`/sign-in?next=${encodeURIComponent(`/profile/${id}`)}`);
      return;
    }

    if (id === "me") {
      router.replace(`/profile/${uid}`);
      return;
    }

    if (String(id) !== String(uid)) {
      router.replace(`/profile/${uid}`);
    }
  }, [user, uid, id, router]);

  if (!uid) return null;

  const profile = user || {};
  const displayName =
    profile.name || profile.username || profile.email || "Pengguna";
  const displayHandle = profile.username ? `@${profile.username}` : "-";
  const avatarInitials = initials(displayName);

  return (
    <div className="min-h-dvh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-40">
        <div className="lg:hidden relative left-1/2 -ml-[50vw] w-[100vw] -mr-[50vw] border-b border-neutral-200 bg-white/90 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1 text-[13px] font-medium"
            >
              <ArrowLeft size={16} /> Kembali
            </Link>
            <h1 className="mx-auto font-poppins text-sm font-semibold">
              Profil
            </h1>
            <span className="w-12" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6 md:px-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#9334eb] to-[#6b21a8] font-semibold text-white">
              {avatarInitials}
            </div>
            <div className="min-w-0">
              <p className="font-poppins truncate text-lg font-semibold">
                {displayName}
              </p>
              <p className="truncate text-[13px] text-neutral-500">
                {displayHandle}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] text-neutral-500">Email</dt>
              <dd className="break-words text-sm font-medium font-poppins">
                {profile.email || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-neutral-500">ID Akun</dt>
              <dd className="break-words text-sm font-medium font-poppins">
                {profile.id || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-neutral-500">Bergabung</dt>
              <dd className="text-sm font-medium font-poppins">
                {formatDateID(profile.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-neutral-500">Nama Lengkap</dt>
              <dd className="text-sm font-medium font-poppins">
                {profile.name || "-"}
              </dd>
            </div>
          </dl>
        </section>

        <div className="h-24 lg:h-0" />
      </main>
    </div>
  );
}
