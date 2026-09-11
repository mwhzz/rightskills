"use client";

import { useState } from "react";
import { checkoutAction } from "@/app/actions";
import { formatBdt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type MethodId = "bkash" | "nagad";

const methodNames: Record<MethodId, { en: string; bn: string }> = {
  bkash: { en: "bKash", bn: "বিকাশ" },
  nagad: { en: "Nagad", bn: "নগদ" },
};

const errorCopy: Record<string, string> = {
  method: "পেমেন্ট মাধ্যম বেছে নিন।",
  payer: "যে নাম্বার থেকে টাকা পাঠিয়েছেন সেটি দিন (01XXXXXXXXX)।",
};

export function CheckoutForm({
  totalBdt,
  error,
  bkashNumber,
  nagadNumber,
  defaultPayerNumber,
}: {
  totalBdt: number;
  error?: string;
  bkashNumber: string;
  nagadNumber: string;
  defaultPayerNumber: string;
}) {
  // Only offer a wallet the admin has actually set a number for.
  const wallets = (
    [
      { id: "bkash" as const, number: bkashNumber.trim() },
      { id: "nagad" as const, number: nagadNumber.trim() },
    ] satisfies { id: MethodId; number: string }[]
  ).filter((wallet) => wallet.number);

  const [method, setMethod] = useState<MethodId>(wallets[0]?.id ?? "bkash");
  const active = wallets.find((wallet) => wallet.id === method) ?? wallets[0];
  const name = methodNames[active?.id ?? "bkash"];

  if (!active) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          পেমেন্ট নাম্বার এখনো সেট করা হয়নি
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Payment number is not set yet. একটু পরে আবার চেষ্টা করুন।
        </p>
      </div>
    );
  }

  return (
    <form action={checkoutAction} className="space-y-5">
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          টাকা পাঠান
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          নিচের নাম্বারে {formatBdt(totalBdt)} Send Money করুন।
        </p>

        {wallets.length > 1 ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {wallets.map((wallet) => {
              const selected = method === wallet.id;
              return (
                <label
                  key={wallet.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 transition-colors",
                    selected ? "border-primary/50 bg-primary/5" : "hover:bg-muted/60"
                  )}
                >
                  <input
                    type="radio"
                    name="method"
                    value={wallet.id}
                    checked={selected}
                    onChange={() => setMethod(wallet.id)}
                    className="accent-primary"
                  />
                  <span className="font-heading text-lg font-semibold">
                    {methodNames[wallet.id].en}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <input type="hidden" name="method" value={active.id} />
        )}

        <div className="mt-4 rounded-xl border bg-muted/40 px-4 py-3.5">
          <p className="text-xs text-muted-foreground">
            {name.bn} নাম্বার · {formatBdt(totalBdt)}
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold tracking-wide">
            {active.number}
          </p>
        </div>

        <div className="mt-5">
          <label htmlFor="payerNumber" className="text-sm font-medium">
            আপনার {name.bn} নাম্বার
          </label>
          <input
            id="payerNumber"
            name="payerNumber"
            type="tel"
            inputMode="numeric"
            required
            defaultValue={defaultPayerNumber}
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
            className="mt-1.5 h-11 w-full rounded-lg border bg-background px-3 text-sm"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            যে নাম্বার থেকে টাকা পাঠিয়েছেন।
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
        অর্ডার করুন · {formatBdt(totalBdt)}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        অর্ডার করার পর আমরা আপনার পেমেন্ট রিভিউ করে কোর্সটি আনলক করে দেবো।
      </p>
    </form>
  );
}
