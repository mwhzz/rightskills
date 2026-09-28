"use client";

import { useState } from "react";
import { formatBdt } from "@/lib/format";
import { useLocale } from "@/components/locale-provider";
import type { PromoPreview } from "@/lib/promo";
import { cn } from "@/lib/utils";

export function PromoCodeField({
  preview,
  onApplied,
  tone,
}: {
  preview: (code: string) => Promise<PromoPreview>;
  onApplied: (quote: Extract<PromoPreview, { ok: true }> | null) => void;
  tone: "sheet" | "card";
}) {
  const { dict } = useLocale();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);

  async function apply() {
    const next = code.trim();
    if (!next) {
      setApplied("");
      setMessage("");
      setFailed(false);
      onApplied(null);
      return;
    }
    setPending(true);
    setMessage("");
    setFailed(false);
    try {
      const result = await preview(next);
      if (!result.ok) {
        setApplied("");
        onApplied(null);
        setFailed(true);
        setMessage(result.reason === "used" ? dict.promo.used : dict.promo.invalid);
        return;
      }
      setCode(result.code);
      setApplied(result.code);
      onApplied(result);
      setMessage(dict.promo.applied(result.code, formatBdt(result.discountBdt)));
    } finally {
      setPending(false);
    }
  }

  const sheet = tone === "sheet";

  return (
    <div
      className={sheet ? "border-t border-[#f1e4d8] px-4 py-2.5" : undefined}
    >
      <label htmlFor="promo" className={sheet ? "text-[11px] font-medium tracking-wide text-[#8d7363]" : "text-sm font-medium"}>
        {dict.promo.label}
      </label>
      <div className={cn("flex items-center gap-2", sheet ? "mt-1" : "mt-1.5")}>
        <input
          id="promo"
          name="promo"
          value={code}
          onChange={(event) => {
            const value = event.target.value;
            setCode(value);
            if (applied && value.trim().toUpperCase().replace(/\s+/g, "") !== applied) {
              setApplied("");
              setMessage("");
              setFailed(false);
              onApplied(null);
            }
          }}
          placeholder={dict.promo.placeholder}
          autoCapitalize="characters"
          autoComplete="off"
          className={
            sheet
              ? "h-7 min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-[#c3b1a3]"
              : "h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm uppercase"
          }
        />
        <button
          type="button"
          onClick={apply}
          disabled={pending}
          className="shrink-0 rounded-full bg-[#2a1810] px-3.5 py-1.5 text-xs font-semibold text-[#fff6ee] disabled:opacity-60"
        >
          {pending ? dict.promo.applying : dict.promo.apply}
        </button>
      </div>
      <p className={cn("mt-1 text-xs", failed ? "text-destructive" : "text-[#8d7363]")}>
        {message || dict.promo.hint}
      </p>
    </div>
  );
}
