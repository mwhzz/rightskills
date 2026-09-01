import { cookies } from "next/headers";
import {
  CART_KEY,
  PROGRESS_KEY,
  PURCHASES_KEY,
  type LessonProgress,
  type Purchase,
} from "@/lib/store";

const cookieOpts = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getCart(): Promise<string[]> {
  const store = await cookies();
  return parseJson<string[]>(store.get(CART_KEY)?.value, []);
}

export async function getPurchases(): Promise<Purchase[]> {
  const store = await cookies();
  return parseJson<Purchase[]>(store.get(PURCHASES_KEY)?.value, []);
}

export async function getProgress(): Promise<LessonProgress> {
  const store = await cookies();
  return parseJson<LessonProgress>(store.get(PROGRESS_KEY)?.value, {});
}

export async function getOwnedSlugs(): Promise<string[]> {
  const purchases = await getPurchases();
  return Array.from(new Set(purchases.flatMap((order) => order.slugs)));
}

export async function setCartCookie(cart: string[]) {
  const store = await cookies();
  store.set(CART_KEY, JSON.stringify(cart), cookieOpts);
}

export async function setPurchasesCookie(purchases: Purchase[]) {
  const store = await cookies();
  store.set(PURCHASES_KEY, JSON.stringify(purchases), cookieOpts);
}

export async function setProgressCookie(progress: LessonProgress) {
  const store = await cookies();
  store.set(PROGRESS_KEY, JSON.stringify(progress), cookieOpts);
}
