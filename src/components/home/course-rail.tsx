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
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
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
            All courses
          </Link>
        </div>
      </Reveal>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => {
          const owned = ownedSlugs?.includes(course.slug) ?? false;
          return (
            <Reveal key={`${title}-${course.slug}`} delay={index * 60}>
              <CourseCard
                course={course}
                owned={owned}
                progress={owned ? progressBySlug?.[course.slug] : undefined}
              />
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
