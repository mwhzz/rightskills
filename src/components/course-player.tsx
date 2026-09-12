import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  Lock,
} from "lucide-react";
import { toggleLessonAction } from "@/app/actions";
import { VideoFrame } from "@/components/video-frame";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/lib/i18n";
import { courseTitle, levelLabel, type Course } from "@/lib/courses";
import { formatBytes, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";

export async function CoursePlayer({
  course,
  owned,
  activeLessonId,
  completed,
}: {
  course: Course;
  owned: boolean;
  activeLessonId?: string;
  completed: string[];
}) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const lessons = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title }))
  );
  const activeIndex = Math.max(
    0,
    lessons.findIndex((lesson) => lesson.id === activeLessonId)
  );
  const active = lessons[activeIndex] ?? lessons[0];
  const doneSet = new Set(completed);
  const doneCount = lessons.filter((lesson) => doneSet.has(lesson.id)).length;
  const pct = lessons.length === 0 ? 0 : Math.round((doneCount / lessons.length) * 100);
  const prev = lessons[activeIndex - 1];
  const next = lessons[activeIndex + 1];

  if (!owned) {
    return (
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="px-6 py-16 text-center sm:px-10">
          <Lock className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-4 font-heading text-2xl font-semibold">
            {dict.coursePlayer.lockedTitle}
          </p>
          <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
            {dict.coursePlayer.lockedBody(courseTitle(course, locale))}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href={`/courses/${course.slug}`}
              className={cn(buttonVariants({ size: "lg" }), "h-11")}
            >
              {dict.coursePlayer.viewCourse}
            </Link>
            <Link
              href="/account/orders"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
            >
              {dict.coursePlayer.checkPayment}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="rounded-2xl border bg-card px-6 py-16 text-center">
        <p className="font-heading text-2xl font-semibold">{dict.coursePlayer.noLessonsTitle}</p>
        <p className="mt-2 text-base text-muted-foreground">
          {dict.coursePlayer.noLessonsBody}
        </p>
      </div>
    );
  }

  const activeDone = doneSet.has(active.id);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {course.instructor.name}
            {course.level ? ` · ${levelLabel(course.level, locale)}` : ""} · {course.language}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {courseTitle(course, locale)}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {dict.coursePlayer.lessonsOfPct(doneCount, lessons.length, pct)}
        </p>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0">
          <div className="overflow-hidden rounded-2xl bg-zinc-950 shadow-sm">
            {active.videoPath || active.videoUrl ? (
              <VideoFrame
                playerKey={active.id}
                filePath={active.videoPath ? `/api/lessons/${active.id}/video` : null}
                url={active.videoUrl}
                title={active.title}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-center text-white">
                <div className="px-6">
                  <p className="text-xs tracking-[0.2em] text-white/50 uppercase">
                    {dict.coursePlayer.lessonPlayer}
                  </p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-balance">
                    {active.title}
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    {active.moduleTitle} · {formatMinutes(active.durationMin)}
                  </p>
                  <p className="mt-3 text-xs text-white/40">
                    {dict.coursePlayer.videoNotUploaded}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl border bg-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  {active.moduleTitle}
                </p>
                <h2 className="mt-1 font-heading text-2xl font-semibold">
                  {active.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dict.coursePlayer.lessonOf(
                    activeIndex + 1,
                    lessons.length,
                    formatMinutes(active.durationMin)
                  )}
                </p>
              </div>
              <form action={toggleLessonAction}>
                <input type="hidden" name="slug" value={course.slug} />
                <input type="hidden" name="lessonId" value={active.id} />
                <button
                  type="submit"
                  className={cn(
                    buttonVariants({
                      variant: activeDone ? "outline" : "default",
                      size: "lg",
                    }),
                    "h-11"
                  )}
                >
                  {activeDone ? dict.coursePlayer.markNotDone : dict.coursePlayer.markComplete}
                </button>
              </form>
            </div>
            {active.body ? (
              <p className="mt-5 max-w-3xl text-base leading-7 whitespace-pre-wrap text-muted-foreground">
                {active.body}
              </p>
            ) : null}

            {active.resources && active.resources.length > 0 ? (
              <div className="mt-6">
                <p className="text-sm font-medium">{dict.coursePlayer.resources}</p>
                <ul className="mt-2 divide-y rounded-xl border">
                  {active.resources.map((resource) => (
                    <li key={resource.id}>
                      <a
                        href={`/api/lessons/${active.id}/resources/${resource.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/50"
                      >
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <FileText className="size-4 shrink-0 text-primary" />
                          <span className="truncate font-medium">{resource.name}</span>
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {formatBytes(resource.sizeBytes)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-between gap-2 border-t pt-4">
              {prev ? (
                <Link
                  href={`/learn/${course.slug}?lesson=${prev.id}`}
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  <ChevronLeft data-icon="inline-start" />
                  {dict.coursePlayer.previous}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/learn/${course.slug}?lesson=${next.id}`}
                  className={cn(buttonVariants())}
                >
                  {dict.coursePlayer.nextLesson}
                  <ChevronRight data-icon="inline-end" />
                </Link>
              ) : (
                <Link href="#review" className={cn(buttonVariants({ variant: "outline" }))}>
                  {dict.coursePlayer.rateThisCourse}
                </Link>
              )}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border bg-card p-3 lg:sticky lg:top-24">
          <p className="px-2 pt-2 pb-3 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {dict.coursePlayer.curriculum}
          </p>
          <nav className="space-y-4">
            {course.modules.map((module) => (
              <div key={module.id}>
                <p className="px-2 pb-1 text-sm font-medium">{module.title}</p>
                <div className="space-y-0.5">
                  {module.lessons.map((lesson) => {
                    const done = doneSet.has(lesson.id);
                    const selected = lesson.id === active.id;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${course.slug}?lesson=${lesson.id}`}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left text-sm",
                          selected
                            ? "bg-primary/10 text-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        ) : (
                          <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="min-w-0">
                          <span className="block leading-snug font-medium">
                            {lesson.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatMinutes(lesson.durationMin)}
                            {lesson.videoPath || lesson.videoUrl ? "" : dict.coursePlayer.notesSuffix}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
