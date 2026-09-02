import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CourseEditorForm } from "@/components/course-editor-form";
import { CurriculumEditor } from "@/components/admin/curriculum-editor";

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole("admin", "teacher");
  const { id } = await params;
  const { error } = await searchParams;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
            include: { resources: true },
          },
        },
      },
      enrollments: { include: { user: true } },
    },
  });
  if (!course) notFound();
  if (user.role === "teacher" && course.teacherId !== user.id) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/courses" className="hover:text-foreground">
            Courses
          </Link>
          <span className="mx-2">/</span>
          {course.title}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
          {course.title}
        </h1>
        <p className="text-sm text-muted-foreground">/{course.slug}</p>
        <CourseEditorForm course={course} />
      </div>

      <CurriculumEditor
        courseId={course.id}
        modules={course.modules}
        error={error}
      />

      <section>
        <h2 className="font-heading text-xl font-semibold">Enrolled students</h2>
        {course.enrollments.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">None yet.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {course.enrollments.map((row) => (
              <li key={row.id}>
                {row.user.name} · {row.user.phone}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
