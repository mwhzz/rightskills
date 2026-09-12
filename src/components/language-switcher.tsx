"use client";

import { usePathname } from "next/navigation";
import { setLocaleAction } from "@/app/actions";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  const target = locale === "bn" ? "en" : "bn";
  const label = locale === "bn" ? dict.nav.switchToEnglish : dict.nav.switchToBangla;

  return (
    <form action={setLocaleAction}>
      <input type="hidden" name="locale" value={target} />
      <input type="hidden" name="next" value={pathname || "/"} />
      <button
        type="submit"
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-full border border-border/70 bg-background/70 px-3 text-sm font-medium text-foreground transition hover:border-primary/50 hover:text-primary",
          className
        )}
      >
        {label}
      </button>
    </form>
  );
}
