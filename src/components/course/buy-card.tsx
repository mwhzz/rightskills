import { Check, Infinity, Languages, MonitorPlay, Smartphone } from "lucide-react";
import { AddToCartButton, BuyNowButton } from "@/components/add-to-cart-button";
import { HomeVideo } from "@/components/home/home-video";
import { brand } from "@/lib/brand";
import { courseHours, lessonCount, type Course } from "@/lib/courses";
import { formatBdt } from "@/lib/format";

export function CourseBuyCard({
  course,
  owned,
  inCart,
}: {
  course: Course;
  owned: boolean;
  inCart: boolean;
}) {
  const discount =
    course.originalPriceBdt && course.originalPriceBdt > course.priceBdt
      ? Math.round(
          (1 - course.priceBdt / course.originalPriceBdt) * 100
        )
      : 0;

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-[0_20px_60px_-28px_rgba(180,70,20,0.28)]">
      <div id="preview">
        <HomeVideo
          src={brand.lessonVideo}
          label={`Preview of ${course.title}`}
          autoPlay={false}
          className="aspect-video"
          overlay={
            <div className="absolute inset-x-0 bottom-0 z-10 p-4">
              <p className="text-sm font-medium text-white">
                Preview this course
              </p>
            </div>
          }
        />
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
          One-time payment. Add to cart without an account — you log in when
          you place the order. The course unlocks after we confirm your TrxID.
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
