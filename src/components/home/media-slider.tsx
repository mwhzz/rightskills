"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function MediaSlider({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  function move(direction: -1 | 1) {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({
      left: direction * Math.min(node.clientWidth * 0.8, 420),
      behavior: "smooth",
    });
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => move(-1)}
          className="inline-flex size-11 items-center justify-center rounded-full border bg-background text-foreground transition hover:border-primary hover:text-primary"
          aria-label="Previous"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          className="inline-flex size-11 items-center justify-center rounded-full border bg-background text-foreground transition hover:border-primary hover:text-primary"
          aria-label="Next"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
