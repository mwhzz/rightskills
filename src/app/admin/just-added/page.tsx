import Link from "next/link";
import { saveJustAddedTitleAction } from "@/app/actions";
import { JustAddedMoveButtons } from "@/components/admin/just-added-move-buttons";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { coverImageSrc } from "@/lib/cover-image";
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
      select: { id: true, title: true, banglaTitle: true, coverImage: true },
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
  const englishName = config.title || "Just added";
  const banglaName = config.titleBn || "নতুন যোগ হয়েছে";

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
        Homepage row
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        Visitors see <span className="font-medium text-foreground">{englishName}</span>
        {" / "}
        <span className="font-medium text-foreground">{banglaName}</span>. The first
        course sits at the front.
      </p>

      {saved === "1" ? (
        <p className="mt-5 rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm text-foreground">
          Name saved. Refresh the homepage to see it.
        </p>
      ) : null}

      <form
        action={saveJustAddedTitleAction}
        className="mt-6 rounded-[1.5rem] bg-card p-5 shadow-[0_18px_40px_-28px_rgba(80,40,10,0.35)] ring-1 ring-black/5 sm:p-6"
      >
        <p className="font-heading text-lg font-semibold">Row name</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">English</span>
            <input
              name="title"
              defaultValue={config.title}
              placeholder="Just added"
              maxLength={80}
              className="mt-1.5 h-12 w-full rounded-2xl bg-[#fffaf6] px-4 text-[15px] shadow-[inset_0_0_0_1px_rgba(80,40,10,0.1)] outline-none placeholder:text-muted-foreground/50 focus:shadow-[inset_0_0_0_1.5px_var(--primary)]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Bangla</span>
            <input
              name="titleBn"
              defaultValue={config.titleBn}
              placeholder="নতুন যোগ হয়েছে"
              maxLength={80}
              className="mt-1.5 h-12 w-full rounded-2xl bg-[#fffaf6] px-4 text-[15px] shadow-[inset_0_0_0_1px_rgba(80,40,10,0.1)] outline-none placeholder:text-muted-foreground/50 focus:shadow-[inset_0_0_0_1.5px_var(--primary)]"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-muted-foreground">
            Leave a language blank to use the default name.
          </p>
          <button
            type="submit"
            className={cn(buttonVariants(), "h-11 rounded-2xl px-5")}
          >
            Save name
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Order</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Up brings a course forward. Down sends it back.
        </p>
      </div>

      <ul className="mt-4 space-y-2.5">
        {courses.length === 0 ? (
          <li className="rounded-[1.25rem] bg-card px-5 py-10 text-center text-sm text-muted-foreground ring-1 ring-black/5">
            Publish a course and it will show up here.
          </li>
        ) : (
          courses.map((course, index) => {
            const cover = coverImageSrc(course.coverImage);
            return (
              <li
                key={course.id}
                className="flex items-center gap-3 rounded-[1.25rem] bg-card px-3 py-3 shadow-[0_14px_32px_-26px_rgba(80,40,10,0.45)] ring-1 ring-black/5 sm:gap-4 sm:px-4"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff1e6] font-heading text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                {cover ? (
                  <img
                    src={cover}
                    alt=""
                    className="size-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="size-14 shrink-0 rounded-xl bg-[#fff1e6]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{course.title}</p>
                  {course.banglaTitle ? (
                    <p className="truncate text-sm text-muted-foreground">
                      {course.banglaTitle}
                    </p>
                  ) : null}
                </div>
                <JustAddedMoveButtons
                  id={course.id}
                  title={course.title}
                  isFirst={index === 0}
                  isLast={index === courses.length - 1}
                />
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
