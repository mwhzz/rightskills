"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Smartphone, Wallet } from "lucide-react";
import { saveSettingsAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatBdt } from "@/lib/format";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 rounded-lg border border-input bg-background px-3 font-mono text-base tracking-wide md:text-sm";

export function SettingsForm({
  bkashNumber,
  nagadNumber,
  payInstructions,
  saved,
}: {
  bkashNumber: string;
  nagadNumber: string;
  payInstructions: string;
  saved?: boolean;
}) {
  const [bkash, setBkash] = useState(bkashNumber);
  const [nagad, setNagad] = useState(nagadNumber);
  const [instructions, setInstructions] = useState(payInstructions);
  const [method, setMethod] = useState<"bkash" | "nagad">("bkash");
  const [state, formAction, pending] = useActionState(saveSettingsAction, null);

  const payTo = method === "nagad" ? nagad : bkash;
  const methodLabel = method === "nagad" ? "Nagad" : "bKash";
  const missing = !bkash || !nagad;

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        {saved ? (
          <p className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            Saved. Students will see these numbers on the next checkout.
          </p>
        ) : null}
        {state?.error ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        {missing ? (
          <p className="rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">
            One or both wallets are empty. Checkout will say “Number not set yet”
            until you add them.
          </p>
        ) : null}

        <section className="rounded-2xl border bg-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                Payment wallets
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Personal bKash / Nagad numbers for Send Money. Put the number
                students should pay — not a merchant QR.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-2xl border bg-background p-4">
              <Label htmlFor="bkashNumber" className="text-sm">
                bKash
              </Label>
              <Input
                id="bkashNumber"
                name="bkashNumber"
                inputMode="numeric"
                placeholder="017XXXXXXXX"
                value={bkash}
                onValueChange={setBkash}
                className={fieldClass}
              />
              <p className="text-xs text-muted-foreground">11-digit BD mobile</p>
            </div>
            <div className="space-y-2 rounded-2xl border bg-background p-4">
              <Label htmlFor="nagadNumber" className="text-sm">
                Nagad
              </Label>
              <Input
                id="nagadNumber"
                name="nagadNumber"
                inputMode="numeric"
                placeholder="018XXXXXXXX"
                value={nagad}
                onValueChange={setNagad}
                className={fieldClass}
              />
              <p className="text-xs text-muted-foreground">11-digit BD mobile</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Smartphone className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                Instructions
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Shown under the number after checkout. Tell them the amount,
                the reference, and where to paste the TrxID.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <Label htmlFor="payInstructions">What students should do</Label>
            <Textarea
              id="payInstructions"
              name="payInstructions"
              rows={5}
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              className="min-h-32 text-base md:text-sm"
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={pending}
          className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-base")}
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <p className="mb-3 text-xs tracking-[0.16em] text-muted-foreground uppercase">
          Student checkout
        </p>
        <div className="rounded-2xl border bg-card p-5 text-center">
          <CheckCircle2 className="mx-auto size-10 text-primary" />
          <p className="mt-3 font-heading text-xl font-semibold">
            Send money to complete
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Order RS-DEMO · {formatBdt(1990)} via {methodLabel}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {(["bkash", "nagad"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMethod(item)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  method === item
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:border-primary/40"
                )}
              >
                {item === "bkash" ? "bKash" : "Nagad"}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border bg-muted/40 px-4 py-4 text-left text-sm">
            <p>
              Send <span className="font-semibold">{formatBdt(1990)}</span> to
            </p>
            <p className="mt-1 font-heading text-2xl font-semibold tracking-wide">
              {payTo || "Number not set yet"}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
              {instructions || "Instructions appear here."}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          This is the same card students see after they place an order.
        </p>
      </aside>
    </form>
  );
}
