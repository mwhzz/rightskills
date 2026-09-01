import { cookies } from "next/headers";
import { CART_KEY } from "@/lib/store";

const cookieOpts = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
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

export async function setCartCookie(cart: string[]) {
  const store = await cookies();
  store.set(CART_KEY, JSON.stringify(cart), cookieOpts);
}
