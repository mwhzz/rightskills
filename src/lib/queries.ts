import { cache } from "react";
import { parseHomeBanners, type HomeBanner } from "@/lib/home-banners";
import { prisma } from "@/lib/db";
import { mapCourse, type CourseRecord } from "@/lib/catalog";
import type { Course } from "@/lib/courses";

export type CourseProgress = {
  done: number;
  total: number;
  pct: number;
};

export type HomepageLearning = {
  ownedSlugs: string[];
  progressBySlug: Record<string, CourseProgress>;
  continueItem: {
    slug: string;
    title: string;
    pct: number;
    href: string;
  } | null;
  openOrderCount: number;
};

export type HomeStats = {
  students: number;
  courses: number;
  rating: number | null;
};

const courseInclude = {
  modules: {
    include: {
      lessons: {
        include: { resources: true },
        orderBy: { sortOrder: "asc" as const },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
};

export async function listPublishedCourses(): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { published: true },
    include: courseInclude,
    orderBy: { students: "desc" },
  });
  return rows.map((row) => mapCourse(row as CourseRecord));
}

export async function listFeaturedCourses(take = 6): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { published: true, featured: true },
    include: courseInclude,
    orderBy: { students: "desc" },
    take,
  });
  return rows.map((row) => mapCourse(row as CourseRecord));
}

export async function listNewestCourses(take = 3): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { published: true },
    include: courseInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map((row) => mapCourse(row as CourseRecord));
}

export async function listPopularCourses(take = 3): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { published: true },
    include: courseInclude,
    orderBy: { students: "desc" },
    take,
  });
  return rows.map((row) => mapCourse(row as CourseRecord));
}

export const getHomeStats = cache(async (): Promise<HomeStats> => {
  const [students, courses, ratingAgg] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.course.count({ where: { published: true } }),
    prisma.course.aggregate({
      where: { published: true, reviewCount: { gt: 0 } },
      _avg: { rating: true },
    }),
  ]);
  return {
    students,
    courses,
    rating: ratingAgg._avg.rating,
  };
});

export const getHomepageLearning = cache(
  async (userId: string): Promise<HomepageLearning> => {
    const [enrollments, progressRows, openOrderCount] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              slug: true,
              title: true,
              modules: {
                select: { lessons: { select: { id: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.lessonProgress.findMany({
        where: { userId, completed: true },
        select: { lessonId: true },
      }),
      prisma.order.count({
        where: {
          userId,
          status: { in: ["pending", "awaiting_review"] },
        },
      }),
    ]);

    const doneIds = new Set(progressRows.map((row) => row.lessonId));
    const owned = enrollments.map((row) => {
      const lessons = row.course.modules.flatMap((module) => module.lessons);
      const total = lessons.length;
      const done = lessons.filter((lesson) => doneIds.has(lesson.id)).length;
      const next = lessons.find((lesson) => !doneIds.has(lesson.id));
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);
      return {
        slug: row.course.slug,
        title: row.course.title,
        total,
        done,
        pct,
        complete: total > 0 && done >= total,
        nextLessonId: next?.id,
      };
    });

    const continueRow =
      owned.find((item) => !item.complete && item.done > 0) ??
      owned.find((item) => !item.complete);

    return {
      ownedSlugs: owned.map((item) => item.slug),
      progressBySlug: Object.fromEntries(
        owned.map((item) => [
          item.slug,
          { done: item.done, total: item.total, pct: item.pct },
        ])
      ),
      continueItem: continueRow
        ? {
            slug: continueRow.slug,
            title: continueRow.title,
            pct: continueRow.pct,
            href: continueRow.nextLessonId
              ? `/learn/${continueRow.slug}?lesson=${continueRow.nextLessonId}`
              : `/learn/${continueRow.slug}`,
          }
        : null,
      openOrderCount,
    };
  }
);

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

export async function getHomeBanners(): Promise<HomeBanner[]> {
  try {
    const settings = await getSettings();
    return parseHomeBanners(settings.homeBanners);
  } catch {
    return parseHomeBanners("[]");
  }
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
      homeBanners: "[]",
    },
  });
}
