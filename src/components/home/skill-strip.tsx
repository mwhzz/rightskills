import Link from "next/link";
import { categories } from "@/lib/courses";

export function SkillStrip() {
  const items = [...categories, ...categories];

  return (
    <section
      aria-label="Course topics"
      className="border-y border-border/80 bg-card/70"
    >
      <div className="relative overflow-hidden py-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-[linear-gradient(to_right,var(--card),transparent)] sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-[linear-gradient(to_left,var(--card),transparent)] sm:w-24" />
        <div className="flex w-max animate-rs-marquee gap-3 pr-3 hover:[animation-play-state:paused]">
          {items.map((category, index) => (
            <Link
              key={`${category.id}-${index}`}
              href={`/courses?category=${category.id}`}
              className="shrink-0 rounded-full border border-border bg-background px-5 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
