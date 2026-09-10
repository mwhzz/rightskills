import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { parseHomeOffers } from "@/lib/home-offers";
import { OffersForm } from "@/components/admin/offers-form";

export default async function AdminOffersPage({
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
        Offers
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
        Homepage offers
      </h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        The card row under the homepage banner. Each card is one image that can
        link anywhere — add as many offers as you like and learners swipe
        through them.
      </p>
      <div className="mt-8">
        <OffersForm
          row={parseHomeOffers(settings.homeOffers)}
          saved={saved === "1"}
          error={error}
        />
      </div>
    </div>
  );
}
