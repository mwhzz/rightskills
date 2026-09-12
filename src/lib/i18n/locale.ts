export type Locale = "bn" | "en";

export const LOCALE_COOKIE = "lang";
export const DEFAULT_LOCALE: Locale = "bn";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "bn" || value === "en";
}
