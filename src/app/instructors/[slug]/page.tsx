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
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-14">
      <nav className="text-base text-muted-foreground">
        <Link href="/instructors" className="hover:text-foreground">
          Instructors
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{person.name}</span>
      </nav>

      <div className="mt-6 flex items-start gap-4 sm:mt-8 sm:gap-8">
        {person.photo ? (
          <img
            src={person.photo}
            alt={person.name}
            className="size-20 shrink-0 rounded-xl object-cover sm:size-48 sm:rounded-3xl"
          />
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-primary font-heading text-2xl font-semibold text-primary-foreground sm:size-48 sm:rounded-3xl sm:text-4xl">
            {person.initials}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-5xl">
            {person.name}
          </h1>
          <p className="mt-2 text-lg text-primary">{person.title}</p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">
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
        <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
          Courses
        </h2>
        <div className="rail -mx-4 mt-5 flex gap-3 px-4 pb-1 sm:mx-0 sm:mt-8 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {person.courses.map((course) => {
            const owned = learning?.ownedSlugs.includes(course.slug) ?? false;
            return (
              <div
                key={course.slug}
                className="w-[min(78vw,18.75rem)] shrink-0 snap-start sm:w-auto"
              >
                <CourseCard
                  course={course}
                  owned={owned}
                  progress={owned ? learning?.progressBySlug[course.slug] : undefined}
                  compact
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
