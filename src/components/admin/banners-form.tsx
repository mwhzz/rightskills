"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { saveHomeBannersAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bannerImageSrc, type HomeBanner, type HomeBannerSet } from "@/lib/home-banners";
import { IMAGE_MAX_BYTES } from "@/lib/upload-limits";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

function blankBanner(prefix: string): HomeBanner {
  return {
    id: `${prefix}-${Date.now().toString(36)}`,
    image: "",
    href: "/courses",
    durationSec: 5,
  };
}

export function BannersForm({
  banners,
  saved,
  error,
}: {
  banners: HomeBannerSet;
  saved?: boolean;
  error?: string;
}) {
  const [desktop, setDesktop] = useState<HomeBanner[]>(
    banners.desktop.length ? banners.desktop : [blankBanner("desk")]
  );
  const [mobile, setMobile] = useState<HomeBanner[]>(
    banners.mobile.length ? banners.mobile : [blankBanner("mob")]
  );
  const [previews, setPreviews] = useState<Record<string, string>>({});

  return (
    <form action={saveHomeBannersAction} className="space-y-8">
      <input
        type="hidden"
        name="banners"
        value={JSON.stringify({ desktop, mobile })}
      />
      {saved ? (
        <p className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          Saved. Desktop and mobile sliders update on the next visit.
        </p>
      ) : null}
      {error === "empty" ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Add at least one image for desktop or mobile.
        </p>
      ) : null}
      {error === "json" ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not save those banners. Check each link starts with / or https://.
        </p>
      ) : null}
      {error === "photo" ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Photo must be JPG, PNG, WEBP, or GIF, and 5MB or smaller.
        </p>
      ) : null}

      <BannerGroup
        title="Desktop banners"
        description="Wide images for laptop and tablet. Recommended 1920×640. No text is drawn on top — put any copy in the image itself."
        device="desktop"
        items={desktop}
        setItems={setDesktop}
        previews={previews}
        setPreviews={setPreviews}
      />
      <BannerGroup
        title="Mobile banners"
        description="Taller crop for phones. Recommended 1080×720. Phones only see this set."
        device="mobile"
        items={mobile}
        setItems={setMobile}
        previews={previews}
        setPreviews={setPreviews}
      />

      <button type="submit" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
        Save banners
      </button>
    </form>
  );
}

function BannerGroup({
  title,
  description,
  device,
  items,
  setItems,
  previews,
  setPreviews,
}: {
  title: string;
  description: string;
  device: "desktop" | "mobile";
  items: HomeBanner[];
  setItems: React.Dispatch<React.SetStateAction<HomeBanner[]>>;
  previews: Record<string, string>;
  setPreviews: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  function update(index: number, patch: Partial<HomeBanner>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function move(index: number, dir: -1 | 1) {
    setItems((current) => {
      const next = [...current];
      const target = index + dir;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={item.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {title.replace(" banners", "")} {index + 1}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => move(index, -1)}
                  aria-label="Move up"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => move(index, 1)}
                  aria-label="Move down"
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    setItems((current) => current.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </button>
              </div>
            </div>
            <div
              className={cn(
                "mt-4 overflow-hidden rounded-xl bg-muted",
                device === "mobile" ? "aspect-[3/2]" : "aspect-[3/1]"
              )}
            >
              {previews[item.id] || item.image ? (
                <img
                  src={previews[item.id] || bannerImageSrc(item.image)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Image" className="sm:col-span-2">
                <input
                  type="file"
                  name={`file-${device}-${item.id}`}
                  accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                  className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > IMAGE_MAX_BYTES) {
                      event.target.value = "";
                      return;
                    }
                    setPreviews((current) => ({
                      ...current,
                      [item.id]: URL.createObjectURL(file),
                    }));
                  }}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG, WEBP, or GIF · up to {formatBytes(IMAGE_MAX_BYTES)}.
                  Leave empty to keep the current image.
                </p>
              </Field>
              <Field label="Seconds on screen">
                <Input
                  type="number"
                  min={2}
                  max={30}
                  value={String(item.durationSec)}
                  onChange={(event) =>
                    update(index, {
                      durationSec: Number(event.target.value) || 5,
                    })
                  }
                  className="h-10"
                />
              </Field>
              <Field label="Link (optional)">
                <Input
                  value={item.href}
                  onChange={(event) =>
                    update(index, { href: event.target.value })
                  }
                  placeholder="/courses or https://..."
                  className="h-10"
                />
              </Field>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={() =>
          setItems((current) =>
            [...current, blankBanner(device === "desktop" ? "desk" : "mob")].slice(
              0,
              8
            )
          )
        }
      >
        Add {device} banner
      </button>
    </section>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-sm">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
