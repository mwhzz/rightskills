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
  const [reduceMotion, setReduceMotion] = useState(false);
  const slide = slides[index] ?? slides[0];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused || reduceMotion || !slide) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, slide.durationSec * 1000);
    return () => window.clearTimeout(timer);
  }, [paused, reduceMotion, slide, slides.length]);

  if (!slide) return null;

  const count = slides.length;

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
        <div className={cn("relative w-full overflow-hidden", bannerFrameClass[variant])}>
          <div
            className="flex h-full"
            style={{
              width: `${count * 100}%`,
              transform: `translate3d(-${(index * 100) / count}%, 0, 0)`,
              transition: reduceMotion
                ? "none"
                : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {slides.map((banner, i) => {
              const src = bannerImageSrc(banner.image);
              const active = i === index;
              const image = (
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  loading={i <= 1 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              );
              return (
                <article
                  key={`${banner.id}-${i}`}
                  aria-hidden={!active}
                  className="relative h-full shrink-0"
                  style={{ width: `${100 / count}%` }}
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
          </div>

          {count > 1 ? (
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
