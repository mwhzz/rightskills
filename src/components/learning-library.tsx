import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { buttonVariants } from "@/components/ui/button";
import { courses } from "@/lib/courses";
import { getOwnedSlugs, getProgress } from "@/lib/session";
import { cn } from "@/lib/utils";

export async function LearningLibrary() {
  const [ownedSlugs, progress] = await Promise.all([
    getOwnedSlugs(),
    getProgress(),
  ]);
  const owned = courses.filter((course) => ownedSlugs.includes(course.slug));

  if (owned.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <p className="font-heading text-lg font-semibold">
          You have not purchased a course yet
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Buy a course to unlock lessons here. Your library is saved in a cookie
          on this browser.
        </p>
        <Link
          href="/courses"
          className={cn(buttonVariants({ size: "lg" }), "mt-5")}
        >
          Find a course
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {owned.map((course) => {
        const total = course.modules.flatMap((module) => module.lessons).length;
        const done = progress[course.slug]?.length ?? 0;
        return (
          <div key={course.slug} className="space-y-2">
            <CourseCard course={course} href={`/learn/${course.slug}`} />
            <p className="px-1 text-xs text-muted-foreground">
              {done} of {total} lessons complete
            </p>
          </div>
        );
      })}
    </div>
  );
}
