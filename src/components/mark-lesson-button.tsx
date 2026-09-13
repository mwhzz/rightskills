"use client";

import { useFormStatus } from "react-dom";
import { toggleLessonAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SubmitButton({
  done,
  completeLabel,
  notDoneLabel,
  savingLabel,
}: {
  done: boolean;
  completeLabel: string;
  notDoneLabel: string;
  savingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        buttonVariants({
          variant: done ? "outline" : "default",
          size: "lg",
        }),
        "h-11"
      )}
    >
      {pending ? savingLabel : done ? notDoneLabel : completeLabel}
    </button>
  );
}

export function MarkLessonButton({
  slug,
  lessonId,
  done,
  completeLabel,
  notDoneLabel,
  savingLabel,
}: {
  slug: string;
  lessonId: string;
  done: boolean;
  completeLabel: string;
  notDoneLabel: string;
  savingLabel: string;
}) {
  return (
    <form action={toggleLessonAction}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <SubmitButton
        done={done}
        completeLabel={completeLabel}
        notDoneLabel={notDoneLabel}
        savingLabel={savingLabel}
      />
    </form>
  );
}
