import { requireRole } from "@/lib/auth";
import { CourseEditorForm } from "@/components/course-editor-form";

export default async function NewCoursePage() {
  await requireRole("admin", "teacher");
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">New course</h1>
      <CourseEditorForm />
    </div>
  );
}
