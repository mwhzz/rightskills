import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBdt } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminCoursesPage() {
  const user = await requireRole("admin", "teacher");
  const courses = await prisma.course.findMany({
    where: user.role === "teacher" ? { teacherId: user.id } : undefined,
    include: { _count: { select: { enrollments: true, modules: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add modules, lesson notes, and upload videos.
          </p>
        </div>
        <Link href="/admin/courses/new" className={cn(buttonVariants())}>
          New course
        </Link>
      </div>
      <ul className="mt-6 space-y-3">
        {courses.map((course) => (
          <li key={course.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
            <div>
              <p className="font-medium">{course.title}</p>
              <p className="text-xs text-muted-foreground">
                {course.published ? "Published" : "Draft"} · {formatBdt(course.priceBdt)} ·{" "}
                {course._count.modules} modules · {course._count.enrollments} students
              </p>
            </div>
            <Link
              href={`/admin/courses/${course.id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
