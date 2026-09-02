"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StudioBrand } from "@/lib/studio-brands";

export function BrandShowcase({ brands }: { brands: StudioBrand[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const work = brands[index];

  useEffect(() => {
    if (brands.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % brands.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [brands.length, paused]);

  if (!work) return null;

  function go(next: number) {
    setIndex((next + brands.length) % brands.length);
  }

  return (
    <div
      className="relative overflow-hidden rounded-[1.5rem] border bg-card shadow-[0_20px_50px_-36px_rgba(80,40,10,0.4)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Studio brands"
    >
      {brands.map((item, i) => (
        <article
          key={item.slug}
          aria-hidden={i !== index}
          className={cn(
            "grid lg:grid-cols-[1.15fr_0.85fr]",
            i === index ? "grid" : "hidden"
          )}
        >
          <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[22rem]">
            {i === index ? (
              <img
                src={item.image}
                alt={`${item.name} brand photography`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,12,6,0.45),transparent_45%)]" />
            <p className="absolute bottom-4 left-5 font-heading text-sm tracking-[0.18em] text-white/80 uppercase">
              {String(i + 1).padStart(2, "0")} / {String(brands.length).padStart(2, "0")}
            </p>
          </div>
          <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
                {item.category} · {item.year}
              </p>
              <h3 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                {item.name}
              </h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {item.summary}
              </p>
              <div className="mt-5 flex items-center gap-3">
                {item.colors.map((color) => (
                  <span key={color.hex} className="flex items-center gap-1.5">
                    <span
                      className="size-4 rounded-full border border-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs text-muted-foreground">{color.name}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/brands/${item.slug}`}
                className={cn(buttonVariants({ size: "lg" }), "h-11")}
              >
                View case
                <ArrowRight data-icon="inline-end" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {brands.map((dot, n) => (
                    <button
                      key={dot.slug}
                      type="button"
                      aria-label={`Show ${dot.name}`}
                      aria-current={n === index}
                      onClick={() => setIndex(n)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        n === index
                          ? "w-7 bg-primary"
                          : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/50"
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  className="inline-flex size-9 items-center justify-center rounded-full border bg-background transition hover:border-primary hover:text-primary"
                  aria-label="Previous brand"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  className="inline-flex size-9 items-center justify-center rounded-full border bg-background transition hover:border-primary hover:text-primary"
                  aria-label="Next brand"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
