import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRow({
  rating,
  className,
  starClassName = "size-4",
}: {
  rating: number;
  className?: string;
  starClassName?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <div className={cn("flex gap-0.5", className)} aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            starClassName,
            index < rounded
              ? "fill-primary text-primary"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}
