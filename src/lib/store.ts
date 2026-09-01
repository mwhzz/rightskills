export const CART_KEY = "skills-bd-cart";
export const PURCHASES_KEY = "skills-bd-purchases";
export const PROGRESS_KEY = "skills-bd-progress";
export const PROFILE_KEY = "skills-bd-profile";

export type PaymentMethod = "bkash" | "nagad" | "card";

export type Purchase = {
  orderId: string;
  slugs: string[];
  totalBdt: number;
  method: PaymentMethod;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
};

export type LearnerProfile = {
  name: string;
  phone: string;
  email: string;
};

export type LessonProgress = Record<string, string[]>;

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function makeOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SB-${stamp}-${rand}`;
}
