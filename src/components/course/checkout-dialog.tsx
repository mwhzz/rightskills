"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Infinity, XIcon } from "lucide-react";
import { courseCheckoutAction } from "@/app/actions";
import { useLocale } from "@/components/locale-provider";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-[#24160f]/55 supports-backdrop-filter:backdrop-blur-md"
        className="max-h-[min(92vh,820px)] gap-0 overflow-y-auto rounded-[1.75rem] bg-[#fffaf6] p-0 text-base shadow-[0_40px_90px_-36px_rgba(60,24,8,0.55)] ring-0 duration-300 sm:max-w-[27.5rem]"
      >
        <form action={courseCheckoutAction}>
          <input type="hidden" name="slug" value={slug} />
          <div className="relative bg-[linear-gradient(180deg,#ffe8d6_0%,#fffaf6_78%)] px-6 pt-6 pb-5">
            <DialogClose
              render={
                <button
                  type="button"
                  className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-white/80 text-foreground/60 ring-1 ring-black/5 transition hover:text-foreground"
                />
              }
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <DialogTitle className="max-w-[18rem] text-lg leading-snug font-semibold">
              {title}
            </DialogTitle>
            <div className="mt-3 flex items-end gap-2.5">
              <p className="font-heading text-[2.6rem] leading-none font-semibold tracking-tight">
                {priceLabel}
              </p>
              {originalPriceLabel ? (
                <p className="mb-1 text-sm text-muted-foreground line-through">
                  {originalPriceLabel}
                </p>
              ) : null}
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/15">
              <Infinity className="size-3.5" />
              {copy.lifetime}
            </p>
          </div>

          <div className="space-y-3.5 px-6 pt-1 pb-6">
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

            {active ? (
              <div className="pt-1">
                {wallets.length > 1 ? (
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#fff1e6] p-1">
                    {wallets.map((wallet) => {
                      const selected = method === wallet.id;
                      return (
                        <label
                          key={wallet.id}
                          className={cn(
                            "flex cursor-pointer items-center justify-center rounded-[0.9rem] px-3 py-2.5 text-sm font-semibold transition",
                            selected
                              ? "bg-white text-foreground shadow-sm"
                              : "text-muted-foreground"
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
                <div className="mt-3 rounded-2xl bg-white px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(80,40,10,0.08)]">
                  <p className="text-xs text-muted-foreground">
                    {copy.sendTo(active.label, priceLabel)}
                  </p>
                  <p className="mt-1 font-heading text-[1.7rem] leading-none font-semibold tracking-[0.04em]">
                    {active.number}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-destructive">{copy.errors.method}</p>
            )}

            {errorText ? (
              <p className="rounded-2xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {errorText}
              </p>
            ) : null}

            <SubmitButton label={copy.placeOrder} disabled={!active} />
            <p className="text-center text-xs leading-5 text-muted-foreground">{copy.after}</p>
          </div>
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
      <span className="text-[0.8rem] font-medium text-foreground/80">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="mt-1.5 h-12 w-full rounded-2xl bg-white px-4 text-[15px] shadow-[inset_0_0_0_1px_rgba(80,40,10,0.1)] outline-none placeholder:text-muted-foreground/60 focus:shadow-[inset_0_0_0_1.5px_var(--primary)]"
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
      className={cn(
        buttonVariants({ size: "lg" }),
        "mt-1 h-12 w-full rounded-2xl text-base font-semibold shadow-[0_14px_28px_-16px_rgba(210,90,20,0.9)]"
      )}
    >
      {pending ? "…" : label}
    </button>
  );
}
