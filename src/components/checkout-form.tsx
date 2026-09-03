"use client";

import { useState } from "react";
import { checkoutAction } from "@/app/actions";
import { formatBdt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const methods = [
  {
    id: "bkash",
    name: "bKash",
    hint: "Send Money in the bKash app. Use the order ID as the reference.",
  },
  {
    id: "nagad",
    name: "Nagad",
    hint: "Send Money in the Nagad app. Use the order ID as the reference.",
  },
] as const;

const errorCopy: Record<string, string> = {
  method: "Choose a payment method.",
};

export function CheckoutForm({
  totalBdt,
  error,
  bkashNumber,
  nagadNumber,
}: {
  totalBdt: number;
  error?: string;
  bkashNumber: string;
  nagadNumber: string;
}) {
  const [method, setMethod] = useState<"bkash" | "nagad">("bkash");
  const number = method === "nagad" ? nagadNumber : bkashNumber;

  return (
    <form action={checkoutAction} className="space-y-6">
      <div className="rounded-2xl border bg-card p-4 sm:p-6">
        <p className="text-xs font-medium tracking-[0.14em] text-primary uppercase">
          Step 1
        </p>
        <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
          Choose how you will pay
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Placing the order does not charge you. Next you Send Money yourself,
          then paste the TrxID.
        </p>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-3">
          {methods.map((item) => {
            const selected = method === item.id;
            const wallet = item.id === "nagad" ? nagadNumber : bkashNumber;
            return (
              <label
                key={item.id}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-sm transition-colors sm:flex-row sm:gap-3 sm:rounded-2xl sm:p-4",
                  selected
                    ? "border-primary/50 bg-primary/5"
                    : "hover:bg-muted/60"
                )}
              >
                <input
                  type="radio"
                  name="method"
                  value={item.id}
                  checked={selected}
                  onChange={() => setMethod(item.id)}
                  className="mt-0.5 size-4 accent-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-heading text-base font-semibold sm:text-lg">
                      {item.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {wallet || "Number not set yet"}
                    </span>
                  </span>
                  <span className="mt-1 hidden text-muted-foreground sm:block">
                    {item.hint}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <div className="mt-5 rounded-xl border bg-muted/40 px-4 py-3 text-sm">
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            You will send {formatBdt(totalBdt)} to
          </p>
          <p className="mt-1 font-heading text-xl font-semibold tracking-wide">
            {number || "Number not set yet — contact support after placing the order"}
          </p>
        </div>
      </div>

      {error && errorCopy[error] ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorCopy[error]}
        </p>
      ) : null}

      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-12 w-full")}
      >
        Place order · {formatBdt(totalBdt)}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        You will get an order ID on the next screen. Send the exact amount, then
        paste the TrxID.
      </p>
    </form>
  );
}
