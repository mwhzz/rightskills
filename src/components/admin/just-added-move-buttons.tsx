"use client";

import { useFormStatus } from "react-dom";
import { moveJustAddedCourseAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function JustAddedMoveButtons({
  id,
  title,
  isFirst,
  isLast,
}: {
  id: string;
  title: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-1">
      <form action={moveJustAddedCourseAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="up" />
        <MoveButton label="Forward" ariaLabel={`Move ${title} forward`} disabled={isFirst} />
      </form>
      <form action={moveJustAddedCourseAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="down" />
        <MoveButton label="Back" ariaLabel={`Move ${title} back`} disabled={isLast} />
      </form>
    </div>
  );
}

function MoveButton({
  label,
  ariaLabel,
  disabled,
}: {
  label: string;
  ariaLabel: string;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      aria-label={ariaLabel}
    >
      {pending ? "…" : label}
    </button>
  );
}
