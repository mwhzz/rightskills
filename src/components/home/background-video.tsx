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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
    }
  }, []);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
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
        preload="metadata"
        onCanPlay={() => setReady(true)}
        aria-label={label}
      >
        <source src={src} type="video/mp4" />
      </video>
      {wash === "light" ? (
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,250,245,0.92),rgba(255,250,245,0.78)_45%,rgba(255,250,245,0.9))]" />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(28,18,10,0.72),rgba(28,18,10,0.78)_50%,rgba(28,18,10,0.88))]" />
      )}
    </div>
  );
}
