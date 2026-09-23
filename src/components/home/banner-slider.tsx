"use client";

import { useEffect, useState, type TransitionEvent } from "react";
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
  const realCount = slides.length;
  const loop = realCount > 1;
  const track = loop ? [...slides, slides[0]] : slides;
  const [position, setPosition] = useState(0);
  const [motion, setMotion] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const active = realCount > 0 ? position % realCount : 0;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (motion) return;
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => setMotion(true));
    });
    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, [motion]);

  useEffect(() => {
    if (!loop || paused || reduceMotion || !motion || position >= realCount) return;
    const wait = (slides[position]?.durationSec ?? 5) * 1000;
    const timer = window.setTimeout(() => {
      setMotion(true);
      setPosition((current) => current + 1);
    }, wait);
    return () => window.clearTimeout(timer);
  }, [loop, motion, paused, position, realCount, reduceMotion, slides]);

  function onTrackEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
    if (position < realCount) return;
    setMotion(false);
    setPosition(0);
  }

  function show(dot: number) {
    if (dot === active && position < realCount) return;
    if (loop && active === realCount - 1 && dot === 0) {
      setMotion(true);
      setPosition(realCount);
      return;
    }
    setMotion(true);
    setPosition(dot);
  }

  if (realCount === 0) return null;

  const trackCount = track.length;
  const glide = motion && !reduceMotion;

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
            className="flex h-full will-change-transform"
            onTransitionEnd={onTrackEnd}
            style={{
              width: `${trackCount * 100}%`,
              transform: `translate3d(-${(position * 100) / trackCount}%, 0, 0)`,
              transition: glide
                ? "transform 1150ms cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
            }}
          >
            {track.map((banner, i) => {
              const src = bannerImageSrc(banner.image);
              const current = i === position;
              const image = (
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  loading="eager"
                  decoding="async"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
              );
              return (
                <article
                  key={`${banner.id}-${i}`}
                  aria-hidden={!current}
                  className="relative h-full shrink-0"
                  style={{ width: `${100 / trackCount}%` }}
                >
                  {banner.href ? (
                    <Link
                      href={banner.href}
                      className="absolute inset-0 block"
                      tabIndex={current ? 0 : -1}
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

          {realCount > 1 ? (
            <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
              {slides.map((item, dot) => (
                <button
                  key={`${item.id}-dot-${dot}`}
                  type="button"
                  aria-label={`Show banner ${dot + 1}`}
                  aria-current={dot === active ? true : undefined}
                  onClick={() => show(dot)}
                  className={cn(
                    "size-1.5 rounded-full transition",
                    dot === active
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
