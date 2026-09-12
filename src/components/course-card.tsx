import Link from "next/link";
import { Star } from "lucide-react";
import { CardBuyNowButton } from "@/components/add-to-cart-button";
import { CourseCover } from "@/components/course-cover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getDictionary, getLocale } from "@/lib/i18n";
import {
  categoryLabel,
  courseHours,
  courseTitle,
  levelLabel,
  type Course,
} from "@/lib/courses";
import { formatBdt, formatStudents } from "@/lib/format";
import type { CourseProgress } from "@/lib/queries";

export async function CourseCard({
  course,
  href,
  owned = false,
  progress,
}: {
  course: Course;
  href?: string;
  owned?: boolean;
  progress?: CourseProgress;
}) {
  const to = href ?? (owned ? `/learn/${course.slug}` : `/courses/${course.slug}`);
  const pct = progress?.pct ?? 0;
  const finished = Boolean(progress && progress.total > 0 && progress.done >= progress.total);
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <Card className="group relative h-full py-0 ring-foreground/8 transition-shadow hover:ring-foreground/20">
      <CourseCover course={course} className="aspect-16/10 rounded-t-xl" />
      <CardContent className="flex flex-1 flex-col gap-2 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{categoryLabel(course.category, locale)}</Badge>
          {course.level ? (
            <Badge variant="outline">{levelLabel(course.level, locale)}</Badge>
          ) : null}
          {owned ? <Badge>{dict.courseCard.enrolled}</Badge> : null}
        </div>
        <h3 className="font-heading text-lg leading-snug font-semibold text-balance">
          {/* Stretched link: covers the whole card so the card stays clickable. */}
          <Link href={to} className="after:absolute after:inset-0 group-hover:text-primary">
            {courseTitle(course, locale)}
          </Link>
        </h3>
        <p className="line-clamp-2 text-base text-muted-foreground">
          {course.subtitle}
        </p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3 bg-transparent">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)}
            </span>
            <span>· {formatStudents(course.students)} {dict.courseCard.learners}</span>
            <span className="hidden sm:inline">· {courseHours(course)}h</span>
          </div>
          {owned ? (
            <div className="min-w-24 text-right">
              <p className="text-sm font-semibold">
                {finished ? dict.courseCard.finished : dict.courseCard.percentDone(pct)}
              </p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${finished ? 100 : pct}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-right">
              <p className="text-base font-semibold">{formatBdt(course.priceBdt)}</p>
              {course.originalPriceBdt ? (
                <p className="text-xs text-muted-foreground line-through">
                  {formatBdt(course.originalPriceBdt)}
                </p>
              ) : null}
            </div>
          )}
        </div>
        {owned ? null : <CardBuyNowButton slug={course.slug} />}
      </CardFooter>
    </Card>
  );
}
