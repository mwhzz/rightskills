"use server";

import { redirect } from "next/navigation";
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
} from "@/lib/auth";
import { getCart, setCartCookie } from "@/lib/session";
import { getOwnedSlugsForUser, getPublishedCourse } from "@/lib/queries";
import { makeOrderId, type PaymentMethod } from "@/lib/store";
import { saveLessonVideo } from "@/lib/uploads";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/learn");

  if (name.length < 3) redirect("/register?error=name");
  if (!phone) redirect("/register?error=phone");
  if (password.length < 6) redirect("/register?error=password");

  const exists = await prisma.user.findUnique({ where: { phone } });
  if (exists) redirect("/register?error=taken");

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      role: Role.student,
    },
  });
  await createSession({
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
  });
  redirect(next.startsWith("/") ? next : "/learn");
}

export async function loginAction(formData: FormData) {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/learn");
  if (!phone) redirect("/login?error=phone");

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }
  await createSession({
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
  });
  redirect(next.startsWith("/") ? next : "/learn");
}

export async function logoutAction() {
  await clearSession();
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
  const user = await getSession();
  redirect(user ? "/checkout" : "/login?next=/checkout");
}

export async function removeFromCartAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const cart = await getCart();
  await setCartCookie(cart.filter((item) => item !== slug));
}

export async function checkoutAction(formData: FormData) {
  const user = await requireUser();
  const method = String(formData.get("method") ?? "bkash") as PaymentMethod;
  if (!["bkash", "nagad", "card"].includes(method)) {
    redirect("/checkout?error=method");
  }

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
  const user = await requireUser();
  const orderId = String(formData.get("orderId") ?? "");
  const trxId = String(formData.get("trxId") ?? "").trim();
  if (trxId.length < 4) redirect(`/account/orders?error=trx`);

  const order = await prisma.order.findFirst({
    where: { orderId, userId: user.id },
  });
  if (!order) redirect("/account/orders");
  if (order.status === "paid") redirect("/account/orders");

  await prisma.order.update({
    where: { id: order.id },
    data: { trxId, status: "awaiting_review" },
  });
  redirect("/account/orders?submitted=1");
}

export async function toggleLessonAction(formData: FormData) {
  const user = await requireUser();
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

export async function saveSettingsAction(formData: FormData) {
  await requireRole("admin");
  await prisma.setting.upsert({
    where: { id: "default" },
    update: {
      bkashNumber: String(formData.get("bkashNumber") ?? "").trim(),
      nagadNumber: String(formData.get("nagadNumber") ?? "").trim(),
      payInstructions: String(formData.get("payInstructions") ?? "").trim(),
    },
    create: {
      id: "default",
      bkashNumber: String(formData.get("bkashNumber") ?? "").trim(),
      nagadNumber: String(formData.get("nagadNumber") ?? "").trim(),
      payInstructions: String(formData.get("payInstructions") ?? "").trim(),
    },
  });
  redirect("/admin/settings?saved=1");
}

export async function createTeacherAction(formData: FormData) {
  await requireRole("admin");
  const name = String(formData.get("name") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!name || !phone || password.length < 6) redirect("/admin/users?error=1");

  await prisma.user.upsert({
    where: { phone },
    update: {
      name,
      role: Role.teacher,
      passwordHash: await bcrypt.hash(password, 12),
    },
    create: {
      name,
      phone,
      role: Role.teacher,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  redirect("/admin/users?created=1");
}

export async function saveCourseAction(formData: FormData) {
  const user = await requireRole("admin", "teacher");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const banglaTitle = String(formData.get("banglaTitle") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "development");
  const level = String(formData.get("level") ?? "Beginner");
  const language = String(formData.get("language") ?? "Bangla + English");
  const priceBdt = Number(formData.get("priceBdt") ?? 0);
  const originalPriceBdtRaw = String(formData.get("originalPriceBdt") ?? "");
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";
  let slug = slugify(String(formData.get("slug") ?? title));
  if (!title || !slug || !Number.isFinite(priceBdt)) {
    redirect("/admin/courses?error=1");
  }

  const data = {
    title,
    banglaTitle: banglaTitle || title,
    subtitle,
    description,
    category,
    level,
    language,
    priceBdt: Math.round(priceBdt),
    originalPriceBdt: originalPriceBdtRaw ? Number(originalPriceBdtRaw) : null,
    featured,
    published,
    outcomes: String(formData.get("outcomes") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    instructorName: String(formData.get("instructorName") ?? user.name),
    instructorTitle: String(formData.get("instructorTitle") ?? "Instructor"),
    instructorBio: String(formData.get("instructorBio") ?? ""),
    instructorInitials: String(formData.get("instructorInitials") ?? user.name.slice(0, 2)).slice(0, 3),
    coverFrom: String(formData.get("coverFrom") ?? "#0B6E4F"),
    coverTo: String(formData.get("coverTo") ?? "#083D2C"),
    coverPattern: String(formData.get("coverPattern") ?? "grid"),
    teacherId: user.role === "teacher" ? user.id : String(formData.get("teacherId") ?? user.id) || user.id,
  };

  if (id) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) redirect("/admin/courses");
    if (user.role === "teacher" && existing.teacherId !== user.id) {
      redirect("/admin/courses");
    }
    await prisma.course.update({
      where: { id },
      data: { ...data, slug: existing.slug },
    });
    redirect(`/admin/courses/${id}`);
  }

  const clash = await prisma.course.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;
  const created = await prisma.course.create({
    data: { ...data, slug },
  });
  redirect(`/admin/courses/${created.id}`);
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

export async function addLessonAction(formData: FormData) {
  const user = await requireRole("admin", "teacher");
  const moduleId = String(formData.get("moduleId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const durationMin = Number(formData.get("durationMin") ?? 0);
  const preview = formData.get("preview") === "on";
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!module || !title) redirect(`/admin/courses/${courseId}`);
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
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  const video = formData.get("video");
  if (video instanceof File && video.size > 0) {
    const videoPath = await saveLessonVideo(lesson.id, video);
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { videoPath },
    });
  }
  redirect(`/admin/courses/${courseId}`);
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
  const data = {
    title: String(formData.get("title") ?? lesson.title).trim(),
    body: String(formData.get("body") ?? lesson.body),
    durationMin: Number(formData.get("durationMin") ?? lesson.durationMin),
    preview: formData.get("preview") === "on",
  };
  const video = formData.get("video");
  let videoPath = lesson.videoPath;
  if (video instanceof File && video.size > 0) {
    videoPath = await saveLessonVideo(lesson.id, video);
  }
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { ...data, videoPath },
  });
  redirect(`/admin/courses/${courseId}`);
}