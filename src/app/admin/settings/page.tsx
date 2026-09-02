import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole("admin");
  const { saved } = await searchParams;
  const settings = await getSettings();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        Settings
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
        Settings
      </h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Wallet numbers and copy shown after checkout. Change them here — not
        in the course listing.
      </p>
      <div className="mt-8">
        <SettingsForm
          bkashNumber={settings.bkashNumber}
          nagadNumber={settings.nagadNumber}
          payInstructions={settings.payInstructions}
          saved={saved === "1"}
        />
      </div>
    </div>
  );
}
