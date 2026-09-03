"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HomeBanner } from "@/lib/home-banners";

export function OfferBanner({
  banners,
  size = "default",
}: {
  banners: HomeBanner[];
  size?: "default" | "hero";
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = banners[index];

  useEffect(() => {
    if (banners.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [banners.length, paused]);

  if (!slide) return null;

  function go(next: number) {
    setIndex((next + banners.length) % banners.length);
  }

  function renderControls() {
    if (banners.length < 2) return null;
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {banners.map((item, dot) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show offer ${dot + 1}`}
              aria-current={dot === index}
              onClick={() => setIndex(dot)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dot === index
                  ? "w-5 bg-primary"
                  : size === "hero"
                    ? "w-1.5 bg-white/40 hover:bg-white/70"
                    : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(index - 1)}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full border transition",
            size === "hero"
              ? "border-white/30 bg-black/25 text-white hover:border-white hover:bg-black/40"
              : "size-7 border bg-background text-foreground hover:border-primary hover:text-primary"
          )}
          aria-label="Previous offer"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full border transition",
            size === "hero"
              ? "border-white/30 bg-black/25 text-white hover:border-white hover:bg-black/40"
              : "size-7 border bg-background text-foreground hover:border-primary hover:text-primary"
          )}
          aria-label="Next offer"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={cn(
          "relative overflow-hidden border shadow-[0_18px_50px_-28px_rgba(80,40,10,0.45)]",
          size === "hero" ? "rounded-[1.6rem]" : "rounded-2xl bg-card"
        )}
      >
        {banners.map((banner, i) =>
          size === "hero" ? (
            <article
              key={banner.id}
              aria-hidden={i !== index}
              className={cn(
                "relative min-h-[22rem] sm:min-h-[28rem] lg:min-h-[34rem]",
                i === index ? "block" : "hidden"
              )}
            >
              {banner.image ? (
                <img
                  src={banner.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(145deg, ${banner.from}, ${banner.to})`,
                  }}
                />
              )}
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(90deg,rgb(20_10_4/.78)_0%,rgb(20_10_4/.45)_42%,rgb(20_10_4/.12)_100%)]"
              />
              <div className="relative z-10 flex min-h-[22rem] flex-col justify-between gap-8 p-5 sm:min-h-[28rem] sm:p-8 lg:min-h-[34rem] lg:p-10">
                <div className="max-w-xl">
                  <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.16em] text-white uppercase backdrop-blur-sm">
                    {banner.badge}
                  </p>
                  <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                    {banner.title}
                  </h2>
                  {banner.subtitle ? (
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/80 sm:text-base">
                      {banner.subtitle}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <Link
                    href={banner.href}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-10 rounded-full px-5"
                    )}
                  >
                    {banner.cta}
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                  {renderControls()}
                </div>
              </div>
            </article>
          ) : (
            <article
              key={banner.id}
              aria-hidden={i !== index}
              className={cn(
                "grid min-h-[9.5rem] grid-cols-[1fr_6.5rem] sm:min-h-[10.5rem] sm:grid-cols-[1.3fr_0.7fr]",
                i === index ? "grid" : "hidden"
              )}
            >
              <div className="flex flex-col justify-between gap-3 p-4 sm:p-5">
                <div>
                  <p className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.16em] text-primary uppercase">
                    {banner.badge}
                  </p>
                  <h2 className="mt-2 font-heading text-lg font-semibold tracking-tight text-balance sm:text-xl">
                    {banner.title}
                  </h2>
                  {banner.subtitle ? (
                    <p className="mt-1 line-clamp-1 max-w-lg text-sm text-muted-foreground">
                      {banner.subtitle}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={banner.href}
                    className={cn(buttonVariants({ size: "sm" }), "h-8 rounded-full px-3")}
                  >
                    {banner.cta}
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                  <div className="ml-auto">{renderControls()}</div>
                </div>
              </div>
              <div className="relative min-h-0 overflow-hidden">
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `linear-gradient(145deg, ${banner.from}, ${banner.to})`,
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(to_left,transparent,rgb(0_0_0/.08))]" />
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}
