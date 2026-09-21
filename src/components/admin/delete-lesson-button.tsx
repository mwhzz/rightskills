"use client";

import { deleteLessonAction } from "@/app/actions";

export function DeleteLessonButton({
  courseId,
  lessonId,
  lessonTitle,
}: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
}) {
  return (
    <form
      action={deleteLessonAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete lesson "${lessonTitle}"? Video and files go with it. This can't be undone.`
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <button
        type="submit"
        className="text-xs text-muted-foreground hover:text-destructive"
      >
        Delete lesson
      </button>
    </form>
  );
}
