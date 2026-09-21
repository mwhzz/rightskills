"use client";

import { useFormStatus } from "react-dom";
import { moveCourseAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MoveCourseButtons({
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
    <div className="mr-1 flex flex-col gap-1">
      <form action={moveCourseAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="up" />
        <MoveButton
          label="Up"
          ariaLabel={`Move ${title} up`}
          disabled={isFirst}
        />
      </form>
      <form action={moveCourseAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="down" />
        <MoveButton
          label="Down"
          ariaLabel={`Move ${title} down`}
          disabled={isLast}
        />
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
