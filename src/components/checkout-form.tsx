"use client";

import { useState } from "react";
import { checkoutAction } from "@/app/actions";
import { formatBdt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

type MethodId = "bkash" | "nagad";

const methodNames: Record<MethodId, { en: string; bn: string }> = {
  bkash: { en: "bKash", bn: "বিকাশ" },
  nagad: { en: "Nagad", bn: "নগদ" },
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
  const { locale, dict } = useLocale();
  const errorCopy: Record<string, string> = {
    method: dict.checkoutForm.errorMethod,
    payer: dict.checkoutForm.errorPayer,
  };

  // Only offer a wallet the admin has actually set a number for.
  const wallets = (
    [
      { id: "bkash" as const, number: bkashNumber.trim() },
      { id: "nagad" as const, number: nagadNumber.trim() },
    ] satisfies { id: MethodId; number: string }[]
  ).filter((wallet) => wallet.number);

  const [method, setMethod] = useState<MethodId>(wallets[0]?.id ?? "bkash");
  const active = wallets.find((wallet) => wallet.id === method) ?? wallets[0];
  const name = methodNames[active?.id ?? "bkash"][locale];

  if (!active) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {dict.checkoutForm.noWalletTitle}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {dict.checkoutForm.noWalletBody}
        </p>
      </div>
    );
  }

  return (
    <form action={checkoutAction} className="space-y-5">
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {dict.checkoutForm.sendMoneyTitle}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {dict.checkoutForm.sendMoneyBody(formatBdt(totalBdt))}
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
                    {methodNames[wallet.id][locale]}
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
            {dict.checkoutForm.numberLabel(name, formatBdt(totalBdt))}
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold tracking-wide">
            {active.number}
          </p>
        </div>

        <div className="mt-5">
          <label htmlFor="payerNumber" className="text-sm font-medium">
            {dict.checkoutForm.yourNumberLabel(name)}
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
            {dict.checkoutForm.payerHint}
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
        {dict.checkoutForm.placeOrder(formatBdt(totalBdt))}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        {dict.checkoutForm.afterOrderNote}
      </p>
    </form>
  );
}
