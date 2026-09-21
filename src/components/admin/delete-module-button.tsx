"use client";

import { deleteModuleAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DeleteModuleButton({
  courseId,
  moduleId,
  moduleTitle,
}: {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
}) {
  return (
    <form
      action={deleteModuleAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete module "${moduleTitle}" and all of its lessons? This can't be undone.`
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="moduleId" value={moduleId} />
      <button
        type="submit"
        className={cn(buttonVariants({ variant: "destructive", size: "sm" }), "h-11")}
      >
        Delete
      </button>
    </form>
  );
}
