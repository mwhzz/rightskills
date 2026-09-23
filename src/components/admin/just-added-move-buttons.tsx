"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { moveJustAddedCourseAction } from "@/app/actions";
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
    <div className="flex shrink-0 overflow-hidden rounded-full bg-[#fff4eb] ring-1 ring-[#f0d8c4]">
      <form action={moveJustAddedCourseAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="up" />
        <MoveButton label="Move forward" disabled={isFirst}>
          <ChevronUp className="size-4" />
        </MoveButton>
      </form>
      <form action={moveJustAddedCourseAction} className="border-l border-[#f0d8c4]">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="down" />
        <MoveButton label="Move back" disabled={isLast}>
          <ChevronDown className="size-4" />
        </MoveButton>
      </form>
    </div>
  );
}

function MoveButton({
  label,
  disabled,
  children,
}: {
  label: string;
  disabled: boolean;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-label={label}
      className={cn(
        "flex size-10 items-center justify-center text-foreground/70 transition hover:bg-white hover:text-foreground",
        "disabled:pointer-events-none disabled:text-foreground/20"
      )}
    >
      {pending ? <span className="text-xs">…</span> : children}
    </button>
  );
}
