import { Check, Infinity, Languages, MonitorPlay, Smartphone } from "lucide-react";
import { AddToCartButton, BuyNowButton } from "@/components/add-to-cart-button";
import { CourseCover } from "@/components/course-cover";
import { VideoFrame } from "@/components/video-frame";
import { courseHours, lessonCount, DEFAULT_PURCHASE_NOTE, type Course } from "@/lib/courses";
import { formatBdt } from "@/lib/format";
import { videoEmbed } from "@/lib/video";

export function CourseBuyCard({
  course,
  owned,
  inCart,
}: {
  course: Course;
  owned: boolean;
  inCart: boolean;
}) {
  const preview = videoEmbed(course.promoVideoUrl);
  const discount =
    course.originalPriceBdt && course.originalPriceBdt > course.priceBdt
      ? Math.round(
          (1 - course.priceBdt / course.originalPriceBdt) * 100
        )
      : 0;

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-[0_20px_60px_-28px_rgba(180,70,20,0.28)]">
      <div id="preview" className="bg-zinc-950">
        {preview ? (
          <VideoFrame url={course.promoVideoUrl} title={`Preview of ${course.title}`} />
        ) : (
          <CourseCover course={course} className="aspect-video" />
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-end gap-3">
          <p className="font-heading text-4xl font-semibold tracking-tight">
            {formatBdt(course.priceBdt)}
          </p>
          {course.originalPriceBdt ? (
            <p className="mb-1 text-lg text-muted-foreground line-through">
              {formatBdt(course.originalPriceBdt)}
            </p>
          ) : null}
          {discount > 0 ? (
            <span className="mb-1 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
              {discount}% off
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {course.purchaseNote?.trim() || DEFAULT_PURCHASE_NOTE}
        </p>
        <div className="mt-5 space-y-2.5">
          <AddToCartButton slug={course.slug} owned={owned} inCart={inCart} />
          <BuyNowButton slug={course.slug} owned={owned} />
        </div>
        <ul className="mt-6 space-y-3 text-base">
          <li className="flex items-center gap-3">
            <MonitorPlay className="size-5 text-primary" />
            {courseHours(course)} hours on-demand video
          </li>
          <li className="flex items-center gap-3">
            <Check className="size-5 text-primary" />
            {lessonCount(course)} lectures
          </li>
          <li className="flex items-center gap-3">
            <Languages className="size-5 text-primary" />
            Taught in {course.language}
          </li>
          <li className="flex items-center gap-3">
            <Smartphone className="size-5 text-primary" />
            Watch on desktop or phone
          </li>
          <li className="flex items-center gap-3">
            <Infinity className="size-5 text-primary" />
            Lifetime access on your account
          </li>
        </ul>
      </div>
    </div>
  );
}
