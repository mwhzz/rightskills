import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { parseHomeBanners } from "@/lib/home-banners";
import { BannersForm } from "@/components/admin/banners-form";

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireRole("admin");
  const { saved, error } = await searchParams;
  const settings = await getSettings();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        Banners
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
        Homepage banners
      </h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        These slides sit under the hero. Left side is the offer copy; the
        right side is the image. Use a path like{" "}
        <span className="font-mono text-foreground">/brands/saffron.jpg</span>{" "}
        or a full https URL.
      </p>
      <div className="mt-8">
        <BannersForm
          banners={parseHomeBanners(settings.homeBanners)}
          saved={saved === "1"}
          error={error}
        />
      </div>
    </div>
  );
}
