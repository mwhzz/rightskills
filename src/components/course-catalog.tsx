import Link from "next/link";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/course-card";
import { categories, levels, type CategoryId, type Level } from "@/lib/courses";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/courses";
import type { CourseProgress } from "@/lib/queries";

type SortId = "popular" | "price-asc" | "price-desc" | "rating";

function isSort(value: string | undefined): value is SortId {
  return (
    value === "popular" ||
    value === "price-asc" ||
    value === "price-desc" ||
    value === "rating"
  );
}

function catalogHref({
  q,
  category,
  level,
  sort,
}: {
  q: string;
  category: string;
  level: string;
  sort: string;
}) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category !== "all") params.set("category", category);
  if (level !== "all") params.set("level", level);
  if (sort !== "popular") params.set("sort", sort);
  const query = params.toString();
  return query ? `/courses?${query}` : "/courses";
}

export function CourseCatalog({
  courses,
  query = "",
  category = "all",
  level = "all",
  sort = "popular",
  ownedSlugs,
  progressBySlug,
}: {
  courses: Course[];
  query?: string;
  category?: string;
  level?: string;
  sort?: string;
  ownedSlugs?: string[];
  progressBySlug?: Record<string, CourseProgress>;
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
      course.subtitle.toLowerCase().includes(needle) ||
      course.instructor.name.toLowerCase().includes(needle);
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
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Link
          href={catalogHref({
            q: query,
            category: "all",
            level: activeLevel === "all" ? "all" : activeLevel,
            sort: activeSort,
          })}
          className={cn(
            "rounded-full border px-4 py-2 text-base transition",
            activeCategory === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          All
        </Link>
        {categories.map((item) => (
          <Link
            key={item.id}
            href={catalogHref({
              q: query,
              category: item.id,
              level: activeLevel === "all" ? "all" : activeLevel,
              sort: activeSort,
            })}
            className={cn(
              "rounded-full border px-4 py-2 text-base transition",
              activeCategory === item.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <form
        action="/courses"
        method="get"
        className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5"
      >
        {activeCategory !== "all" ? (
          <input type="hidden" name="category" value={activeCategory} />
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search courses or instructors…"
              className="h-12 w-full rounded-xl border border-input bg-transparent pr-4 pl-11 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Search courses"
            />
          </div>
          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-base")}
          >
            Search
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex items-center gap-2 text-base">
            <span className="text-muted-foreground">Level</span>
            <select
              name="level"
              defaultValue={activeLevel === "all" ? "all" : activeLevel}
              className="h-11 rounded-xl border border-input bg-transparent px-3 text-base"
            >
              <option value="all">All levels</option>
              {levels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-base">
            <span className="text-muted-foreground">Sort</span>
            <select
              name="sort"
              defaultValue={activeSort}
              className="h-11 rounded-xl border border-input bg-transparent px-3 text-base"
            >
              <option value="popular">Most learners</option>
              <option value="rating">Highest rated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
          <Link
            href="/courses"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-11 text-base")}
          >
            Reset
          </Link>
        </div>
      </form>

      {sorted.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card px-6 py-20 text-center">
          <p className="font-heading text-2xl font-semibold">No courses match</p>
          <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
            Try another keyword, or reset filters to see the full catalogue.
          </p>
          <Link
            href="/courses"
            className={cn(buttonVariants({ size: "lg" }), "mt-6 h-12 px-6 text-base")}
          >
            Show all courses
          </Link>
        </div>
      ) : (
        <>
          <p className="text-base text-muted-foreground">
            {sorted.length} course{sorted.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((course) => {
              const owned = ownedSlugs?.includes(course.slug) ?? false;
              return (
                <CourseCard
                  key={course.slug}
                  course={course}
                  owned={owned}
                  progress={owned ? progressBySlug?.[course.slug] : undefined}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
