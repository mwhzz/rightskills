"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeVideo({
  src,
  className,
  overlay,
  label,
  autoPlay = true,
}: {
  src: string;
  className?: string;
  overlay?: ReactNode;
  label: string;
  autoPlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(!autoPlay);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
    }
  }, []);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0"
        )}
        autoPlay={autoPlay}
        muted
        loop
        playsInline
        preload="none"
        onCanPlay={() => setReady(true)}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        aria-label={label}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),rgba(0,0,0,0.1)_45%,rgba(0,0,0,0.05))]" />
      {overlay}
      <button
        type="button"
        onClick={toggle}
        className="absolute top-3 right-3 z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50 sm:top-4 sm:right-4"
        aria-label={paused ? "Play video" : "Pause video"}
      >
        {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4" />}
      </button>
    </div>
  );
}
