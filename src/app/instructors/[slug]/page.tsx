import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Star, Users } from "lucide-react";
import { CourseCard } from "@/components/course-card";
import { getSession } from "@/lib/auth";
import { courses } from "@/lib/courses";
import { formatStudents } from "@/lib/format";
import { getInstructorBySlug } from "@/lib/instructors";
import { getHomepageLearning, listPublishedCourses } from "@/lib/queries";

export const dynamic = "force-dynamic";

async function loadCourses() {
  try {
    return await listPublishedCourses();
  } catch {
    return courses;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const person = getInstructorBySlug(slug, await loadCourses());
  if (!person) return { title: "Instructor" };
  return {
    title: person.name,
    description: person.bio,
  };
}

export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalogue = await loadCourses();
  const person = getInstructorBySlug(slug, catalogue);
  if (!person) notFound();

  const students = person.courses.reduce((sum, course) => sum + course.students, 0);
  const rating =
    person.courses.reduce((sum, course) => sum + course.rating, 0) /
    person.courses.length;
  const session = await getSession();
  const learning = session
    ? await getHomepageLearning(session.id).catch(() => null)
    : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <nav className="text-base text-muted-foreground">
        <Link href="/instructors" className="hover:text-foreground">
          Instructors
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{person.name}</span>
      </nav>

      <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
        {person.photo ? (
          <img
            src={person.photo}
            alt={person.name}
            className="size-40 shrink-0 rounded-3xl object-cover sm:size-48"
          />
        ) : (
          <div className="flex size-40 shrink-0 items-center justify-center rounded-3xl bg-primary font-heading text-4xl font-semibold text-primary-foreground sm:size-48">
            {person.initials}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {person.name}
          </h1>
          <p className="mt-2 text-lg text-primary">{person.title}</p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            {person.bio}
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-base">
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="size-4" />
                Courses
              </dt>
              <dd className="mt-1 font-heading text-2xl font-semibold">
                {person.courses.length}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" />
                Learners
              </dt>
              <dd className="mt-1 font-heading text-2xl font-semibold">
                {formatStudents(students)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Star className="size-4" />
                Rating
              </dt>
              <dd className="mt-1 font-heading text-2xl font-semibold">
                {rating.toFixed(1)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Courses
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {person.courses.map((course) => {
            const owned = learning?.ownedSlugs.includes(course.slug) ?? false;
            return (
              <CourseCard
                key={course.slug}
                course={course}
                owned={owned}
                progress={owned ? learning?.progressBySlug[course.slug] : undefined}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
