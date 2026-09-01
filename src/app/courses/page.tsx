import type { Metadata } from "next";
import { CourseCatalog } from "@/components/course-catalog";
import { categories } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse Skills Bangladesh courses — web development, design, English, Excel, marketing, and career skills priced in BDT.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    level?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const initialCategory = categories.some((item) => item.id === params.category)
    ? params.category
    : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          All courses
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Filter by category or search. Every course is priced in Bangladeshi
          taka and taught for work you can do from here.
        </p>
      </div>
      <CourseCatalog
        query={params.q ?? ""}
        category={initialCategory ?? "all"}
        level={params.level ?? "all"}
        sort={params.sort ?? "popular"}
      />
    </div>
  );
}
