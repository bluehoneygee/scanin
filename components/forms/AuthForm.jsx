"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AuthForm = ({ formType, schema, defaultValues, onSubmit }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      form.clearErrors("root");

      const res = await onSubmit(values);
      if (!res?.success) {
        form.setError("root", {
          message: res?.message || "Terjadi kesalahan.",
        });
        return;
      }

      if (res.redirect) {
        router.replace(res.redirect);
      }
    } catch (e) {
      form.setError("root", { message: e?.message || "Terjadi kesalahan." });
    } finally {
      setSubmitting(false);
    }
  };

  const buttonText = formType === "SIGN_IN" ? "Sign In" : "Sign Up";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="mt-10 space-y-6 font-poppins"
      >
        {form.formState.errors.root?.message ? (
          <p className="text-sm text-red-600">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        {Object.keys(defaultValues).map((name) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-2.5">
                <FormLabel className="text-neutral-700 dark:text-neutral-300">
                  {field.name === "email"
                    ? "Email Address"
                    : field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                </FormLabel>
                <FormControl>
                  <Input
                    required
                    type={field.name === "password" ? "password" : "text"}
                    {...field}
                    className="
                      paragraph-regular min-h-12
                      text-[#151821] dark:text-[#dce3f1]
                      dark:bg-[#151821]
                      placeholder:text-neutral-400
                      border border-neutral-300 dark:border-neutral-700
                      focus-visible:ring-2 focus-visible:ring-offset-0
                      focus-visible:ring-[#9334eb]
                      focus-visible:border-[#9334eb]
                    "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button
          disabled={submitting}
          className="
            min-h-12 w-full text-white
            bg-gradient-to-r from-[#9334eb] to-[#6b21a8]
            hover:opacity-95
            disabled:opacity-60 disabled:cursor-not-allowed
            focus-visible:ring-2 focus-visible:ring-[#9334eb]/50 focus-visible:ring-offset-0
            shadow-lg shadow-[#9334eb]/20
          "
        >
          {submitting
            ? buttonText === "Sign In"
              ? "Signing In..."
              : "Signing Up..."
            : buttonText}
        </Button>

        {formType === "SIGN_IN" ? (
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Belum punya akun?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-[#9334eb] hover:text-[#6b21a8]"
            >
              Sign up
            </Link>
          </p>
        ) : (
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Sudah punya akun?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-[#9334eb] hover:text-[#6b21a8]"
            >
              Sign in
            </Link>
          </p>
        )}
      </form>
    </Form>
  );
};

export default AuthForm;
