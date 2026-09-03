import Link from "next/link";
import { BookOpen, CircleCheck, Clock, Wallet } from "lucide-react";
import { CourseCover } from "@/components/course-cover";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapCourse, type CourseRecord } from "@/lib/catalog";
import { categoryLabel } from "@/lib/courses";
import { formatAgo, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";

export async function LearningLibrary({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const user = await requireUser("/learn");
  const [enrollments, progressRows, openOrders, reviewRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            modules: { include: { lessons: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: user.id, completed: true },
      select: { lessonId: true },
    }),
    prisma.order.findMany({
      where: {
        userId: user.id,
        status: { in: ["pending", "awaiting_review"] },
      },
      include: { items: { include: { course: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.courseReview.findMany({
      where: { userId: user.id },
      select: { courseId: true },
    }),
  ]);

  const doneIds = new Set(progressRows.map((row) => row.lessonId));
  const reviewed = new Set(reviewRows.map((row) => row.courseId));
  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  const items = enrollments.map((row) => {
    const course = mapCourse(row.course as CourseRecord);
    const lessons = course.modules.flatMap((module) => module.lessons);
    const total = lessons.length;
    const done = lessons.filter((lesson) => doneIds.has(lesson.id)).length;
    const nextLesson = lessons.find((lesson) => !doneIds.has(lesson.id)) ?? lessons[0];
    const remainingMin = lessons
      .filter((lesson) => !doneIds.has(lesson.id))
      .reduce((sum, lesson) => sum + lesson.durationMin, 0);
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return {
      courseId: row.courseId,
      enrolledAt: row.createdAt,
      course,
      total,
      done,
      pct,
      nextLesson,
      remainingMin,
      complete: total > 0 && done >= total,
    };
  });

  const inProgress = items.filter((item) => !item.complete);
  const completed = items.filter((item) => item.complete);
  const continueItem = inProgress.find((item) => item.done > 0) ?? inProgress[0];

  return (
    <div className={embedded ? undefined : "mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"}>
      <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
        My learning
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-4xl">
            {embedded ? "Your courses" : `Welcome back, ${firstName}`}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Pick up where you left off. Courses show here after an admin marks
            your payment paid.
          </p>
        </div>
        {embedded ? null : (
          <Link
            href="/account/orders"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
          >
            My orders
          </Link>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
        <Stat
          icon={BookOpen}
          label="Unlocked"
          value={`${items.length} course${items.length === 1 ? "" : "s"}`}
        />
        <Stat
          icon={Clock}
          label="In progress"
          value={`${inProgress.length}`}
        />
        <Stat
          icon={CircleCheck}
          label="Finished"
          value={`${completed.length}`}
        />
      </div>

      {openOrders.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
              <Wallet className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-lg font-semibold">
                Payment still open
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Send the exact amount and paste the TrxID. These courses unlock
                after we confirm the payment.
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {openOrders.map((order) => (
                  <li key={order.id}>
                    <span className="font-medium">{order.orderId}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {order.items.map((item) => item.course.title).join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/account/orders"
                className={cn(buttonVariants({ size: "lg" }), "mt-4 h-11")}
              >
                Paste TrxID
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-10 overflow-hidden rounded-2xl border bg-card">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-10">
              <p className="font-heading text-2xl font-semibold">
                Nothing unlocked yet
              </p>
              <p className="mt-2 max-w-md text-base text-muted-foreground">
                Buy a course, send money to our bKash or Nagad number, then
                paste the TrxID. After confirmation it appears here.
              </p>
              <ol className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li>1. Browse the catalogue and add a course to the cart.</li>
                <li>2. Place the order and Send Money for the exact amount.</li>
                <li>3. Paste the TrxID on My orders.</li>
              </ol>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/courses" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
                  Find a course
                </Link>
                <Link
                  href="/account/orders"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
                >
                  Check orders
                </Link>
              </div>
            </div>
            <div className="border-t bg-muted/40 p-8 sm:p-10 lg:border-t-0 lg:border-l">
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                Waiting on payment?
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                If you already paid, the course stays locked until an admin
                matches the TrxID. That is expected — we do not auto-unlock.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {continueItem ? (
            <section className="mt-10">
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Continue
              </p>
              <div className="mt-3 overflow-hidden rounded-2xl border bg-card sm:flex">
                <CourseCover
                  course={continueItem.course}
                  className="h-36 w-full sm:h-auto sm:w-64"
                />
                <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:gap-4 sm:p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {categoryLabel(continueItem.course.category)} ·{" "}
                      {continueItem.course.instructor.name}
                    </p>
                    <h2 className="mt-1 font-heading text-lg font-semibold tracking-tight sm:text-2xl">
                      {continueItem.course.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {continueItem.nextLesson
                        ? `Next: ${continueItem.nextLesson.title}`
                        : "Lessons will appear when the teacher adds them."}
                      {continueItem.remainingMin
                        ? ` · ${formatMinutes(continueItem.remainingMin)} left`
                        : ""}
                    </p>
                    <ProgressBar pct={continueItem.pct} />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {continueItem.done} of {continueItem.total} lessons complete
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={
                        continueItem.nextLesson
                          ? `/learn/${continueItem.course.slug}?lesson=${continueItem.nextLesson.id}`
                          : `/learn/${continueItem.course.slug}`
                      }
                      className={cn(buttonVariants({ size: "lg" }), "h-11 w-full sm:w-auto")}
                    >
                      {continueItem.done === 0 ? "Start course" : "Continue"}
                    </Link>
                    <Link
                      href={`/courses/${continueItem.course.slug}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "h-11 w-full sm:w-auto"
                      )}
                    >
                      Course page
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Your courses
            </h2>
            <ul className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-5">
              {items.map((item) => (
                <li
                  key={item.course.slug}
                  className="flex gap-3 overflow-hidden rounded-2xl border bg-card p-3 sm:block sm:p-0"
                >
                  <CourseCover
                    course={item.course}
                    className="h-20 w-20 shrink-0 rounded-xl sm:h-36 sm:w-full sm:rounded-none"
                  />
                  <div className="min-w-0 flex-1 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-heading text-sm font-semibold leading-snug sm:text-lg">
                          {item.course.title}
                        </h3>
                        <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
                          Unlocked {formatAgo(item.enrolledAt)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:text-xs",
                          item.complete
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.complete ? "Done" : `${item.pct}%`}
                      </span>
                    </div>
                    <ProgressBar pct={item.pct} />
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground sm:mt-2">
                      {item.done} of {item.total} lessons
                      {item.nextLesson && !item.complete
                        ? ` · next: ${item.nextLesson.title}`
                        : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={
                          item.nextLesson
                            ? `/learn/${item.course.slug}?lesson=${item.nextLesson.id}`
                            : `/learn/${item.course.slug}`
                        }
                        className={cn(buttonVariants({ size: "sm" }), "h-8 sm:h-9")}
                      >
                        {item.complete ? "Rewatch" : item.done === 0 ? "Start" : "Continue"}
                      </Link>
                      <Link
                        href={`/learn/${item.course.slug}#review`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "hidden h-8 sm:inline-flex sm:h-9"
                        )}
                      >
                        {reviewed.has(item.courseId) ? "Edit review" : "Write a review"}
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-3 sm:rounded-2xl sm:p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <p className="mt-2 font-heading text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}
