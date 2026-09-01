"use server";

import { redirect } from "next/navigation";
import { courses } from "@/lib/courses";
import {
  getCart,
  getOwnedSlugs,
  getProgress,
  getPurchases,
  setCartCookie,
  setProgressCookie,
  setPurchasesCookie,
} from "@/lib/session";
import { makeOrderId, type PaymentMethod } from "@/lib/store";

export async function addToCartAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  if (!courses.some((course) => course.slug === slug)) return;
  const owned = await getOwnedSlugs();
  if (owned.includes(slug)) {
    redirect(`/learn/${slug}`);
  }
  const cart = await getCart();
  if (!cart.includes(slug)) {
    await setCartCookie([...cart, slug]);
  }
  redirect("/cart");
}

export async function buyNowAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  if (!courses.some((course) => course.slug === slug)) return;
  const owned = await getOwnedSlugs();
  if (owned.includes(slug)) {
    redirect(`/learn/${slug}`);
  }
  const cart = await getCart();
  if (!cart.includes(slug)) {
    await setCartCookie([...cart, slug]);
  }
  redirect("/checkout");
}

export async function removeFromCartAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const cart = await getCart();
  await setCartCookie(cart.filter((item) => item !== slug));
}

export async function checkoutAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const method = String(formData.get("method") ?? "bkash") as PaymentMethod;

  if (name.length < 3) {
    redirect("/checkout?error=name");
  }
  if (!/^01[3-9]\d{8}$/.test(phone)) {
    redirect("/checkout?error=phone");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/checkout?error=email");
  }
  if (!["bkash", "nagad", "card"].includes(method)) {
    redirect("/checkout?error=method");
  }

  const owned = await getOwnedSlugs();
  const cart = (await getCart()).filter((slug) => !owned.includes(slug));
  if (cart.length === 0) {
    redirect("/cart");
  }

  const totalBdt = courses
    .filter((course) => cart.includes(course.slug))
    .reduce((sum, course) => sum + course.priceBdt, 0);

  const order = {
    orderId: makeOrderId(),
    slugs: cart,
    totalBdt,
    method,
    name,
    phone,
    email,
    createdAt: new Date().toISOString(),
  };

  const purchases = await getPurchases();
  await setPurchasesCookie([order, ...purchases]);
  await setCartCookie([]);
  redirect(`/checkout/success?order=${order.orderId}`);
}

export async function toggleLessonAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const owned = await getOwnedSlugs();
  if (!owned.includes(slug) || !lessonId) return;

  const progress = await getProgress();
  const done = new Set(progress[slug] ?? []);
  if (done.has(lessonId)) done.delete(lessonId);
  else done.add(lessonId);
  await setProgressCookie({ ...progress, [slug]: Array.from(done) });
}
