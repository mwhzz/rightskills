import type { Metadata } from "next";
import Link from "next/link";
import { courses } from "@/lib/courses";
import { buildInstructors } from "@/lib/instructors";
import { listPublishedCourses } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Instructors",
  description: "Meet the practitioners who teach at Right Skills.",
};

async function loadCourses() {
  try {
    return await listPublishedCourses();
  } catch {
    return courses;
  }
}

export default async function InstructorsPage() {
  const catalogue = await loadCourses();
  const people = buildInstructors(catalogue);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase sm:text-base">
        Instructors
      </p>
      <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:mt-3 sm:text-5xl">
        The people who teach
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-3 sm:text-lg sm:leading-8">
        Practitioners first. Each course is led by someone still doing the work.
      </p>

      <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {people.map((person) => (
          <Link
            key={person.slug}
            href={`/instructors/${person.slug}`}
            className="group flex items-center gap-3 overflow-hidden rounded-2xl border bg-card p-3 transition hover:border-primary/40 sm:flex-col sm:items-stretch sm:rounded-3xl sm:p-0"
          >
            {person.photo ? (
              <img
                src={person.photo}
                alt={person.name}
                className="size-16 shrink-0 rounded-xl object-cover object-top sm:aspect-4/5 sm:size-auto sm:w-full sm:rounded-none"
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary font-heading text-xl font-semibold text-primary-foreground sm:aspect-4/5 sm:size-auto sm:w-full sm:rounded-none sm:text-5xl">
                {person.initials}
              </div>
            )}
            <div className="min-w-0 p-0 sm:p-6">
              <h2 className="font-heading text-lg font-semibold tracking-tight group-hover:text-primary sm:text-2xl">
                {person.name}
              </h2>
              <p className="mt-0.5 truncate text-sm text-muted-foreground sm:mt-1 sm:text-base">{person.title}</p>
              <p className="mt-1 text-sm text-muted-foreground sm:mt-3 sm:text-base">
                {person.courses.length} course
                {person.courses.length === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
