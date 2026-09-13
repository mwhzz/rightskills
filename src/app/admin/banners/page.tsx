import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  moveHomeBannerAction,
  toggleHomeBannerAction,
} from "@/app/actions";
import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import {
  BANNER_MAX,
  bannerImageSrc,
  parseHomeBanners,
} from "@/lib/home-banners";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  await requireRole("admin");
  const { deleted, error } = await searchParams;
  const settings = await getSettings();
  const banners = parseHomeBanners(settings.homeBanners);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin" className="hover:text-foreground">
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            Banners
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
            Banners
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            Each banner has its own page. Desktop and mobile images go in the
            same place. Offers stay under Offers.
          </p>
        </div>
        {banners.length < BANNER_MAX ? (
          <Link href="/admin/banners/new" className={cn(buttonVariants(), "h-10")}>
            Add banner
          </Link>
        ) : null}
      </div>

      {deleted ? (
        <p className="mt-4 rounded-2xl border bg-primary/5 px-4 py-3 text-sm">
          Banner deleted.
        </p>
      ) : null}
      {error === "full" ? (
        <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Maximum {BANNER_MAX} banners. Remove one first.
        </p>
      ) : null}

      {banners.length === 0 ? (
        <p className="mt-8 rounded-2xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          No banners yet. Add one — desktop image, optional mobile image, and a
          link.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Desktop</th>
                <th className="px-4 py-3 font-medium">Mobile</th>
                <th className="px-4 py-3 font-medium">Link</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {banners.map((banner, index) => (
                <tr key={banner.id} className="border-b last:border-0">
                  <td className="px-4 py-3 align-middle text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Thumb src={bannerImageSrc(banner.desktopImage)} wide />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {banner.mobileImage ? (
                      <Thumb src={bannerImageSrc(banner.mobileImage)} />
                    ) : (
                      <span className="text-xs text-muted-foreground">Uses desktop</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <p className="max-w-[14rem] truncate font-mono text-xs">
                      {banner.href || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <form action={toggleHomeBannerAction}>
                      <input type="hidden" name="id" value={banner.id} />
                      <button
                        type="submit"
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          banner.active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {banner.active ? "Active" : "Off"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-1">
                      <MoveButton id={banner.id} dir="up" disabled={index === 0} />
                      <MoveButton
                        id={banner.id}
                        dir="down"
                        disabled={index === banners.length - 1}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <Link
                      href={`/admin/banners/${banner.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Thumb({ src, wide }: { src: string; wide?: boolean }) {
  return (
    <span
      className={cn(
        "block overflow-hidden rounded-md border bg-muted",
        wide ? "h-10 w-24" : "h-10 w-16"
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : null}
    </span>
  );
}

function MoveButton({
  id,
  dir,
  disabled,
}: {
  id: string;
  dir: "up" | "down";
  disabled: boolean;
}) {
  return (
    <form action={moveHomeBannerAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
        aria-label={dir === "up" ? "Move up" : "Move down"}
      >
        {dir === "up" ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>
    </form>
  );
}
