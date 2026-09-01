import Link from "next/link";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/course-card";
import {
  categories,
  courses,
  levels,
  type CategoryId,
  type Level,
} from "@/lib/courses";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortId = "popular" | "price-asc" | "price-desc" | "rating";

function isSort(value: string | undefined): value is SortId {
  return (
    value === "popular" ||
    value === "price-asc" ||
    value === "price-desc" ||
    value === "rating"
  );
}

export function CourseCatalog({
  query = "",
  category = "all",
  level = "all",
  sort = "popular",
}: {
  query?: string;
  category?: string;
  level?: string;
  sort?: string;
}) {
  const needle = query.trim().toLowerCase();
  const activeCategory = categories.some((item) => item.id === category)
    ? (category as CategoryId)
    : "all";
  const activeLevel = levels.includes(level as Level) ? (level as Level) : "all";
  const activeSort: SortId = isSort(sort) ? sort : "popular";

  const filtered = courses.filter((course) => {
    const matchesQuery =
      needle.length === 0 ||
      course.title.toLowerCase().includes(needle) ||
      course.banglaTitle.toLowerCase().includes(needle) ||
      course.subtitle.toLowerCase().includes(needle);
    const matchesCategory =
      activeCategory === "all" || course.category === activeCategory;
    const matchesLevel = activeLevel === "all" || course.level === activeLevel;
    return matchesQuery && matchesCategory && matchesLevel;
  });

  const sorted = [...filtered];
  if (activeSort === "price-asc") sorted.sort((a, b) => a.priceBdt - b.priceBdt);
  if (activeSort === "price-desc") sorted.sort((a, b) => b.priceBdt - a.priceBdt);
  if (activeSort === "rating") sorted.sort((a, b) => b.rating - a.rating);
  if (activeSort === "popular") sorted.sort((a, b) => b.students - a.students);

  return (
    <div className="space-y-6">
      <form
        action="/courses"
        method="get"
        className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:p-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search web development, IELTS, Excel…"
              className="h-10 w-full rounded-lg border border-input bg-transparent pr-3 pl-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Search courses"
            />
          </div>
          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "h-10")}
          >
            Search
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Category</span>
            <select
              name="category"
              defaultValue={activeCategory === "all" ? "all" : activeCategory}
              className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Level</span>
            <select
              name="level"
              defaultValue={activeLevel === "all" ? "all" : activeLevel}
              className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
            >
              <option value="all">All levels</option>
              {levels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort</span>
            <select
              name="sort"
              defaultValue={activeSort}
              className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
            >
              <option value="popular">Most learners</option>
              <option value="rating">Highest rated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
          <Link
            href="/courses"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Reset
          </Link>
        </div>
      </form>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">No courses match</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Try another keyword, or reset filters to see the full Skills
            Bangladesh catalogue.
          </p>
          <Link href="/courses" className={cn(buttonVariants(), "mt-4")}>
            Show all courses
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {sorted.length} course{sorted.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
