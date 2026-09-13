import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BannerEditorForm } from "@/components/admin/banner-editor-form";

export default async function NewBannerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("admin");
  const { error } = await searchParams;
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { title: true, slug: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin/banners" className="hover:text-foreground">
          Banners
        </Link>
        <span className="mx-2">/</span>
        New
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
        Add banner
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Upload desktop and mobile in one place. Link it to a course or any URL.
      </p>
      <div className="mt-8">
        <BannerEditorForm courses={courses} error={error} />
      </div>
    </div>
  );
}
