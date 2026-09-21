"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  bannerFrameClass,
  bannerImageSrc,
  type BannerSlide,
} from "@/lib/home-banners";

export function BannerSlider({
  banners,
  label,
  variant,
}: {
  banners: BannerSlide[];
  label: string;
  variant: "desktop" | "mobile";
}) {
  const slides = banners.filter((item) => item.image);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[index] ?? slides[0];

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused || !slide) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, slide.durationSec * 1000);
    return () => window.clearTimeout(timer);
  }, [paused, slide, slides.length]);

  if (!slide) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={cn(
          "relative mx-auto w-full max-w-7xl overflow-hidden bg-muted shadow-[0_18px_50px_-28px_rgba(80,40,10,0.4)]",
          variant === "mobile" ? "rounded-[1.15rem]" : "rounded-[1.4rem]"
        )}
      >
        <div className={cn("relative w-full", bannerFrameClass[variant])}>
          {slides.map((banner, i) => {
            const src = bannerImageSrc(banner.image);
            const active = i === index;
            const image = (
              <img
                src={src}
                alt=""
                draggable={false}
                fetchPriority={i === 0 ? "high" : "low"}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            );
            return (
              <article
                key={`${banner.id}-${i}`}
                aria-hidden={!active}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:duration-0",
                  active
                    ? "z-[1] opacity-100"
                    : "z-0 opacity-0 pointer-events-none"
                )}
              >
                {banner.href ? (
                  <Link
                    href={banner.href}
                    className="absolute inset-0 block"
                    tabIndex={active ? 0 : -1}
                  >
                    {image}
                    <span className="sr-only">Open banner</span>
                  </Link>
                ) : (
                  image
                )}
              </article>
            );
          })}

          {slides.length > 1 ? (
            <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
              {slides.map((item, dot) => (
                <button
                  key={`${item.id}-dot-${dot}`}
                  type="button"
                  aria-label={`Show banner ${dot + 1}`}
                  aria-current={dot === index ? true : undefined}
                  onClick={() => setIndex(dot)}
                  className={cn(
                    "size-1.5 rounded-full transition",
                    dot === index
                      ? "bg-primary"
                      : "bg-foreground/25 hover:bg-foreground/50"
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
