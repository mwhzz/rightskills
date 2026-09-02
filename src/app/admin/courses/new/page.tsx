import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { CourseEditorForm } from "@/components/course-editor-form";

export default async function NewCoursePage() {
  await requireRole("admin", "teacher");
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin/courses" className="hover:text-foreground">
          Courses
        </Link>
        <span className="mx-2">/</span>
        New
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
        New course
      </h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Write the listing students will buy. Save a draft first if you want —
        modules and videos come on the next screen.
      </p>
      <CourseEditorForm />
    </div>
  );
}
