import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CoursePlayer } from "@/components/course-player";
import { requireUser } from "@/lib/auth";
import { getCourseBySlug, getOwnedSlugsForUser } from "@/lib/queries";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Lesson" };
  return { title: `Learn · ${course.title}` };
}

export default async function LearnCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const { lesson } = await searchParams;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const ownedSlugs = await getOwnedSlugsForUser(user.id);
  const owned = ownedSlugs.includes(course.slug);
  const completedRows = owned
    ? await prisma.lessonProgress.findMany({
        where: { userId: user.id, completed: true },
        select: { lessonId: true },
      })
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <p className="mb-4 text-sm text-muted-foreground">
        <Link href="/learn" className="hover:text-foreground">
          My learning
        </Link>
        <span className="mx-2">/</span>
        {course.title}
      </p>
      <CoursePlayer
        course={course}
        owned={owned}
        activeLessonId={lesson}
        completed={completedRows.map((row) => row.lessonId)}
      />
    </div>
  );
}
