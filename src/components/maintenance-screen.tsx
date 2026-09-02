import { BrandMark } from "@/components/brand-mark";
import { brand } from "@/lib/brand";

export function MaintenanceScreen() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.92_0.06_55),transparent_55%)]"
      />
      <div className="relative mx-auto w-full max-w-lg rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-sm sm:px-10">
        <BrandMark className="mx-auto size-12 text-primary" />
        <p className="mt-6 text-sm font-medium text-primary">{brand.name}</p>
        <h1 className="mt-2 font-heading text-3xl tracking-tight">
          Under maintenance
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We are updating the site and will be back shortly. Please check again
          in a little while.
        </p>
      </div>
    </div>
  );
}
