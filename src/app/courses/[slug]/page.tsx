import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Check,
  Clock,
  Languages,
  Star,
  Users,
} from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CourseBuyCard } from "@/components/course/buy-card";
import { CourseCurriculum } from "@/components/course/curriculum";
import { CourseReviews } from "@/components/course/reviews-panel";
import { CourseCard } from "@/components/course-card";
import { Badge } from "@/components/ui/badge";
import { formatBdt, formatStudents } from "@/lib/format";
import { listReviewsForSlug } from "@/lib/reviews";
import {
  categoryLabel,
  courseHours,
  courses,
  getCourse,
  lessonCount,
  type Course,
} from "@/lib/courses";
import { instructorPhotos } from "@/lib/instructor-photos";
import { getCart } from "@/lib/session";
import { getSession } from "@/lib/auth";
import {
  getHomepageLearning,
  getPublishedCourse,
  listPublishedCourses,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

async function loadCourse(slug: string): Promise<Course | null> {
  try {
    const course = await getPublishedCourse(slug);
    if (course) return course;
  } catch {
    /* fall back to the local catalogue */
  }
  return getCourse(slug) ?? null;
}

async function loadRelated(course: Course): Promise<Course[]> {
  try {
    const all = await listPublishedCourses();
    return all
      .filter(
        (item) => item.slug !== course.slug && item.category === course.category
      )
      .slice(0, 3);
  } catch {
    return courses
      .filter(
        (item) => item.slug !== course.slug && item.category === course.category
      )
      .slice(0, 3);
  }
}

function requirementsFor(course: Course) {
  if (course.level === "Beginner") {
    return [
      "No prior experience required",
      "A laptop and a reliable internet connection",
      "Willingness to practice the assignments",
    ];
  }
  if (course.level === "Intermediate") {
    return [
      "Comfortable with the basics of this topic",
      "A laptop you can install the tools on",
      "A real project or client you can apply the work to",
    ];
  }
  return [
    "You already ship work in this field",
    "You want a tighter system, not a beginner tour",
    "A current project to practise on",
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await loadCourse(slug);
  if (!course) return { title: "Course" };
  return {
    title: course.title,
    description: course.subtitle,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await loadCourse(slug);
  if (!course) notFound();

  let cart: string[] = [];
  let owned = false;
  let learning: Awaited<ReturnType<typeof getHomepageLearning>> | null = null;
  try {
    const [currentCart, session] = await Promise.all([
      getCart(),
      getSession(),
    ]);
    cart = currentCart;
    if (session) {
      learning = await getHomepageLearning(session.id);
      owned = learning.ownedSlugs.includes(course.slug);
    }
  } catch {
    /* catalogue still renders without a database */
  }

  const inCart = cart.includes(course.slug);
  const related = await loadRelated(course);
  const photo = instructorPhotos[course.instructor.name];
  let liveReviews: Awaited<ReturnType<typeof listReviewsForSlug>> = [];
  try {
    liveReviews = await listReviewsForSlug(slug);
  } catch {
    /* catalogue still renders without a database */
  }
  const hours = courseHours(course);
  const lessons = lessonCount(course);

  return (
    <div className="pb-28 lg:pb-0">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] border-b bg-[linear-gradient(180deg,oklch(0.98_0.02_70),oklch(0.992_0.006_75))]"
        />

        <div className="relative mx-auto grid w-full max-w-7xl gap-6 overflow-x-clip px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 lg:py-14">
          <div className="order-2 min-w-0 lg:order-1">
            <nav className="text-base text-muted-foreground">
              <Link href="/courses" className="hover:text-foreground">
                Courses
              </Link>
              <span className="mx-2">/</span>
              <Link
                href={`/courses?category=${course.category}`}
                className="hover:text-foreground"
              >
                {categoryLabel(course.category)}
              </Link>
            </nav>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>{categoryLabel(course.category)}</Badge>
              <Badge variant="secondary">{course.level}</Badge>
              <Badge variant="outline">{course.language}</Badge>
            </div>

            <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-pretty sm:mt-5 sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-pretty text-muted-foreground sm:mt-4 sm:text-xl sm:leading-8">
              {course.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-base">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Star className="size-5 fill-primary text-primary" />
                {course.rating.toFixed(1)}
              </span>
              <a href="#reviews" className="text-primary hover:underline">
                ({course.reviewCount.toLocaleString("en-BD")} reviews)
              </a>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-5" />
                {formatStudents(course.students)} learners
              </span>
            </div>

            <p className="mt-4 text-base">
              Created by{" "}
              <a
                href="#instructor"
                className="font-semibold text-primary hover:underline"
              >
                {course.instructor.name}
              </a>
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-base text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-5" />
                {hours}h · {lessons} lectures
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages className="size-5" />
                {course.language}
              </span>
            </div>
          </div>

          <aside className="order-1 -mx-4 lg:order-2 lg:mx-0 lg:row-span-2">
            <div className="lg:sticky lg:top-24">
              <CourseBuyCard course={course} owned={owned} inCart={inCart} />
            </div>
          </aside>

          <div className="order-3 min-w-0 space-y-8 pb-8 sm:space-y-14 sm:pb-16 lg:order-none">
            <nav className="-mx-4 flex gap-6 overflow-x-auto border-y bg-background/90 px-4 text-base font-medium backdrop-blur-md sm:mx-0 sm:rounded-none sm:px-0">
              {[
                ["Overview", "#overview"],
                ["Curriculum", "#curriculum"],
                ["Instructor", "#instructor"],
                ["Reviews", "#reviews"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="shrink-0 border-b-2 border-transparent py-3.5 text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  {label}
                </a>
              ))}
            </nav>
          <section id="overview" className="scroll-mt-28">
            <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
              What you will learn
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {course.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="flex gap-3 rounded-xl border bg-card px-3 py-3 text-sm leading-6 sm:rounded-2xl sm:px-4 sm:py-4 sm:text-base sm:leading-7"
                >
                  <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                  {outcome}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
              This course includes
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                `${hours} hours of on-demand video`,
                `${lessons} lectures you can watch at your pace`,
                `Taught in ${course.language}`,
                "Assignments that look like real work",
                "Lifetime access on your account",
                "Watch on desktop or phone",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-base leading-7"
                >
                  <BadgeCheck className="size-5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <CourseCurriculum modules={course.modules} />

          <section>
            <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
              Requirements
            </h2>
            <ul className="mt-5 space-y-2.5 text-base leading-7 text-muted-foreground">
              {requirementsFor(course).map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
              Description
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              {course.description}
            </p>
          </section>

          <section
            id="instructor"
            className="scroll-mt-28 rounded-3xl border bg-card p-6 sm:p-8"
          >
            <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
              Instructor
            </h2>
            <div className="mt-6 flex items-start gap-4 sm:gap-5">
              {photo ? (
                <img
                  src={photo}
                  alt={course.instructor.name}
                  className="size-16 shrink-0 rounded-xl object-cover sm:size-28 sm:rounded-2xl"
                />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary font-heading text-xl font-semibold text-primary-foreground sm:size-28 sm:rounded-2xl sm:text-3xl">
                  {course.instructor.initials}
                </div>
              )}
              <div>
                <p className="font-heading text-2xl font-semibold">
                  {course.instructor.name}
                </p>
                <p className="mt-1 text-base text-primary">
                  {course.instructor.title}
                </p>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {course.instructor.bio}
                </p>
              </div>
            </div>
          </section>

          <CourseReviews
            rating={course.rating}
            reviewCount={course.reviewCount}
            reviews={liveReviews}
          />
        </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="border-t">
          <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
            <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
              Students also viewed
            </h2>
            <div className="rail -mx-4 mt-5 flex gap-3 px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
              {related.map((item) => {
                const itemOwned = learning?.ownedSlugs.includes(item.slug) ?? false;
                return (
                  <div
                    key={item.slug}
                    className="w-[min(78vw,18.75rem)] shrink-0 snap-start sm:w-auto"
                  >
                    <CourseCard
                      course={item}
                      owned={itemOwned}
                      progress={itemOwned ? learning?.progressBySlug[item.slug] : undefined}
                      compact
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {!owned ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur-md lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-heading text-xl font-semibold">
                {formatBdt(course.priceBdt)}
              </p>
              {course.originalPriceBdt ? (
                <p className="text-sm text-muted-foreground line-through">
                  {formatBdt(course.originalPriceBdt)}
                </p>
              ) : null}
            </div>
            <div className="w-44 shrink-0">
              <AddToCartButton slug={course.slug} owned={owned} inCart={inCart} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
