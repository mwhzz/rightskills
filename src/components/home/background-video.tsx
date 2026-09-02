"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function BackgroundVideo({
  src,
  label,
  wash = "light",
  className,
}: {
  src: string;
  label: string;
  wash?: "light" | "dark";
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setActive(true);
      },
      { rootMargin: "120px" }
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    void video.play().catch(() => undefined);
  }, [active]);

  return (
    <div
      ref={hostRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {active ? (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full scale-105 object-cover transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0"
          )}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onCanPlay={() => setReady(true)}
          aria-label={label}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
      {wash === "light" ? (
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,250,245,0.92),rgba(255,250,245,0.78)_45%,rgba(255,250,245,0.9))]" />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(28,18,10,0.72),rgba(28,18,10,0.78)_50%,rgba(28,18,10,0.88))]" />
      )}
    </div>
  );
}
