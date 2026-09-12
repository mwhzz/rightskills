"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  bannerFrameClass,
  bannerImageSrc,
  type HomeBanner,
} from "@/lib/home-banners";

export function BannerSlider({
  banners,
  label,
  variant,
}: {
  banners: HomeBanner[];
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
          "relative mx-auto w-full max-w-7xl overflow-hidden bg-background shadow-[0_18px_50px_-28px_rgba(80,40,10,0.4)]",
          variant === "mobile"
            ? "rounded-[1.15rem]"
            : "rounded-[1.4rem]"
        )}
      >
        <div className={cn("relative w-full", bannerFrameClass[variant])}>
          {slides.map((banner, i) => {
            if (i !== index) return null;
            const src = bannerImageSrc(banner.image);
            const fit = variant === "mobile" ? "object-cover" : "object-contain";
            const image = src.startsWith("/") ? (
              <Image
                src={src}
                alt=""
                fill
                sizes="100vw"
                className={fit}
              />
            ) : (
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className={cn("absolute inset-0 h-full w-full", fit)}
              />
            );
            return (
              <article key={banner.id} className="absolute inset-0">
                {banner.href ? (
                  <Link href={banner.href} className="absolute inset-0 block">
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
                  key={item.id}
                  type="button"
                  aria-label={`Show banner ${dot + 1}`}
                  aria-current={dot === index}
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
