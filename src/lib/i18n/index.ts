import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./locale";
import { en, type Dictionary } from "./dictionaries/en";
import { bn } from "./dictionaries/bn";

export type { Dictionary } from "./dictionaries/en";
export type { Locale } from "./locale";

const dictionaries: Record<Locale, Dictionary> = { en, bn };

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}
