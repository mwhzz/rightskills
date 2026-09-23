import Link from "next/link";
import { saveJustAddedTitleAction } from "@/app/actions";
import { JustAddedMoveButtons } from "@/components/admin/just-added-move-buttons";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { justAddedOrder, parseHomeJustAdded } from "@/lib/home-just-added";
import { requireAccess } from "@/lib/staff";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminJustAddedPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const staff = await requireAccess("courses");
  if (staff.isTeacher) redirect("/admin/courses");
  const { saved } = await searchParams;
  const [settings, published] = await Promise.all([
    prisma.setting.findUnique({ where: { id: "default" } }),
    prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, banglaTitle: true },
    }),
  ]);
  const config = parseHomeJustAdded(settings?.homeJustAdded);
  const order = justAddedOrder(
    config.courseIds,
    published.map((course) => course.id)
  );
  const byId = new Map(published.map((course) => [course.id, course]));
  const courses = order.flatMap((id) => {
    const course = byId.get(id);
    return course ? [course] : [];
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        Just added
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
        Just added row
      </h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        The course row on the homepage. Rename it, and move courses forward or
        back. A new course lands at the front until you move it.
      </p>

      {saved === "1" ? (
        <p className="mt-4 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
          Row name saved.
        </p>
      ) : null}

      <form action={saveJustAddedTitleAction} className="mt-8 space-y-4 rounded-2xl border bg-card p-5">
        <label className="block">
          <span className="text-sm font-medium">Row name (English)</span>
          <input
            name="title"
            defaultValue={config.title}
            placeholder="Just added"
            maxLength={80}
            className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Row name (Bangla)</span>
          <input
            name="titleBn"
            defaultValue={config.titleBn}
            placeholder="নতুন যোগ হয়েছে"
            maxLength={80}
            className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Leave a language blank to use the default name.
        </p>
        <button type="submit" className={cn(buttonVariants(), "h-10 rounded-xl px-4")}>
          Save name
        </button>
      </form>

      <ul className="mt-6 divide-y overflow-hidden rounded-2xl border bg-card">
        {courses.length === 0 ? (
          <li className="px-5 py-8 text-sm text-muted-foreground">
            Publish a course and it will show up here.
          </li>
        ) : (
          courses.map((course, index) => (
            <li key={course.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{course.title}</p>
                {course.banglaTitle ? (
                  <p className="truncate text-sm text-muted-foreground">{course.banglaTitle}</p>
                ) : null}
              </div>
              <JustAddedMoveButtons
                id={course.id}
                title={course.title}
                isFirst={index === 0}
                isLast={index === courses.length - 1}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
