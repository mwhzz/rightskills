import Link from "next/link";
import { publishCourseAction } from "@/app/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBdt } from "@/lib/format";
import { StarRow } from "@/components/stars";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeleteCourseButton } from "@/components/admin/delete-course-button";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole("admin", "teacher");
  const { error } = await searchParams;
  const courses = await prisma.course.findMany({
    where: user.role === "teacher" ? { teacherId: user.id } : undefined,
    include: {
      teacher: { select: { name: true } },
      _count: {
        select: {
          enrollments: true,
          modules: true,
          reviews: true,
          orderItems: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totals = courses.reduce(
    (acc, course) => {
      acc.students += course._count.enrollments;
      acc.published += course.published ? 1 : 0;
      return acc;
    },
    { students: 0, published: 0 }
  );

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

      {courses.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full border bg-card px-3 py-1">
            {courses.length} course{courses.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full border bg-card px-3 py-1">
            {totals.published} published · {courses.length - totals.published} draft
          </span>
          <span className="rounded-full border bg-card px-3 py-1">
            {totals.students} total students
          </span>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

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
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{course.title}</p>
                  {course.featured ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      Featured
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      course.published
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {course.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  /{course.slug} · {course.category} · {course.level} ·{" "}
                  {course.language}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatBdt(course.priceBdt)}
                  {course.originalPriceBdt ? (
                    <span className="ml-1 line-through opacity-70">
                      {formatBdt(course.originalPriceBdt)}
                    </span>
                  ) : null}{" "}
                  · {course._count.modules} modules ·{" "}
                  {course._count.enrollments} students ·{" "}
                  {course._count.orderItems} orders
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StarRow rating={course.rating} starClassName="size-3.5" />
                  <span className="text-sm text-muted-foreground">
                    {course._count.reviews
                      ? `${course.rating.toFixed(1)} · ${course._count.reviews} reviews`
                      : "No reviews yet"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {course.teacher ? `${course.teacher.name} · ` : ""}
                  Updated {formatDate(course.updatedAt)} · Created{" "}
                  {formatDate(course.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {course.published ? (
                  <Link
                    href={`/courses/${course.slug}`}
                    target="_blank"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                  >
                    View
                  </Link>
                ) : null}
                {!course.published ? (
                  <form action={publishCourseAction}>
                    <input type="hidden" name="id" value={course.id} />
                    <button
                      type="submit"
                      className={cn(buttonVariants({ size: "default" }), "h-10")}
                    >
                      পাবলিশ
                    </button>
                  </form>
                ) : null}
                <Link
                  href={`/admin/courses/${course.id}`}
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Edit
                </Link>
                <DeleteCourseButton
                  courseId={course.id}
                  courseTitle={course.title}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
