import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CoursePlayer } from "@/components/course-player";
import { ReviewForm } from "@/components/review-form";
import { requireUser } from "@/lib/auth";
import { getCourseBySlug, getOwnedSlugsForUser } from "@/lib/queries";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const reviewCopy: Record<string, { text: string; ok: boolean }> = {
  saved: { text: "Review saved. It now shows on the course page.", ok: true },
  rating: { text: "Pick a rating from 1 to 5 stars.", ok: false },
  short: { text: "Write at least a sentence (12 characters).", ok: false },
};

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
  searchParams: Promise<{ lesson?: string; review?: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser(`/learn/${slug}`);
  const { lesson, review } = await searchParams;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const ownedSlugs = await getOwnedSlugsForUser(user.id);
  const owned = ownedSlugs.includes(course.slug);
  const [completedRows, existingReview] = await Promise.all([
    owned
      ? prisma.lessonProgress.findMany({
          where: { userId: user.id, completed: true },
          select: { lessonId: true },
        })
      : Promise.resolve([]),
    owned
      ? prisma.courseReview.findFirst({
          where: { userId: user.id, course: { slug } },
        })
      : Promise.resolve(null),
  ]);

  const flash = review ? reviewCopy[review] : undefined;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <p className="mb-6 text-sm text-muted-foreground">
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
      {owned ? (
        <div id="review" className="mt-10 scroll-mt-24 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            {flash ? (
              <p
                className={
                  flash.ok
                    ? "mb-4 rounded-2xl border bg-primary/5 px-4 py-3 text-sm"
                    : "mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                }
              >
                {flash.text}
              </p>
            ) : null}
            <ReviewForm
              slug={course.slug}
              existing={
                existingReview
                  ? { rating: existingReview.rating, body: existingReview.body }
                  : undefined
              }
            />
          </div>
          <aside className="h-fit rounded-2xl border bg-card p-5 text-sm leading-6 text-muted-foreground">
            <p className="font-heading text-base font-semibold text-foreground">
              Why review
            </p>
            <p className="mt-2">
              One review per course. Teachers see it on their panel. You can
              edit it any time from this page.
            </p>
            <Link
              href={`/courses/${course.slug}#reviews`}
              className="mt-3 inline-block font-medium text-primary hover:underline"
            >
              See public reviews
            </Link>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
