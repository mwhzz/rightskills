"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Infinity } from "lucide-react";
import { courseCheckoutAction } from "@/app/actions";
import { useLocale } from "@/components/locale-provider";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MethodId = "bkash" | "nagad";

export function CourseCheckoutDialog({
  slug,
  title,
  priceLabel,
  originalPriceLabel,
  bkashNumber,
  nagadNumber,
  defaults,
  initialOpen,
  error,
}: {
  slug: string;
  title: string;
  priceLabel: string;
  originalPriceLabel?: string;
  bkashNumber: string;
  nagadNumber: string;
  defaults: { name: string; phone: string; email: string; profession: string };
  initialOpen: boolean;
  error?: string;
}) {
  const { dict } = useLocale();
  const [open, setOpen] = useState(initialOpen);
  const wallets = (
    [
      { id: "bkash" as const, number: bkashNumber.trim(), label: "bKash" },
      { id: "nagad" as const, number: nagadNumber.trim(), label: "Nagad" },
    ] satisfies { id: MethodId; number: string; label: string }[]
  ).filter((wallet) => wallet.number);
  const [method, setMethod] = useState<MethodId>(wallets[0]?.id ?? "bkash");
  const active = wallets.find((wallet) => wallet.id === method) ?? wallets[0];
  const copy = dict.courseCheckout;
  const errorText = error ? copy.errors[error as keyof typeof copy.errors] : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          buttonVariants({ size: "lg", variant: "outline" }),
          "h-12 w-full text-base"
        )}
      >
        {dict.cta.buyNow}
      </button>
      <DialogContent className="max-h-[min(92vh,760px)] gap-0 overflow-y-auto p-0 sm:max-w-[26rem]">
        <form action={courseCheckoutAction} className="px-5 pt-5 pb-5">
          <input type="hidden" name="slug" value={slug} />
          <p className="pr-8 font-heading text-lg leading-snug font-semibold">{title}</p>
          <div className="mt-2 flex items-end gap-2">
            <p className="font-heading text-3xl font-semibold tracking-tight">{priceLabel}</p>
            {originalPriceLabel ? (
              <p className="mb-1 text-sm text-muted-foreground line-through">
                {originalPriceLabel}
              </p>
            ) : null}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Infinity className="size-4 text-primary" />
            {copy.lifetime}
          </p>

          <div className="mt-5 space-y-3">
            <Field label={copy.name} name="name" defaultValue={defaults.name} autoComplete="name" required />
            <Field
              label={copy.phone}
              name="phone"
              defaultValue={defaults.phone}
              type="tel"
              inputMode="numeric"
              placeholder="01XXXXXXXXX"
              autoComplete="tel"
              required
            />
            <Field
              label={copy.email}
              name="email"
              defaultValue={defaults.email}
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
            <Field
              label={copy.profession}
              name="profession"
              defaultValue={defaults.profession}
              placeholder={copy.professionPlaceholder}
              autoComplete="organization-title"
              required
            />
          </div>

          {active ? (
            <div className="mt-5">
              {wallets.length > 1 ? (
                <div className="grid grid-cols-2 gap-2">
                  {wallets.map((wallet) => {
                    const selected = method === wallet.id;
                    return (
                      <label
                        key={wallet.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold",
                          selected ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted/60"
                        )}
                      >
                        <input
                          type="radio"
                          name="method"
                          value={wallet.id}
                          checked={selected}
                          onChange={() => setMethod(wallet.id)}
                          className="sr-only"
                        />
                        {wallet.label}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <input type="hidden" name="method" value={active.id} />
              )}
              <div className="mt-3 rounded-xl border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {copy.sendTo(active.label, priceLabel)}
                </p>
                <p className="mt-1 font-heading text-2xl font-semibold tracking-wide">
                  {active.number}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-destructive">{copy.errors.method}</p>
          )}

          {errorText ? (
            <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {errorText}
            </p>
          ) : null}

          <SubmitButton label={copy.placeOrder} disabled={!active} />
          <p className="mt-2 text-center text-xs text-muted-foreground">{copy.after}</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text";
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="mt-1.5 h-11 w-full rounded-lg border bg-background px-3 text-sm"
      />
    </label>
  );
}

function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={cn(buttonVariants({ size: "lg" }), "mt-5 h-12 w-full text-base")}
    >
      {pending ? "…" : label}
    </button>
  );
}
