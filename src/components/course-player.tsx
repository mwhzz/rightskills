import Link from "next/link";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { toggleLessonAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { type Course } from "@/lib/courses";
import { cn } from "@/lib/utils";

export function CoursePlayer({
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
  const lessons = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title }))
  );
  const active =
    lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const doneSet = new Set(completed);
  const activeDone = doneSet.has(active.id);

  if (!owned) {
    return (
      <div className="rounded-xl border bg-card px-6 py-16 text-center">
        <Lock className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 font-heading text-lg font-semibold">
          This course is locked
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Purchase {course.title} to watch lessons and track progress.
        </p>
        <Link
          href={`/courses/${course.slug}`}
          className={cn(buttonVariants(), "mt-5")}
        >
          View course
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-xl border bg-card p-3">
        <p className="px-2 pt-1 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Curriculum
        </p>
        <nav className="space-y-1">
          {lessons.map((lesson, index) => {
            const done = doneSet.has(lesson.id);
            const selected = lesson.id === active.id;
            return (
              <Link
                key={lesson.id}
                href={`/learn/${course.slug}?lesson=${lesson.id}`}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm",
                  selected ? "bg-primary/10 text-foreground" : "hover:bg-muted"
                )}
              >
                {done ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                )}
                <span>
                  <span className="block font-medium">
                    {index + 1}. {lesson.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lesson.durationMin} min
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="min-w-0">
        <div className="flex aspect-video items-center justify-center rounded-xl bg-zinc-950 text-center text-white">
          <div className="px-6">
            <p className="text-xs tracking-[0.2em] text-white/50 uppercase">
              Lesson player
            </p>
            <p className="mt-2 font-heading text-xl font-semibold text-balance">
              {active.title}
            </p>
            <p className="mt-1 text-sm text-white/60">
              {active.moduleTitle} · {active.durationMin} min
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold">{active.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {active.body}
            </p>
          </div>
          <form action={toggleLessonAction}>
            <input type="hidden" name="slug" value={course.slug} />
            <input type="hidden" name="lessonId" value={active.id} />
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: activeDone ? "outline" : "default" })
              )}
            >
              {activeDone ? "Mark as not done" : "Mark complete"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
