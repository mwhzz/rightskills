import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Reveal } from "@/components/home/reveal";
import type { Course } from "@/lib/courses";
import type { CourseProgress } from "@/lib/queries";

export function CourseRail({
  title,
  description,
  href,
  courses,
  ownedSlugs,
  progressBySlug,
}: {
  title: string;
  description: string;
  href: string;
  courses: Course[];
  ownedSlugs?: string[];
  progressBySlug?: Record<string, CourseProgress>;
}) {
  if (courses.length === 0) return null;

  return (
    <div>
      <Reveal>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
          <Link
            href={href}
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            All
          </Link>
        </div>
      </Reveal>
      <div className="rail -mx-4 mt-4 max-md:flex max-md:gap-3 max-md:px-4 max-md:pb-1 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-x-visible lg:grid-cols-3">
        {courses.map((course) => {
          const owned = ownedSlugs?.includes(course.slug) ?? false;
          return (
            <div
              key={`${title}-${course.slug}`}
              className="w-[min(78vw,18.75rem)] shrink-0 snap-start md:w-auto"
            >
              <CourseCard
                course={course}
                owned={owned}
                progress={owned ? progressBySlug?.[course.slug] : undefined}
                compact
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
