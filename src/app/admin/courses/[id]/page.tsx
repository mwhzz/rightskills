import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CourseEditorForm } from "@/components/course-editor-form";
import { addLessonAction, addModuleAction, updateLessonAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("admin", "teacher");
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
      },
      enrollments: { include: { user: true } },
    },
  });
  if (!course) notFound();
  if (user.role === "teacher" && course.teacherId !== user.id) notFound();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{course.title}</h1>
        <p className="text-sm text-muted-foreground">/{course.slug}</p>
        <CourseEditorForm course={course} />
      </div>

      <section>
        <h2 className="font-heading text-xl font-semibold">Modules & lessons</h2>
        <form action={addModuleAction} className="mt-4 flex max-w-lg gap-2">
          <input type="hidden" name="courseId" value={course.id} />
          <input name="title" required placeholder="New module title" className="h-10 flex-1 rounded-lg border px-2.5 text-sm" />
          <button type="submit" className={cn(buttonVariants({ variant: "outline" }))}>
            Add module
          </button>
        </form>
        <div className="mt-6 space-y-6">
          {course.modules.map((module) => (
            <div key={module.id} className="rounded-xl border bg-card p-4">
              <h3 className="font-medium">{module.title}</h3>
              <ul className="mt-3 space-y-4">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} className="rounded-lg border p-3">
                    <form action={updateLessonAction} encType="multipart/form-data" className="space-y-2">
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <input type="hidden" name="courseId" value={course.id} />
                      <input name="title" defaultValue={lesson.title} className="h-9 w-full rounded-lg border px-2 text-sm" />
                      <textarea name="body" rows={3} defaultValue={lesson.body} className="w-full rounded-lg border px-2 py-1.5 text-sm" />
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <input
                          name="durationMin"
                          type="number"
                          defaultValue={lesson.durationMin}
                          className="h-9 w-24 rounded-lg border px-2"
                        />
                        <label className="flex items-center gap-1">
                          <input type="checkbox" name="preview" defaultChecked={lesson.preview} />
                          Preview
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {lesson.videoPath ? "Video uploaded" : "No video"}
                        </span>
                      </div>
                      <input type="file" name="video" accept="video/mp4,video/webm,video/quicktime" className="text-xs" />
                      <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>
                        Save lesson
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
              <form action={addLessonAction} encType="multipart/form-data" className="mt-4 space-y-2 border-t pt-4">
                <input type="hidden" name="moduleId" value={module.id} />
                <input type="hidden" name="courseId" value={course.id} />
                <input name="title" required placeholder="New lesson title" className="h-9 w-full rounded-lg border px-2 text-sm" />
                <textarea name="body" rows={3} placeholder="Lesson details / notes" className="w-full rounded-lg border px-2 py-1.5 text-sm" />
                <input name="durationMin" type="number" defaultValue={10} className="h-9 w-24 rounded-lg border px-2 text-sm" />
                <input type="file" name="video" accept="video/mp4,video/webm,video/quicktime" className="block text-xs" />
                <button type="submit" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Add lesson
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

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
