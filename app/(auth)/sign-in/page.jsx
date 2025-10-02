"use client";

import AuthForm from "@/components/forms/AuthForm";
import { SignInSchema } from "@/lib/validations";
import { setAuthUserLocal } from "@/lib/use-auth-user";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const search = useSearchParams();
  const initialEmail = search.get("email") || "";
  const justSignedUp = search.get("justSignedUp") === "1";
  const next = search.get("next") || "/";

  return (
    <>
      {justSignedUp ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-100">
          Akun berhasil dibuat. Silakan masuk dengan email &amp; password kamu.
        </div>
      ) : null}

      <AuthForm
        formType="SIGN_IN"
        schema={SignInSchema}
        defaultValues={{ email: initialEmail, password: "" }}
        onSubmit={async (values) => {
          try {
            const r = await fetch("/api/auth/sign-in", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            });
            const data = await r.json().catch(() => ({}));

            if (!r.ok || !data?.ok) {
              return {
                success: false,
                message: data?.message || "Email atau password salah.",
              };
            }

            setAuthUserLocal(data.user);

            return { success: true, data: data.user, redirect: next };
          } catch (e) {
            return { success: false, message: e.message || "Gagal sign-in." };
          }
        }}
      />
    </>
  );
}
