import Image from "next/image";
import type { Course } from "@/lib/courses";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

const patterns: Record<Course["cover"]["pattern"], string> = {
  grid: "bg-[linear-gradient(to_right,rgb(255_255_255/.08)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/.08)_1px,transparent_1px)] bg-[size:22px_22px]",
  dots: "bg-[radial-gradient(rgb(255_255_255/.16)_1px,transparent_1px)] bg-[size:16px_16px]",
  waves:
    "bg-[radial-gradient(ellipse_at_top,rgb(255_255_255/.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgb(0_0_0/.25),transparent_50%)]",
};

export function CourseCover({
  course,
  className,
}: {
  course: Pick<Course, "title" | "cover">;
  className?: string;
}) {
  if (course.cover.image) {
    // Images we serve ourselves (the common case) get resized/re-encoded by
    // next/image. An admin-pasted external URL falls back to a plain <img> —
    // next/image would need that host allow-listed in next.config.ts first.
    const local = course.cover.image.startsWith("/");
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        {local ? (
          <Image
            src={course.cover.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover"
          />
        ) : (
          <img
            src={course.cover.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden text-white", className)}
      style={{
        backgroundImage: `linear-gradient(145deg, ${course.cover.from}, ${course.cover.to})`,
      }}
    >
      <div className={cn("absolute inset-0", patterns[course.cover.pattern])} />
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative flex h-full min-h-36 flex-col justify-between p-4">
        <p className="text-[11px] font-medium tracking-[0.18em] text-white/80 uppercase">
          {brand.name}
        </p>
        <div>
          <p className="font-heading text-lg leading-snug text-balance">
            {course.title}
          </p>
        </div>
      </div>
    </div>
  );
}
