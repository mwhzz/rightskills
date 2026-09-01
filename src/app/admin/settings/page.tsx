import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { saveSettingsAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole("admin");
  const { saved } = await searchParams;
  const settings = await getSettings();

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Wallet numbers shown to students after checkout.
      </p>
      {saved ? <p className="mt-4 text-sm text-primary">Saved.</p> : null}
      <form action={saveSettingsAction} className="mt-6 space-y-4 rounded-xl border bg-card p-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">bKash number</label>
          <input
            name="bkashNumber"
            defaultValue={settings.bkashNumber}
            className="h-10 w-full rounded-lg border px-2.5 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nagad number</label>
          <input
            name="nagadNumber"
            defaultValue={settings.nagadNumber}
            className="h-10 w-full rounded-lg border px-2.5 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Payment instructions</label>
          <textarea
            name="payInstructions"
            rows={4}
            defaultValue={settings.payInstructions}
            className="w-full rounded-lg border px-2.5 py-2 text-sm"
          />
        </div>
        <button type="submit" className={cn(buttonVariants())}>
          Save
        </button>
      </form>
    </div>
  );
}
