import type { Metadata } from "next";
import { CourseCatalog } from "@/components/course-catalog";
import { getSession } from "@/lib/auth";
import { categories, courses } from "@/lib/courses";
import { getHomepageLearning, listPublishedCourses } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse Right Skills courses — web development, design, English, Excel, marketing, and career skills.",
};

async function loadCourses() {
  try {
    return await listPublishedCourses();
  } catch {
    return courses;
  }
}

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
  const catalogue = await loadCourses();
  const session = await getSession();
  const learning = session
    ? await getHomepageLearning(session.id).catch(() => null)
    : null;

  return (
    <div>
      <section className="border-b bg-[linear-gradient(180deg,oklch(0.98_0.02_70),oklch(0.992_0.006_75))]">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase sm:text-base">
            Catalogue
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:mt-3 sm:text-5xl">
            All courses
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-3 sm:text-lg sm:leading-8">
            Pick a path. Filter by topic or level. Every course is built to
            finish — then use on a job.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <CourseCatalog
          courses={catalogue}
          query={params.q ?? ""}
          category={initialCategory ?? "all"}
          level={params.level ?? "all"}
          sort={params.sort ?? "popular"}
          ownedSlugs={learning?.ownedSlugs}
          progressBySlug={learning?.progressBySlug}
        />
      </div>
    </div>
  );
}
