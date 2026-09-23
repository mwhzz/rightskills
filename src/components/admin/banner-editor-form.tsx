"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { saveHomeBannerAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BANNER_RECOMMENDED,
  bannerFrameClass,
  bannerImageSrc,
  type HomeBanner,
} from "@/lib/home-banners";
import { IMAGE_MAX_BYTES } from "@/lib/upload-limits";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-base md:text-sm";

const errors: Record<string, string> = {
  empty: "Upload a desktop image.",
  photo: "Photo must be JPG, PNG, WEBP, or GIF, and 5MB or smaller.",
  confirm: "Tick the box to confirm delete.",
};

export function BannerEditorForm({
  banner,
  courses,
  error,
}: {
  banner?: HomeBanner;
  courses: { title: string; slug: string }[];
  error?: string;
}) {
  const [href, setHref] = useState(banner?.href ?? "");
  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const [desktopSize, setDesktopSize] = useState<{ width: number; height: number } | null>(
    null
  );
  const [mobileSize, setMobileSize] = useState<{ width: number; height: number } | null>(
    null
  );

  return (
    <form action={saveHomeBannerAction} className="space-y-6">
      {banner ? <input type="hidden" name="id" value={banner.id} /> : null}
      <input type="hidden" name="desktopImage" value={banner?.desktopImage ?? ""} />
      <input type="hidden" name="mobileImage" value={banner?.mobileImage ?? ""} />

      {error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errors[error] ?? "Could not save this banner."}
        </p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <UploadCard
          title="Desktop"
          hint={`Recommended ${BANNER_RECOMMENDED.desktop.label}`}
          device="desktop"
          name="file-desktop"
          preview={desktopPreview || (banner ? bannerImageSrc(banner.desktopImage) : "")}
          size={desktopSize}
          recommended={BANNER_RECOMMENDED.desktop}
          onFile={(file) =>
            readPreview(file, setDesktopPreview, setDesktopSize)
          }
        />
        <UploadCard
          title="Mobile"
          hint={`Optional. Recommended ${BANNER_RECOMMENDED.mobile.label}. Skip this and phones use the desktop image.`}
          device="mobile"
          name="file-mobile"
          preview={mobilePreview || (banner?.mobileImage ? bannerImageSrc(banner.mobileImage) : "")}
          size={mobileSize}
          recommended={BANNER_RECOMMENDED.mobile}
          onFile={(file) => readPreview(file, setMobilePreview, setMobileSize)}
        />
      </section>

      {banner?.mobileImage ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="removeMobile" className="size-4" />
          Remove the mobile image (phones will use desktop)
        </label>
      ) : null}

      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Where it goes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a course, or type any site path / URL.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Course</span>
            <select
              className={fieldClass}
              value={
                href === "/courses" ||
                courses.some((course) => href === `/courses/${course.slug}`)
                  ? href
                  : ""
              }
              onChange={(event) => {
                if (event.target.value) setHref(event.target.value);
              }}
            >
              <option value="">Custom link</option>
              <option value="/courses">All courses</option>
              {courses.map((course) => (
                <option key={course.slug} value={`/courses/${course.slug}`}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Link</span>
            <Input
              name="href"
              value={href}
              onValueChange={setHref}
              placeholder="/courses or https://..."
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Show for (seconds)</span>
            <Input
              name="durationSec"
              type="number"
              min={2}
              max={30}
              defaultValue={String(banner?.durationSec ?? 5)}
              className={fieldClass}
            />
            <span className="block text-xs text-muted-foreground">
              How long this banner stays before the next one slides in. 2–30 seconds.
            </span>
          </label>
          <label className="flex items-center gap-2 pt-7 text-sm font-medium">
            <input
              type="checkbox"
              name="active"
              defaultChecked={banner?.active ?? true}
              className="size-4"
            />
            Show on the homepage
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <SaveBannerButton label={banner ? "Save banner" : "Add banner"} />
        <Link
          href="/admin/banners"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
        >
          Back to list
        </Link>
      </div>
    </form>
  );
}

function SaveBannerButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(buttonVariants({ size: "lg" }), "h-11")}
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function readPreview(
  file: File,
  setPreview: (url: string) => void,
  setSize: (size: { width: number; height: number }) => void
) {
  if (file.size > IMAGE_MAX_BYTES) return;
  const url = URL.createObjectURL(file);
  setPreview(url);
  const probe = new Image();
  probe.onload = () => {
    setSize({ width: probe.naturalWidth, height: probe.naturalHeight });
  };
  probe.src = url;
}

function UploadCard({
  title,
  hint,
  device,
  name,
  preview,
  size,
  recommended,
  onFile,
}: {
  title: string;
  hint: string;
  device: "desktop" | "mobile";
  name: string;
  preview: string;
  size: { width: number; height: number } | null;
  recommended: { width: number; height: number; label: string };
  onFile: (file: File) => void;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <div
        className={cn(
          "relative mt-4 overflow-hidden rounded-xl bg-muted/40",
          bannerFrameClass[device]
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Upload {recommended.label}
          </div>
        )}
      </div>
      <input
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        className="mt-4 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (file.size > IMAGE_MAX_BYTES) {
            event.target.value = "";
            return;
          }
          onFile(file);
        }}
      />
      {size ? (
        <p
          className={cn(
            "mt-2 text-xs",
            size.width === recommended.width && size.height === recommended.height
              ? "text-muted-foreground"
              : "text-foreground"
          )}
        >
          This file is {size.width} × {size.height} px. Recommended {recommended.label}.
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          JPG, PNG, WEBP, or GIF · up to {formatBytes(IMAGE_MAX_BYTES)}.
        </p>
      )}
    </section>
  );
}
