"use client";
import AuthForm from "@/components/forms/AuthForm";
import { SignUpSchema } from "@/lib/validations";
import React from "react";

const SignUpPage = () => {
  return (
    <AuthForm
      formType="SIGN_UP"
      schema={SignUpSchema}
      defaultValues={{ email: "", password: "", name: "", username: "" }}
      onSubmit={async (values) => {
        try {
          const r = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const data = await r.json().catch(() => ({}));

          if (!r.ok || !data?.ok) {
            return {
              success: false,
              message: data?.message || "Gagal membuat akun.",
            };
          }
          const qs = new URLSearchParams({
            email: values.email || "",
            justSignedUp: "1",
          }).toString();

          return { success: true, data: data.user, redirect: `/sign-in?${qs}` };
        } catch (e) {
          return { success: false, message: e.message || "Gagal sign-up." };
        }
      }}
    />
  );
};

export default SignUpPage;
