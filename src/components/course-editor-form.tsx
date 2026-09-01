import { saveCourseAction } from "@/app/actions";
import { categories, levels } from "@/lib/courses";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Course } from "@prisma/client";

export function CourseEditorForm({
  course,
}: {
  course?: Course | null;
}) {
  const outcomes = course
    ? (Array.isArray(course.outcomes) ? (course.outcomes as string[]).join("\n") : "")
    : "";

  return (
    <form action={saveCourseAction} className="mt-6 max-w-2xl space-y-4 rounded-xl border bg-card p-5">
      {course ? <input type="hidden" name="id" value={course.id} /> : null}
      <input name="title" required defaultValue={course?.title} placeholder="Title" className="h-10 w-full rounded-lg border px-2.5 text-sm" />
      <input name="banglaTitle" defaultValue={course?.banglaTitle} placeholder="Bangla title" className="h-10 w-full rounded-lg border px-2.5 text-sm" />
      <input name="slug" defaultValue={course?.slug} placeholder="url-slug" className="h-10 w-full rounded-lg border px-2.5 text-sm" />
      <input name="subtitle" defaultValue={course?.subtitle} placeholder="Subtitle" className="h-10 w-full rounded-lg border px-2.5 text-sm" />
      <textarea name="description" rows={4} defaultValue={course?.description} placeholder="Description" className="w-full rounded-lg border px-2.5 py-2 text-sm" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="category" defaultValue={course?.category ?? "development"} className="h-10 rounded-lg border px-2 text-sm">
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <select name="level" defaultValue={course?.level ?? "Beginner"} className="h-10 rounded-lg border px-2 text-sm">
          {levels.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input name="language" defaultValue={course?.language ?? "Bangla + English"} className="h-10 rounded-lg border px-2.5 text-sm" />
        <input name="priceBdt" type="number" required defaultValue={course?.priceBdt ?? 1990} className="h-10 rounded-lg border px-2.5 text-sm" />
        <input name="originalPriceBdt" type="number" defaultValue={course?.originalPriceBdt ?? ""} placeholder="Original price" className="h-10 rounded-lg border px-2.5 text-sm" />
      </div>
      <textarea name="outcomes" rows={4} defaultValue={outcomes} placeholder="Outcomes, one per line" className="w-full rounded-lg border px-2.5 py-2 text-sm" />
      <input name="instructorName" defaultValue={course?.instructorName} placeholder="Instructor name" className="h-10 w-full rounded-lg border px-2.5 text-sm" />
      <input name="instructorTitle" defaultValue={course?.instructorTitle} placeholder="Instructor title" className="h-10 w-full rounded-lg border px-2.5 text-sm" />
      <textarea name="instructorBio" rows={3} defaultValue={course?.instructorBio} placeholder="Instructor bio" className="w-full rounded-lg border px-2.5 py-2 text-sm" />
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="published" defaultChecked={course?.published ?? true} />
          Published
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={course?.featured ?? false} />
          Featured
        </label>
      </div>
      <button type="submit" className={cn(buttonVariants())}>
        Save course
      </button>
    </form>
  );
}
