import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapCourse, type CourseRecord } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export async function LearningLibrary() {
  const user = await requireUser();
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          modules: { include: { lessons: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const owned = enrollments.map((row) => mapCourse(row.course as CourseRecord));
  const progressRows = await prisma.lessonProgress.findMany({
    where: { userId: user.id, completed: true },
    select: { lessonId: true },
  });
  const doneIds = new Set(progressRows.map((row) => row.lessonId));

  if (owned.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <p className="font-heading text-lg font-semibold">
          You have not unlocked a course yet
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Buy a course and send the TrxID. After an admin confirms payment, it
          appears here.
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
        const done = course.modules
          .flatMap((module) => module.lessons)
          .filter((lesson) => doneIds.has(lesson.id)).length;
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
