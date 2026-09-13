import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteHomeBannerAction } from "@/app/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/queries";
import { parseHomeBanners } from "@/lib/home-banners";
import { BannerEditorForm } from "@/components/admin/banner-editor-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function EditBannerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const { error, saved } = await searchParams;
  const [settings, courses] = await Promise.all([
    getSettings(),
    prisma.course.findMany({
      where: { published: true },
      select: { title: true, slug: true },
      orderBy: { title: "asc" },
    }),
  ]);
  const banner = parseHomeBanners(settings.homeBanners).find((item) => item.id === id);
  if (!banner) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin/banners" className="hover:text-foreground">
          Banners
        </Link>
        <span className="mx-2">/</span>
        Edit
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
        Edit banner
      </h1>
      {saved ? (
        <p className="mt-4 rounded-2xl border bg-primary/5 px-4 py-3 text-sm">
          Banner saved. It will show on the homepage if it is active.
        </p>
      ) : null}
      <div className="mt-8">
        <BannerEditorForm banner={banner} courses={courses} error={error} />
      </div>

      <section className="mt-10 rounded-2xl border border-destructive/30 bg-card p-5">
        <h2 className="font-heading text-lg font-semibold text-destructive">
          Delete banner
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Removes this slide from the homepage. This cannot be undone.
        </p>
        <form action={deleteHomeBannerAction} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={banner.id} />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="confirm" className="mt-1 size-4" />
            <span>Yes, delete this banner.</span>
          </label>
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "destructive" }), "h-10")}
          >
            Delete banner
          </button>
        </form>
      </section>
    </div>
  );
}
