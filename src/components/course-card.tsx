import Link from "next/link";
import { Star } from "lucide-react";
import { CourseCover } from "@/components/course-cover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  categoryLabel,
  courseHours,
  type Course,
} from "@/lib/courses";
import { formatBdt, formatStudents } from "@/lib/format";
import type { CourseProgress } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function CourseCard({
  course,
  href,
  owned = false,
  progress,
  compact = false,
}: {
  course: Course;
  href?: string;
  owned?: boolean;
  progress?: CourseProgress;
  compact?: boolean;
}) {
  const to = href ?? (owned ? `/learn/${course.slug}` : `/courses/${course.slug}`);
  const pct = progress?.pct ?? 0;
  const finished = Boolean(progress && progress.total > 0 && progress.done >= progress.total);

  return (
    <Link href={to} className="group block h-full min-w-0">
      <Card className="h-full gap-0 overflow-hidden py-0 ring-foreground/8 transition-shadow group-hover:ring-foreground/20">
        <CourseCover
          course={course}
          className={cn("aspect-16/10 w-full shrink-0 rounded-none", compact ? "md:rounded-t-xl" : "rounded-t-xl")}
        />
        <CardContent className="flex flex-1 flex-col gap-1.5 px-3 pt-3 sm:gap-2 sm:px-4 sm:pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{categoryLabel(course.category)}</Badge>
            <Badge variant="outline" className="hidden sm:inline-flex">
              {course.level}
            </Badge>
            {owned ? <Badge>Enrolled</Badge> : null}
          </div>
          <h3 className="font-heading text-[0.95rem] leading-snug font-semibold text-balance group-hover:text-primary sm:text-lg">
            {course.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground sm:text-base">
            {course.subtitle}
          </p>
        </CardContent>
        <CardFooter className="justify-between gap-2 bg-transparent px-3 pt-0 pb-3 sm:gap-3 sm:px-4 sm:pb-4">
          <div className="min-w-0 truncate text-xs text-muted-foreground sm:text-sm">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)}
            </span>
            <span className="hidden sm:inline">
              {" "}
              · {formatStudents(course.students)}
            </span>
            <span className="hidden md:inline"> · {courseHours(course)}h</span>
          </div>
          {owned ? (
            <div className="min-w-16 text-right sm:min-w-24">
              <p className="text-xs font-semibold sm:text-sm">
                {finished ? "Finished" : `${pct}%`}
              </p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${finished ? 100 : pct}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold sm:text-base">
                {formatBdt(course.priceBdt)}
              </p>
              {course.originalPriceBdt ? (
                <p className="text-[10px] text-muted-foreground line-through sm:text-xs">
                  {formatBdt(course.originalPriceBdt)}
                </p>
              ) : null}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
