"use client";

import { deleteCourseAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DeleteCourseButton({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  return (
    <form
      action={deleteCourseAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete "${courseTitle}"? This removes its modules, lessons, and reviews. This can't be undone.`
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={courseId} />
      <button
        type="submit"
        className={cn(buttonVariants({ variant: "destructive" }))}
      >
        Delete
      </button>
    </form>
  );
}
