import { Check, Infinity, Languages, MessageCircle, MonitorPlay, Smartphone } from "lucide-react";
import { AddToCartButton, BuyNowButton } from "@/components/add-to-cart-button";
import { CourseCover } from "@/components/course-cover";
import { VideoFrame } from "@/components/video-frame";
import { buttonVariants } from "@/components/ui/button";
import { courseHours, courseTitle, lessonCount, defaultPurchaseNote, type Course } from "@/lib/courses";
import { formatBdt } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getSettings } from "@/lib/queries";
import { videoEmbed } from "@/lib/video";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export async function CourseBuyCard({
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
  const [dict, locale, settings] = await Promise.all([
    getDictionary(),
    getLocale(),
    getSettings().catch(() => null),
  ]);
  const title = courseTitle(course, locale);
  const whatsappHref =
    !owned && settings?.whatsappNumber
      ? whatsappChatUrl(
          settings.whatsappNumber,
          dict.buyCard.whatsappOrderMessage(title, formatBdt(course.priceBdt))
        )
      : null;

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-[0_20px_60px_-28px_rgba(180,70,20,0.28)]">
      <div id="preview" className="bg-zinc-950">
        {preview ? (
          <VideoFrame
            protect
            videoId={preview.kind === "youtube" ? preview.id : undefined}
            url={preview.kind === "youtube" ? undefined : course.promoVideoUrl}
            title={dict.buyCard.previewOf(courseTitle(course, locale))}
          />
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
              {dict.buyCard.discountOff(discount)}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {course.purchaseNote?.trim() || defaultPurchaseNote(locale)}
        </p>
        <div className="mt-5 space-y-2.5">
          <AddToCartButton slug={course.slug} owned={owned} inCart={inCart} />
          <BuyNowButton slug={course.slug} owned={owned} />
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 w-full border-[#25D366] bg-[#25D366] text-base text-white hover:bg-[#1ebe57] hover:text-white focus-visible:border-[#128C7E] focus-visible:ring-[#25D366]/40"
              )}
            >
              <MessageCircle data-icon="inline-start" />
              {dict.buyCard.orderOnWhatsApp}
            </a>
          ) : null}
        </div>
        {whatsappHref ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {dict.buyCard.whatsappOrderHint}
          </p>
        ) : null}
        <ul className="mt-6 space-y-3 text-base">
          <li className="flex items-center gap-3">
            <MonitorPlay className="size-5 text-primary" />
            {dict.buyCard.hoursOnDemand(courseHours(course))}
          </li>
          <li className="flex items-center gap-3">
            <Check className="size-5 text-primary" />
            {dict.buyCard.lectures(lessonCount(course))}
          </li>
          <li className="flex items-center gap-3">
            <Languages className="size-5 text-primary" />
            {dict.buyCard.taughtIn(course.language)}
          </li>
          <li className="flex items-center gap-3">
            <Smartphone className="size-5 text-primary" />
            {dict.buyCard.watchOnDesktopOrPhone}
          </li>
          <li className="flex items-center gap-3">
            <Infinity className="size-5 text-primary" />
            {dict.buyCard.lifetimeAccess}
          </li>
        </ul>
      </div>
    </div>
  );
}
