import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Languages, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton, BuyNowButton } from "@/components/add-to-cart-button";
import { CourseCover } from "@/components/course-cover";
import { CourseCard } from "@/components/course-card";
import {
  categoryLabel,
  courseHours,
  courses,
  getCourse,
  lessonCount,
} from "@/lib/courses";
import { formatBdt, formatStudents } from "@/lib/format";
import { getCart, getOwnedSlugs } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
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
  const course = getCourse(slug);
  if (!course) notFound();

  const [cart, ownedSlugs] = await Promise.all([getCart(), getOwnedSlugs()]);
  const owned = ownedSlugs.includes(course.slug);
  const inCart = cart.includes(course.slug);

  const related = courses
    .filter(
      (item) => item.slug !== course.slug && item.category === course.category
    )
    .slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-sm text-muted-foreground">
        <Link href="/courses" className="hover:text-foreground">
          Courses
        </Link>
        <span className="mx-2">/</span>
        {categoryLabel(course.category)}
      </p>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <CourseCover
            course={course}
            className="aspect-21/9 min-h-48 rounded-2xl"
          />
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>{categoryLabel(course.category)}</Badge>
            <Badge variant="secondary">{course.level}</Badge>
            <Badge variant="outline">{course.language}</Badge>
          </div>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance">
            {course.title}
          </h1>
          <p className="mt-1 text-muted-foreground">{course.banglaTitle}</p>
          <p className="mt-4 max-w-2xl text-base leading-7">
            {course.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)} ({course.reviewCount} reviews)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" />
              {formatStudents(course.students)} learners
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" />
              {courseHours(course)}h · {lessonCount(course)} lessons
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Languages className="size-4" />
              {course.language}
            </span>
          </div>

          <section className="mt-10">
            <h2 className="font-heading text-xl font-semibold">
              What you will walk away with
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {course.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="rounded-lg border bg-card px-3 py-2.5 text-sm leading-6"
                >
                  {outcome}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-xl font-semibold">About</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              {course.description}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-xl font-semibold">Curriculum</h2>
            <div className="mt-4 space-y-2 rounded-xl border bg-card">
              {course.modules.map((module) => (
                <details key={module.id} className="group border-b last:border-b-0" open>
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                    {module.title}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {module.lessons.length} lessons
                    </span>
                  </summary>
                  <ul className="space-y-2 px-4 pb-3">
                    {module.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span>
                          {lesson.title}
                          {lesson.preview ? (
                            <Badge variant="secondary" className="ml-2">
                              Preview
                            </Badge>
                          ) : null}
                        </span>
                        <span className="text-muted-foreground">
                          {lesson.durationMin} min
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-xl border bg-card p-5">
            <h2 className="font-heading text-xl font-semibold">Instructor</h2>
            <div className="mt-4 flex gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {course.instructor.initials}
              </div>
              <div>
                <p className="font-medium">{course.instructor.name}</p>
                <p className="text-sm text-muted-foreground">
                  {course.instructor.title}
                </p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  {course.instructor.bio}
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-end gap-2">
              <p className="text-3xl font-semibold">
                {formatBdt(course.priceBdt)}
              </p>
              {course.originalPriceBdt ? (
                <p className="mb-1 text-sm text-muted-foreground line-through">
                  {formatBdt(course.originalPriceBdt)}
                </p>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              One-time payment · lifetime access on this browser
            </p>
            <div className="mt-5 space-y-2">
              <AddToCartButton
                slug={course.slug}
                owned={owned}
                inCart={inCart}
              />
              <BuyNowButton slug={course.slug} owned={owned} />
            </div>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li>{lessonCount(course)} on-demand lessons</li>
              <li>{courseHours(course)} hours of teaching</li>
              <li>Taught in {course.language}</li>
              <li>Pay with bKash, Nagad, or card</li>
            </ul>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-heading text-xl font-semibold">
            More in {categoryLabel(course.category)}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <CourseCard key={item.slug} course={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
