"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  clearSession,
  createSession,
  getSession,
  normalizePhone,
  requireRole,
  requireUser,
  safeNextPath,
  normalizePin,
} from "@/lib/auth";
import { getCart, setCartCookie } from "@/lib/session";
import {
  clearPublicCache,
  getOwnedSlugsForUser,
  getPublishedCourse,
} from "@/lib/queries";
import { makeOrderId, type PaymentMethod } from "@/lib/store";
import {
  assertImageFile,
  isUploadFile,
  removeCoverImage,
  removeInstructorPhoto,
  removeUpload,
  saveCoverImage,
  saveInstructorPhoto,
  saveBannerImage,
  saveOfferImage,
  saveLessonResource,
  saveLessonVideo,
} from "@/lib/uploads";
import { initialsFromName, slugify } from "@/lib/slug";
import {
  clampBannerDuration,
  sanitizeBannerImage,
  type HomeBanner,
} from "@/lib/home-banners";
import {
  offerShape,
  sanitizeOfferHref,
  sanitizeOfferImage,
  OFFER_MAX_ITEMS,
  type HomeOffer,
} from "@/lib/home-offers";
import { categories, levels } from "@/lib/courses";
import { normalizeVideoInput } from "@/lib/video";
import { refreshCourseRating } from "@/lib/reviews";

function authFail(mode: "login" | "register", code: string, next: string): never {
  if (next.startsWith("/checkout")) {
    redirect(`/checkout?auth=${mode}&error=${code}`);
  }
  const query = new URLSearchParams({ error: code });
  if (next.startsWith("/")) query.set("next", next);
  redirect(`/${mode}?${query.toString()}`);
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const profession = String(formData.get("profession") ?? "").trim();
  const pin = normalizePin(String(formData.get("pin") ?? formData.get("password") ?? ""));
  const next = String(formData.get("next") ?? "/account");

  if (name.length < 2) authFail("register", "name", next);
  if (!phone) authFail("register", "phone", next);
  if (profession.length < 2) authFail("register", "profession", next);
  if (!pin) authFail("register", "pin", next);

  const exists = await prisma.user.findUnique({ where: { phone } });
  if (exists) authFail("register", "taken", next);

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      profession,
      passwordHash: await bcrypt.hash(pin, 12),
      role: Role.student,
    },
  });
  await createSession({
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
  });
  redirect(safeNextPath(next, user.role));
}

export async function loginAction(formData: FormData) {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const pin = normalizePin(String(formData.get("pin") ?? formData.get("password") ?? ""));
  const next = String(formData.get("next") ?? "");
  if (!phone) authFail("login", "phone", next);
  if (!pin) authFail("login", "pin", next);

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !(await bcrypt.compare(pin, user.passwordHash))) {
    authFail("login", "invalid", next);
  }
  await createSession({
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
  });
  redirect(safeNextPath(next, user.role));
}

export async function logoutAction() {
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function addToCartAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const course = await getPublishedCourse(slug);
  if (!course) return;
  const session = await getSession();
  if (session) {
    const owned = await getOwnedSlugsForUser(session.id);
    if (owned.includes(slug)) redirect(`/learn/${slug}`);
  }
  const cart = await getCart();
  if (!cart.includes(slug)) await setCartCookie([...cart, slug]);
  redirect("/cart");
}

export async function buyNowAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const course = await getPublishedCourse(slug);
  if (!course) return;
  const session = await getSession();
  if (session) {
    const owned = await getOwnedSlugsForUser(session.id);
    if (owned.includes(slug)) redirect(`/learn/${slug}`);
  }
  const cart = await getCart();
  if (!cart.includes(slug)) await setCartCookie([...cart, slug]);
  redirect("/checkout");
}

export async function removeFromCartAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const cart = await getCart();
  await setCartCookie(cart.filter((item) => item !== slug));
}

export async function checkoutAction(formData: FormData) {
  const user = await getSession();
  if (!user) redirect("/checkout");
  const method = String(formData.get("method") ?? "bkash") as PaymentMethod;
  if (!["bkash", "nagad", "card"].includes(method)) {
    redirect("/checkout?error=method");
  }
  const payerNumber = normalizePhone(String(formData.get("payerNumber") ?? ""));
  if (!payerNumber) redirect("/checkout?error=payer");

  const owned = await getOwnedSlugsForUser(user.id);
  const cart = (await getCart()).filter((slug) => !owned.includes(slug));
  if (cart.length === 0) redirect("/cart");

  const dbCourses = await prisma.course.findMany({
    where: { slug: { in: cart }, published: true },
  });
  if (dbCourses.length === 0) redirect("/cart");

  const totalBdt = dbCourses.reduce((sum, course) => sum + course.priceBdt, 0);
  const order = await prisma.order.create({
    data: {
      orderId: makeOrderId(),
      userId: user.id,
      totalBdt,
      method,
      payerNumber,
      status: "pending",
      items: {
        create: dbCourses.map((course) => ({
          courseId: course.id,
          priceBdt: course.priceBdt,
        })),
      },
    },
  });
  await setCartCookie([]);
  redirect(`/checkout/success?order=${order.orderId}`);
}

export async function submitTrxAction(formData: FormData) {
  const user = await requireUser("/account/orders");
  const orderId = String(formData.get("orderId") ?? "");
  const trxId = String(formData.get("trxId") ?? "").trim();
  const payerNumber = normalizePhone(String(formData.get("payerNumber") ?? ""));
  const from = String(formData.get("from") ?? "");
  const successPath = `/checkout/success?order=${encodeURIComponent(orderId)}`;
  if (trxId.length < 4) {
    redirect(from === "success" ? `${successPath}&error=trx` : `/account/orders?error=trx`);
  }

  const order = await prisma.order.findFirst({
    where: { orderId, userId: user.id },
  });
  if (!order) redirect("/account/orders");
  if (order.status === "paid") {
    redirect(from === "success" ? successPath : "/account/orders");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      trxId,
      status: "awaiting_review",
      ...(payerNumber ? { payerNumber } : {}),
    },
  });
  redirect(
    from === "success" ? `${successPath}&submitted=1` : "/account/orders?submitted=1"
  );
}

export async function submitReviewAction(formData: FormData) {
  const user = await requireUser("/learn");
  const slug = String(formData.get("slug") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const body = String(formData.get("body") ?? "").trim();
  const owned = await getOwnedSlugsForUser(user.id);
  if (!owned.includes(slug)) redirect(`/learn/${slug}`);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(`/learn/${slug}?review=rating`);
  }
  if (body.length < 12) redirect(`/learn/${slug}?review=short`);

  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) redirect("/learn");

  await prisma.courseReview.upsert({
    where: { courseId_userId: { courseId: course.id, userId: user.id } },
    update: { rating, body },
    create: { courseId: course.id, userId: user.id, rating, body },
  });
  await refreshCourseRating(course.id);
  redirect(`/learn/${slug}?review=saved`);
}

export async function toggleLessonAction(formData: FormData) {
  const user = await requireUser("/learn");
  const slug = String(formData.get("slug") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const owned = await getOwnedSlugsForUser(user.id);
  if (!owned.includes(slug) || !lessonId) return;

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  });
  if (existing) {
    await prisma.lessonProgress.delete({ where: { id: existing.id } });
  } else {
    await prisma.lessonProgress.create({
      data: { userId: user.id, lessonId, completed: true },
    });
  }
}

export async function approveOrderAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) redirect("/admin/orders");

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status: "paid" },
    });
    for (const item of order.items) {
      await tx.enrollment.upsert({
        where: {
          userId_courseId: { userId: order.userId, courseId: item.courseId },
        },
        update: {},
        create: { userId: order.userId, courseId: item.courseId },
      });
      await tx.course.update({
        where: { id: item.courseId },
        data: { students: { increment: 1 } },
      });
    }
  });
  redirect("/admin/orders");
}

export async function rejectOrderAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  await prisma.order.update({
    where: { id },
    data: { status: "rejected" },
  });
  redirect("/admin/orders");
}

export async function saveSettingsAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  await requireRole("admin");
  const bkashRaw = String(formData.get("bkashNumber") ?? "").trim();
  const nagadRaw = String(formData.get("nagadNumber") ?? "").trim();
  const payInstructions = String(formData.get("payInstructions") ?? "").trim();
  const bkashNumber = bkashRaw ? normalizePhone(bkashRaw) : "";
  const nagadNumber = nagadRaw ? normalizePhone(nagadRaw) : "";
  if (bkashRaw && !bkashNumber) {
    return { error: "Enter a valid bKash number (01XXXXXXXXX)." };
  }
  if (nagadRaw && !nagadNumber) {
    return { error: "Enter a valid Nagad number (01XXXXXXXXX)." };
  }
  if (!payInstructions) {
    return { error: "Add the instructions students read after checkout." };
  }
  await prisma.setting.upsert({
    where: { id: "default" },
    update: {
      bkashNumber: bkashNumber ?? "",
      nagadNumber: nagadNumber ?? "",
      payInstructions,
    },
    create: {
      id: "default",
      bkashNumber: bkashNumber ?? "",
      nagadNumber: nagadNumber ?? "",
      payInstructions,
      homeBanners: "[]",
      homeOffers: "{}",
    },
  });
  clearPublicCache();
  redirect("/admin/settings?saved=1");
}

async function bannersFromForm(
  value: unknown,
  device: "desktop" | "mobile",
  formData: FormData
): Promise<HomeBanner[]> {
  if (!Array.isArray(value)) return [];
  const banners: HomeBanner[] = [];
  for (const [index, item] of value.slice(0, 8).entries()) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const rawId = String(row.id ?? `${device}-${index}`);
    const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || `${device}-${index}`;
    const file = formData.get(`file-${device}-${rawId}`) ?? formData.get(`file-${device}-${id}`);
    let image = sanitizeBannerImage(String(row.image ?? ""));
    if (isUploadFile(file)) {
      try {
        image = await saveBannerImage(`${device}-${id}`, file);
      } catch {
        redirect("/admin/banners?error=photo");
      }
    }
    if (!image) continue;
    const hrefRaw = String(row.href ?? "").trim();
    const href =
      hrefRaw.startsWith("/") || hrefRaw.startsWith("https://")
        ? hrefRaw.slice(0, 200)
        : "";
    banners.push({
      id,
      image,
      href,
      durationSec: clampBannerDuration(row.durationSec),
    });
  }
  return banners;
}

export async function saveHomeBannersAction(formData: FormData) {
  await requireRole("admin");
  const raw = String(formData.get("banners") ?? "{}");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    redirect("/admin/banners?error=json");
  }
  const row =
    parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const desktop = await bannersFromForm(row.desktop, "desktop", formData);
  const mobile = await bannersFromForm(row.mobile, "mobile", formData);
  if (desktop.length === 0 && mobile.length === 0) {
    redirect("/admin/banners?error=empty");
  }

  const payload = { desktop, mobile };
  await prisma.setting.upsert({
    where: { id: "default" },
    update: { homeBanners: JSON.stringify(payload) },
    create: {
      id: "default",
      bkashNumber: "",
      nagadNumber: "",
      payInstructions:
        "Send the exact amount to the number below. Use your order ID as the reference, then paste the TrxID on your orders page.",
      homeBanners: JSON.stringify(payload),
      homeOffers: "{}",
    },
  });
  clearPublicCache();
  redirect("/admin/banners?saved=1");
}

async function offersFromForm(
  value: unknown,
  formData: FormData
): Promise<HomeOffer[]> {
  if (!Array.isArray(value)) return [];
  const offers: HomeOffer[] = [];
  for (const [index, item] of value.slice(0, OFFER_MAX_ITEMS).entries()) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const rawId = String(row.id ?? `offer-${index}`);
    const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || `offer-${index}`;
    const file = formData.get(`file-offer-${rawId}`) ?? formData.get(`file-offer-${id}`);
    let image = sanitizeOfferImage(String(row.image ?? ""));
    if (isUploadFile(file)) {
      try {
        image = await saveOfferImage(id, file);
      } catch {
        redirect("/admin/offers?error=photo");
      }
    }
    if (!image) continue;
    offers.push({ id, image, href: sanitizeOfferHref(row.href) });
  }
  return offers;
}

export async function saveHomeOffersAction(formData: FormData) {
  await requireRole("admin");
  const raw = String(formData.get("offers") ?? "{}");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    redirect("/admin/offers?error=json");
  }
  const row =
    parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const payload = {
    title: String(row.title ?? "").trim().slice(0, 120),
    shape: offerShape(row.shape),
    items: await offersFromForm(row.items, formData),
  };

  await prisma.setting.upsert({
    where: { id: "default" },
    update: { homeOffers: JSON.stringify(payload) },
    create: {
      id: "default",
      bkashNumber: "",
      nagadNumber: "",
      payInstructions:
        "Send the exact amount to the number below. Use your order ID as the reference, then paste the TrxID on your orders page.",
      homeBanners: "[]",
      homeOffers: JSON.stringify(payload),
    },
  });
  clearPublicCache();
  redirect("/admin/offers?saved=1");
}

export async function createTeacherAction(formData: FormData) {
  await requireRole("admin");
  const name = String(formData.get("name") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const pin = normalizePin(String(formData.get("pin") ?? formData.get("password") ?? ""));
  if (!name || !phone || !pin) redirect("/admin/users?error=1");

  await prisma.user.upsert({
    where: { phone },
    update: {
      name,
      role: Role.teacher,
      passwordHash: await bcrypt.hash(pin, 12),
    },
    create: {
      name,
      phone,
      role: Role.teacher,
      passwordHash: await bcrypt.hash(pin, 12),
    },
  });
  redirect("/admin/users?created=1");
}

export async function setUserPinAction(formData: FormData) {
  await requireRole("admin");
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const pin = normalizePin(String(formData.get("pin") ?? ""));
  if (!phone || !pin) redirect("/admin/users?error=1");
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) redirect("/admin/users?error=1");
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(pin, 12) },
  });
  redirect("/admin/users?pin=1");
}

export type SaveCourseState = { error: string } | null;

const HEX = /^#[0-9A-Fa-f]{6}$/;
const categoryIds = new Set<string>(categories.map((item) => item.id));
const levelSet = new Set<string>(levels);
const languageSet = new Set<string>(["English", "Bangla", "Bangla + English"]);
const patternSet = new Set<string>(["grid", "dots", "waves"]);

export async function saveCourseAction(
  _prev: SaveCourseState,
  formData: FormData
): Promise<SaveCourseState> {
  const user = await requireRole("admin", "teacher");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const banglaTitle = String(formData.get("banglaTitle") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const purchaseNote = String(formData.get("purchaseNote") ?? "").trim();
  const promoVideoRaw = String(formData.get("promoVideoUrl") ?? "").trim();
  const promoVideoUrl = promoVideoRaw ? normalizeVideoInput(promoVideoRaw) : "";
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "development");
  const levelRaw = String(formData.get("level") ?? "").trim();
  const level = !levelRaw ? "" : levelRaw;
  const language = String(formData.get("language") ?? "English");
  const priceBdt = Number(formData.get("priceBdt") ?? 0);
  const originalPriceBdtRaw = String(formData.get("originalPriceBdt") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const published =
    formData.get("published") === "on" ||
    formData.get("published") === "published";
  const instructorName = String(formData.get("instructorName") ?? "").trim();
  const instructorTitle = String(formData.get("instructorTitle") ?? "").trim();
  const instructorBio = String(formData.get("instructorBio") ?? "").trim();
  const coverFrom = String(formData.get("coverFrom") ?? "#EA6A1A").trim();
  const coverTo = String(formData.get("coverTo") ?? "#9A3412").trim();
  const coverPattern = String(formData.get("coverPattern") ?? "grid");
  const outcomes = String(formData.get("outcomes") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const includes = String(formData.get("includes") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);
  const photoFile = formData.get("instructorPhoto");
  const removePhoto = formData.get("removeInstructorPhoto") === "on";
  const coverFile = formData.get("coverImage");
  const removeCover = formData.get("removeCoverImage") === "on";
  let slug = slugify(String(formData.get("slug") ?? title));

  if (title.length < 3) return { error: "Give the course a title of at least 3 characters." };
  if (!slug) return { error: "Add a URL slug, or type a title so we can make one." };
  if (!categoryIds.has(category)) return { error: "Pick a valid category." };
  if (level && !levelSet.has(level)) return { error: "Pick a valid level." };
  if (!languageSet.has(language)) return { error: "Pick a valid language." };
  if (!Number.isFinite(priceBdt) || priceBdt < 1) {
    return { error: "Set a price of at least ৳1." };
  }
  const originalPriceBdt = originalPriceBdtRaw ? Number(originalPriceBdtRaw) : null;
  if (originalPriceBdt != null && (!Number.isFinite(originalPriceBdt) || originalPriceBdt <= priceBdt)) {
    return { error: "The original price must be higher than the sale price." };
  }
  if (!HEX.test(coverFrom) || !HEX.test(coverTo)) {
    return { error: "Cover colours must be hex values like #EA6A1A." };
  }
  if (!patternSet.has(coverPattern)) return { error: "Pick a cover pattern." };
  if (promoVideoRaw && !promoVideoUrl) {
    return {
      error:
        "That preview video link does not look right. Paste a full YouTube link, like https://www.youtube.com/watch?v=xxxxxxxxxxx",
    };
  }
  if (published) {
    if (!subtitle) return { error: "Add a subtitle before publishing." };
    if (description.length < 40) {
      return { error: "Write a longer description (40+ characters) before publishing." };
    }
  }
  if (isUploadFile(photoFile)) {
    try {
      assertImageFile(photoFile);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Could not use that instructor photo.",
      };
    }
  }
  if (isUploadFile(coverFile)) {
    try {
      assertImageFile(coverFile);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Could not use that course banner.",
      };
    }
  }

  const data = {
    title,
    banglaTitle: banglaTitle || title,
    subtitle,
    purchaseNote: purchaseNote.slice(0, 600),
    promoVideoUrl: promoVideoUrl || null,
    description,
    category,
    level,
    language,
    priceBdt: Math.round(priceBdt),
    originalPriceBdt: originalPriceBdt != null ? Math.round(originalPriceBdt) : null,
    featured,
    published,
    outcomes,
    includes,
    instructorName: instructorName || user.name,
    instructorTitle: instructorTitle || "Instructor",
    instructorBio,
    instructorInitials: initialsFromName(instructorName || user.name).slice(0, 3),
    coverFrom,
    coverTo,
    coverPattern,
    teacherId: user.role === "teacher" ? user.id : user.id,
  };

  if (id) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return { error: "That course is gone." };
    if (user.role === "teacher" && existing.teacherId !== user.id) {
      return { error: "You can only edit your own courses." };
    }
    let instructorPhoto = existing.instructorPhoto;
    if (isUploadFile(photoFile)) {
      instructorPhoto = await saveInstructorPhoto(id, photoFile);
    } else if (removePhoto) {
      await removeInstructorPhoto(id);
      instructorPhoto = null;
    }
    let coverImage = existing.coverImage;
    if (isUploadFile(coverFile)) {
      coverImage = await saveCoverImage(id, coverFile);
    } else if (removeCover) {
      await removeCoverImage(id);
      coverImage = null;
    }
    await prisma.course.update({
      where: { id },
      data: { ...data, instructorPhoto, coverImage, slug: existing.slug },
    });
    clearPublicCache();
    redirect(`/admin/courses/${id}`);
  }

  const clash = await prisma.course.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;
  const created = await prisma.course.create({
    data: { ...data, slug },
  });
  const createdMedia: { instructorPhoto?: string; coverImage?: string } = {};
  try {
    if (isUploadFile(photoFile)) {
      createdMedia.instructorPhoto = await saveInstructorPhoto(
        created.id,
        photoFile
      );
    }
    if (isUploadFile(coverFile)) {
      createdMedia.coverImage = await saveCoverImage(created.id, coverFile);
    }
    if (createdMedia.instructorPhoto || createdMedia.coverImage) {
      await prisma.course.update({
        where: { id: created.id },
        data: createdMedia,
      });
    }
  } catch (error) {
    clearPublicCache();
    return {
      error:
        error instanceof Error
          ? `Course saved, but the image failed: ${error.message}`
          : "Course saved, but the image failed. Try again.",
    };
  }
  clearPublicCache();
  redirect(`/admin/courses/${created.id}`);
}

export async function publishCourseAction(formData: FormData) {
  const user = await requireRole("admin", "teacher");
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) redirect("/admin/courses");
  if (user.role === "teacher" && existing.teacherId !== user.id) {
    redirect("/admin/courses");
  }
  await prisma.course.update({
    where: { id },
    data: {
      published: true,
      instructorName: existing.instructorName || user.name,
    },
  });
  clearPublicCache();
  redirect("/admin/courses");
}

export async function addModuleAction(formData: FormData) {
  const user = await requireRole("admin", "teacher");
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !title) redirect("/admin/courses");
  if (user.role === "teacher" && course.teacherId !== user.id) {
    redirect("/admin/courses");
  }
  const last = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { sortOrder: "desc" },
  });
  await prisma.module.create({
    data: { courseId, title, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
  redirect(`/admin/courses/${courseId}`);
}

function courseMediaPath(courseId: string, error?: string) {
  if (error) {
    return `/admin/courses/${courseId}?error=${encodeURIComponent(error)}`;
  }
  return `/admin/courses/${courseId}`;
}

async function saveLessonFiles(lessonId: string, formData: FormData) {
  const video = formData.get("video");
  if (isUploadFile(video)) {
    const saved = await saveLessonVideo(lessonId, video);
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        videoPath: saved.relative,
        videoName: saved.name,
        videoBytes: saved.bytes,
      },
    });
  }
  const files = formData.getAll("resources").filter(isUploadFile);
  const existing = await prisma.lessonResource.count({ where: { lessonId } });
  if (existing + files.length > 20) {
    throw new Error("A lesson can have at most 20 resources.");
  }
  for (const file of files) {
    const saved = await saveLessonResource(lessonId, file);
    await prisma.lessonResource.create({
      data: {
        lessonId,
        name: saved.name,
        filePath: saved.relative,
        mimeType: saved.mimeType,
        sizeBytes: saved.bytes,
      },
    });
  }
}

export async function addLessonAction(formData: FormData) {
  const user = await requireRole("admin", "teacher");
  const moduleId = String(formData.get("moduleId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const durationMin = Number(formData.get("durationMin") ?? 0);
  const preview = formData.get("preview") === "on";
  const videoUrl = normalizeVideoInput(formData.get("videoUrl"));
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!module || !title) redirect(courseMediaPath(courseId));
  if (user.role === "teacher" && module.course.teacherId !== user.id) {
    redirect("/admin/courses");
  }
  const last = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { sortOrder: "desc" },
  });
  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title,
      body,
      durationMin: Number.isFinite(durationMin) ? durationMin : 0,
      preview,
      videoUrl: videoUrl || null,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  try {
    await saveLessonFiles(lesson.id, formData);
  } catch (error) {
    redirect(
      courseMediaPath(
        courseId,
        error instanceof Error ? error.message : "Could not save the files."
      )
    );
  }
  redirect(courseMediaPath(courseId));
}

export async function updateLessonAction(formData: FormData) {
  const user = await requireRole("admin", "teacher");
  const lessonId = String(formData.get("lessonId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) redirect("/admin/courses");
  if (user.role === "teacher" && lesson.module.course.teacherId !== user.id) {
    redirect("/admin/courses");
  }
  try {
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: String(formData.get("title") ?? lesson.title).trim(),
        body: String(formData.get("body") ?? lesson.body),
        durationMin: Number(formData.get("durationMin") ?? lesson.durationMin),
        preview: formData.get("preview") === "on",
        videoUrl: normalizeVideoInput(formData.get("videoUrl")) || null,
      },
    });
    await saveLessonFiles(lesson.id, formData);
  } catch (error) {
    redirect(
      courseMediaPath(
        courseId,
        error instanceof Error ? error.message : "Could not save the files."
      )
    );
  }
  redirect(courseMediaPath(courseId));
}

export async function removeLessonVideoAction(formData: FormData) {
  const user = await requireRole("admin", "teacher");
  const lessonId = String(formData.get("lessonId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) redirect("/admin/courses");
  if (user.role === "teacher" && lesson.module.course.teacherId !== user.id) {
    redirect("/admin/courses");
  }
  await removeUpload(lesson.videoPath);
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { videoPath: null, videoName: null, videoBytes: null },
  });
  redirect(courseMediaPath(courseId));
}

export async function deleteLessonResourceAction(formData: FormData) {
  const user = await requireRole("admin", "teacher");
  const resourceId = String(formData.get("resourceId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const resource = await prisma.lessonResource.findUnique({
    where: { id: resourceId },
    include: { lesson: { include: { module: { include: { course: true } } } } },
  });
  if (!resource) redirect(courseMediaPath(courseId));
  if (
    user.role === "teacher" &&
    resource.lesson.module.course.teacherId !== user.id
  ) {
    redirect("/admin/courses");
  }
  await removeUpload(resource.filePath);
  await prisma.lessonResource.delete({ where: { id: resourceId } });
  redirect(courseMediaPath(courseId));
}