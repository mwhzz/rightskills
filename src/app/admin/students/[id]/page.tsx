import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteStudentAction } from "@/app/actions";
import { requireAccess } from "@/lib/staff";
import { prisma } from "@/lib/db";
import { StudentProfileForm } from "@/components/admin/student-profile-form";
import { buttonVariants } from "@/components/ui/button";
import { formatWhen } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; created?: string }>;
}) {
  await requireAccess("students");
  const { id } = await params;
  const { error, saved, created } = await searchParams;
  const [student, courses] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: { course: { select: { id: true, title: true, slug: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);
  if (!student || student.role !== "student") notFound();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin/students" className="hover:text-foreground">
          Students
        </Link>
        <span className="mx-2">/</span>
        {student.name}
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
        {student.name}
      </h1>
      <p className="mt-1 font-mono text-sm text-muted-foreground">{student.phone}</p>

      {created ? (
        <p className="mt-4 rounded-2xl border bg-primary/5 px-4 py-3 text-sm">
          Student created. Share the phone and PIN so they can log in.
        </p>
      ) : null}
      {saved ? (
        <p className="mt-4 rounded-2xl border bg-primary/5 px-4 py-3 text-sm">
          Student saved.
        </p>
      ) : null}

      {student.enrollments.length > 0 ? (
        <section className="mt-6 rounded-2xl border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">Unlocked courses</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {student.enrollments.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3">
                <Link
                  href={`/admin/courses/${row.course.id}`}
                  className="font-medium hover:text-primary"
                >
                  {row.course.title}
                </Link>
                <span className="text-muted-foreground">{formatWhen(row.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8">
        <StudentProfileForm student={student} courses={courses} error={error} />
      </div>

      <section className="mt-10 rounded-2xl border border-destructive/30 bg-card p-5">
        <h2 className="font-heading text-lg font-semibold text-destructive">
          Delete student
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Removes this account, their orders, progress, and reviews. This cannot
          be undone.
        </p>
        <form action={deleteStudentAction} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={student.id} />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="confirm" className="mt-1 size-4" />
            <span>Yes, delete {student.name} and all of their data.</span>
          </label>
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "destructive" }), "h-10")}
          >
            Delete student
          </button>
        </form>
      </section>
    </div>
  );
}
