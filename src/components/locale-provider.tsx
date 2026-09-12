"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { en } from "@/lib/i18n/dictionaries/en";
import { bn } from "@/lib/i18n/dictionaries/bn";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/locale";

const dictionaries: Record<Locale, Dictionary> = { en, bn };

const LocaleContext = createContext<{ locale: Locale; dict: Dictionary } | null>(
  null
);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  // Dictionaries (including their function-valued entries) are imported
  // directly into the client bundle here, not passed down as a server prop —
  // functions can't cross the server/client boundary as props.
  const value = useMemo(() => ({ locale, dict: dictionaries[locale] }), [locale]);
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}
