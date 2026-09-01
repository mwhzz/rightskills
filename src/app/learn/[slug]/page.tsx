import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CoursePlayer } from "@/components/course-player";
import { getCourse } from "@/lib/courses";
import { getOwnedSlugs, getProgress } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
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
  const { slug } = await params;
  const { lesson } = await searchParams;
  const course = getCourse(slug);
  if (!course) notFound();

  const [ownedSlugs, progress] = await Promise.all([
    getOwnedSlugs(),
    getProgress(),
  ]);

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
        owned={ownedSlugs.includes(course.slug)}
        activeLessonId={lesson}
        completed={progress[course.slug] ?? []}
      />
    </div>
  );
}
