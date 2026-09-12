"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitReviewAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function ReviewForm({
  slug,
  existing,
}: {
  slug: string;
  existing?: { rating: number; body: string };
}) {
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const { dict } = useLocale();

  return (
    <form action={submitReviewAction} className="rounded-2xl border bg-card p-6 sm:p-8">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />
      <p className="text-xs font-medium tracking-[0.14em] text-primary uppercase">
        {dict.reviewForm.kicker}
      </p>
      <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
        {existing ? dict.reviewForm.updateTitle : dict.reviewForm.newTitle}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {dict.reviewForm.subtitle}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="rounded-lg p-1 hover:bg-muted"
                aria-label={dict.reviewForm.starsAria(value)}
              >
                <Star
                  className={
                    value <= rating
                      ? "size-8 fill-primary text-primary"
                      : "size-8 text-muted-foreground/30"
                  }
                />
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">{dict.reviewForm.ratingLabels[rating - 1]}</p>
      </div>
      <textarea
        name="body"
        required
        minLength={12}
        defaultValue={existing?.body ?? ""}
        placeholder={dict.reviewForm.bodyPlaceholder}
        className="mt-5 min-h-32 w-full rounded-xl border bg-background px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "mt-4 h-11")}
      >
        {existing ? dict.reviewForm.saveReview : dict.reviewForm.postReview}
      </button>
    </form>
  );
}
