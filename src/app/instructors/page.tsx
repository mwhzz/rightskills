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
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="text-base font-medium tracking-[0.18em] text-primary uppercase">
        Instructors
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        The people who teach
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
        Practitioners first. Each course is led by someone still doing the work.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <Link
            key={person.slug}
            href={`/instructors/${person.slug}`}
            className="group overflow-hidden rounded-3xl border bg-card transition hover:border-primary/40"
          >
            {person.photo ? (
              <img
                src={person.photo}
                alt={person.name}
                className="aspect-4/5 w-full object-cover object-top"
              />
            ) : (
              <div className="flex aspect-4/5 items-center justify-center bg-primary font-heading text-5xl font-semibold text-primary-foreground">
                {person.initials}
              </div>
            )}
            <div className="p-6">
              <h2 className="font-heading text-2xl font-semibold tracking-tight group-hover:text-primary">
                {person.name}
              </h2>
              <p className="mt-1 text-base text-muted-foreground">{person.title}</p>
              <p className="mt-3 text-base text-muted-foreground">
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
