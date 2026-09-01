import { prisma } from "@/lib/db";
import { mapCourse, type CourseRecord } from "@/lib/catalog";
import type { Course } from "@/lib/courses";

const courseInclude = {
  modules: { include: { lessons: true }, orderBy: { sortOrder: "asc" as const } },
};

export async function listPublishedCourses(): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { published: true },
    include: courseInclude,
    orderBy: { students: "desc" },
  });
  return rows.map((row) => mapCourse(row as CourseRecord));
}

export async function listFeaturedCourses(): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { published: true, featured: true },
    include: courseInclude,
    orderBy: { students: "desc" },
  });
  return rows.map((row) => mapCourse(row as CourseRecord));
}

export async function getPublishedCourse(slug: string): Promise<Course | null> {
  const row = await prisma.course.findFirst({
    where: { slug, published: true },
    include: courseInclude,
  });
  return row ? mapCourse(row as CourseRecord) : null;
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const row = await prisma.course.findUnique({
    where: { slug },
    include: courseInclude,
  });
  return row ? mapCourse(row as CourseRecord) : null;
}

export async function getOwnedSlugsForUser(userId: string) {
  const rows = await prisma.enrollment.findMany({
    where: { userId },
    include: { course: { select: { slug: true } } },
  });
  return rows.map((row) => row.course.slug);
}

export async function getSettings() {
  return prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      bkashNumber: "",
      nagadNumber: "",
      payInstructions:
        "Send the exact amount to the number below. Use your order ID as the reference, then paste the TrxID on your orders page.",
    },
  });
}
