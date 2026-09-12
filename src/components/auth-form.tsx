"use client";

import Link from "next/link";
import { loginAction, registerAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function AuthForm({
  mode,
  error,
  next,
  embedded = false,
}: {
  mode: "login" | "register";
  error?: string;
  next?: string;
  embedded?: boolean;
}) {
  const { dict } = useLocale();
  const action = mode === "login" ? loginAction : registerAction;
  const nextValue = next || "";
  const nextQuery = nextValue
    ? `?next=${encodeURIComponent(nextValue)}`
    : "";

  return (
    <form action={action} className={cn(embedded ? "mt-4 space-y-4" : "mt-8 space-y-4")}>
      <input type="hidden" name="next" value={nextValue} />
      {mode === "register" ? (
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            {dict.auth.nameLabel} <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            autoComplete="name"
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      ) : null}
      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          {dict.auth.phoneLabel} {mode === "register" ? <span className="text-destructive">*</span> : null}
        </label>
        <input
          id="phone"
          name="phone"
          required
          pattern="01[3-9][0-9]{8}"
          placeholder="017XXXXXXXX"
          inputMode="numeric"
          className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      {mode === "register" ? (
        <div className="space-y-1.5">
          <label htmlFor="profession" className="text-sm font-medium">
            {dict.auth.professionLabel} <span className="text-destructive">*</span>
          </label>
          <input
            id="profession"
            name="profession"
            required
            minLength={2}
            placeholder={dict.auth.professionPlaceholder}
            autoComplete="organization-title"
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      ) : null}
      <div className="space-y-1.5">
        <label htmlFor="pin" className="text-sm font-medium">
          {dict.auth.pinLabel}
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          required
          minLength={4}
          maxLength={4}
          pattern="[0-9]{4}"
          placeholder="••••"
          className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-center font-heading text-lg tracking-[0.5em] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      {error && dict.auth.errors[error as keyof typeof dict.auth.errors] ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {dict.auth.errors[error as keyof typeof dict.auth.errors]}
        </p>
      ) : null}
      <button type="submit" className={cn(buttonVariants({ size: "lg" }), "h-10 w-full")}>
        {mode === "login"
          ? embedded
            ? dict.auth.loginSubmitEmbedded
            : dict.auth.loginSubmit
          : embedded
            ? dict.auth.registerSubmitEmbedded
            : dict.auth.registerSubmit}
      </button>
      {embedded ? null : (
        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              {dict.auth.newHere}{" "}
              <Link
                href={`/register${nextQuery}`}
                className="font-medium text-foreground hover:underline"
              >
                {dict.auth.createAccountLink}
              </Link>
            </>
          ) : (
            <>
              {dict.auth.alreadyHaveAccount}{" "}
              <Link
                href={`/login${nextQuery}`}
                className="font-medium text-foreground hover:underline"
              >
                {dict.auth.loginLink}
              </Link>
            </>
          )}
        </p>
      )}
    </form>
  );
}
