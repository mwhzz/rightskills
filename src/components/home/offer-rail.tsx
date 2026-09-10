import Link from "next/link";
import { OfferSlider } from "@/components/home/offer-slider";
import { Reveal } from "@/components/home/reveal";
import {
  offerCardWidthClass,
  offerFrameClass,
  offerImageSrc,
  type HomeOfferRow,
} from "@/lib/home-offers";
import { cn } from "@/lib/utils";

export function OfferRail({ row }: { row: HomeOfferRow }) {
  const items = row.items.filter((item) => item.image);
  if (items.length === 0) return null;

  const cardClass = cn(
    "relative shrink-0 snap-start overflow-hidden rounded-2xl border bg-background",
    offerCardWidthClass[row.shape],
    offerFrameClass[row.shape]
  );

  return (
    <section
      aria-label={row.title || "Offers"}
      className="border-y border-border/80 bg-card/70"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {row.title ? (
          <Reveal className="mb-5">
            <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              {row.title}
            </h2>
          </Reveal>
        ) : null}
        <OfferSlider>
          {items.map((item) => {
            const image = (
              <img
                src={offerImageSrc(item.image)}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            );
            return item.href ? (
              <Link
                key={item.id}
                href={item.href}
                className={cn(cardClass, "transition hover:border-primary/50")}
              >
                {image}
                <span className="sr-only">Open offer</span>
              </Link>
            ) : (
              <div key={item.id} className={cardClass}>
                {image}
              </div>
            );
          })}
        </OfferSlider>
      </div>
    </section>
  );
}
