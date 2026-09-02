import { prisma } from "@/lib/db";
import { formatAgo } from "@/lib/format";
import { initialsFromName } from "@/lib/slug";

export type PublicReview = {
  name: string;
  initials: string;
  subtitle?: string;
  photo?: string;
  rating: number;
  when: string;
  quote: string;
};

export async function refreshCourseRating(courseId: string) {
  const agg = await prisma.courseReview.aggregate({
    where: { courseId },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.course.update({
    where: { id: courseId },
    data: {
      rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      reviewCount: agg._count._all,
    },
  });
}

export async function listReviewsForSlug(slug: string): Promise<PublicReview[]> {
  const rows = await prisma.courseReview.findMany({
    where: { course: { slug } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
  return rows.map((row) => ({
    name: row.user.name,
    initials: initialsFromName(row.user.name),
    rating: row.rating,
    when: formatAgo(row.createdAt),
    quote: row.body,
  }));
}

export async function listLatestReviews(take = 8): Promise<PublicReview[]> {
  const rows = await prisma.courseReview.findMany({
    where: { course: { published: true } },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map((row) => ({
    name: row.user.name,
    initials: initialsFromName(row.user.name),
    subtitle: row.course.title,
    rating: row.rating,
    when: formatAgo(row.createdAt),
    quote: row.body,
  }));
}
