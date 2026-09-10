"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Swipe on a phone, hover-arrows on a desktop. The arrows stay invisible
 * until the row is hovered or focused, and never show on the side that has
 * nothing left to scroll to.
 */
export function OfferSlider({ children }: { children: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const sync = useCallback(() => {
    const node = scroller.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setCanLeft(node.scrollLeft > 8);
    setCanRight(node.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    sync();
    const node = scroller.current;
    if (!node) return;
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, [sync]);

  function move(direction: -1 | 1) {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({
      left: direction * Math.min(node.clientWidth * 0.8, 420),
      behavior: "smooth",
    });
  }

  return (
    <div className="group relative">
      <div
        ref={scroller}
        onScroll={sync}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <Arrow side="left" show={canLeft} onClick={() => move(-1)} />
      <Arrow side="right" show={canRight} onClick={() => move(1)} />
    </div>
  );
}

function Arrow({
  side,
  show,
  onClick,
}: {
  side: "left" | "right";
  show: boolean;
  onClick: () => void;
}) {
  if (!show) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous offers" : "Next offers"}
      className={cn(
        // Pointer devices only — a phone gets plain swiping instead.
        "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full",
        "border border-border/60 bg-background/80 text-foreground shadow-lg backdrop-blur-md",
        "opacity-0 transition duration-200 hover:bg-background focus-visible:opacity-100",
        "group-hover:opacity-100 md:inline-flex",
        side === "left" ? "left-1" : "right-1"
      )}
    >
      {side === "left" ? (
        <ChevronLeft className="size-5" />
      ) : (
        <ChevronRight className="size-5" />
      )}
    </button>
  );
}
