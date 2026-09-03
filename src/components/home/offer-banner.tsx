"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HomeBanner } from "@/lib/home-banners";

export function OfferBanner({ banners }: { banners: HomeBanner[] }) {
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

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-[0_12px_36px_-28px_rgba(80,40,10,0.4)]">
        {banners.map((banner, i) => (
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
                {banners.length > 1 ? (
                  <div className="ml-auto flex items-center gap-2">
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
                              : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50"
                          )}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => go(index - 1)}
                      className="inline-flex size-7 items-center justify-center rounded-full border bg-background text-foreground transition hover:border-primary hover:text-primary"
                      aria-label="Previous offer"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(index + 1)}
                      className="inline-flex size-7 items-center justify-center rounded-full border bg-background text-foreground transition hover:border-primary hover:text-primary"
                      aria-label="Next offer"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                ) : null}
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
        ))}
      </div>
    </section>
  );
}
