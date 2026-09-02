import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBdt } from "@/lib/format";
import { StarRow } from "@/components/stars";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminCoursesPage() {
  const user = await requireRole("admin", "teacher");
  const courses = await prisma.course.findMany({
    where: user.role === "teacher" ? { teacherId: user.id } : undefined,
    include: {
      _count: { select: { enrollments: true, modules: true, reviews: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Courses
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Add modules, lesson notes, and upload videos. Ratings update when
            students review from My learning.
          </p>
        </div>
        <Link href="/admin/courses/new" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
          New course
        </Link>
      </div>
      {courses.length === 0 ? (
        <p className="mt-8 rounded-2xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          No courses yet. Create the first one.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-medium">{course.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.published ? "Published" : "Draft"} · {formatBdt(course.priceBdt)}{" "}
                  · {course._count.modules} modules · {course._count.enrollments} students
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <StarRow rating={course.rating} starClassName="size-3.5" />
                  <span className="text-sm text-muted-foreground">
                    {course._count.reviews
                      ? `${course.rating.toFixed(1)} · ${course._count.reviews} reviews`
                      : "No reviews yet"}
                  </span>
                </div>
              </div>
              <Link
                href={`/admin/courses/${course.id}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
