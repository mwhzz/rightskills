"use client";

import { useState } from "react";
import { AuthForm } from "@/components/auth-form";
import { cn } from "@/lib/utils";

export function CheckoutAuth({
  error,
  initialMode = "register",
}: {
  error?: string;
  initialMode?: "login" | "register";
}) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  return (
    <div className="rounded-2xl border bg-card p-6">
      <p className="text-xs font-medium tracking-[0.14em] text-primary uppercase">
        Almost there
      </p>
      <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
        Save the order to an account
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Your cart is already saved. Create an account or log in, then place the
        order and send money.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-1 rounded-full border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setMode("register")}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "register"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Create account
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "login"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Log in
        </button>
      </div>
      <AuthForm
        key={mode}
        mode={mode}
        error={error}
        next="/checkout"
        embedded
      />
    </div>
  );
}
