import Link from "next/link";
import {
  addLessonAction,
  addModuleAction,
  deleteLessonResourceAction,
  removeLessonVideoAction,
  updateLessonAction,
} from "@/app/actions";
import { MediaFields } from "@/components/admin/media-fields";
import { buttonVariants } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Lesson, LessonResource, Module } from "@prisma/client";

type ModuleWithLessons = Module & {
  lessons: (Lesson & { resources: LessonResource[] })[];
};

export function CurriculumEditor({
  courseId,
  modules,
  error,
}: {
  courseId: string;
  modules: ModuleWithLessons[];
  error?: string;
}) {
  return (
    <section>
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        Modules & lessons
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload the lesson video and any files students should download — slides,
        briefs, worksheets.
      </p>
      {error ? (
        <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form action={addModuleAction} className="mt-5 flex max-w-lg gap-2">
        <input type="hidden" name="courseId" value={courseId} />
        <input
          name="title"
          required
          placeholder="New module title"
          className="h-11 flex-1 rounded-lg border bg-background px-3 text-sm"
        />
        <button
          type="submit"
          className={cn(buttonVariants({ variant: "outline" }), "h-11")}
        >
          Add module
        </button>
      </form>

      <div className="mt-6 space-y-6">
        {modules.length === 0 ? (
          <p className="rounded-2xl border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Add a module, then lessons with video and resources.
          </p>
        ) : null}
        {modules.map((module, moduleIndex) => (
          <div key={module.id} className="rounded-2xl border bg-card p-5">
            <p className="text-xs tracking-[0.16em] text-primary uppercase">
              Module {moduleIndex + 1}
            </p>
            <h3 className="mt-1 font-heading text-xl font-semibold">
              {module.title}
            </h3>
            <ul className="mt-4 space-y-4">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="rounded-2xl border bg-background p-4">
                  <form
                    action={updateLessonAction}
                    encType="multipart/form-data"
                    className="space-y-3"
                  >
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    <input type="hidden" name="courseId" value={courseId} />
                    <input
                      name="title"
                      defaultValue={lesson.title}
                      className="h-11 w-full rounded-lg border px-3 text-sm"
                    />
                    <textarea
                      name="body"
                      rows={3}
                      defaultValue={lesson.body}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="Lesson notes"
                    />
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        Minutes
                        <input
                          name="durationMin"
                          type="number"
                          min={0}
                          defaultValue={lesson.durationMin}
                          className="h-10 w-20 rounded-lg border px-2"
                        />
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="preview"
                          defaultChecked={lesson.preview}
                        />
                        Free preview
                      </label>
                    </div>
                    {lesson.videoPath ? (
                      <div className="overflow-hidden rounded-xl bg-zinc-950">
                        <video
                          className="aspect-video w-full"
                          controls
                          playsInline
                          preload="metadata"
                          src={`/api/lessons/${lesson.id}/video`}
                        />
                        <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-white/70">
                          <span>
                            {lesson.videoName || "Video uploaded"}
                            {lesson.videoBytes
                              ? ` · ${formatBytes(lesson.videoBytes)}`
                              : ""}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No video yet.</p>
                    )}
                    <MediaFields />
                    {lesson.resources.length > 0 ? (
                      <ul className="space-y-2">
                        {lesson.resources.map((resource) => (
                          <li
                            key={resource.id}
                            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                          >
                            <Link
                              href={`/api/lessons/${lesson.id}/resources/${resource.id}`}
                              className="min-w-0 truncate hover:text-primary"
                            >
                              {resource.name}
                              <span className="ml-2 text-muted-foreground">
                                {formatBytes(resource.sizeBytes)}
                              </span>
                            </Link>
                            <button
                              type="submit"
                              form={`delete-resource-${resource.id}`}
                              className="shrink-0 text-xs text-muted-foreground hover:text-destructive"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>
                      Save lesson
                    </button>
                  </form>
                  {lesson.videoPath ? (
                    <form action={removeLessonVideoAction} className="mt-2">
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <input type="hidden" name="courseId" value={courseId} />
                      <button
                        type="submit"
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Remove video
                      </button>
                    </form>
                  ) : null}
                  {lesson.resources.map((resource) => (
                    <form
                      key={resource.id}
                      id={`delete-resource-${resource.id}`}
                      action={deleteLessonResourceAction}
                    >
                      <input type="hidden" name="resourceId" value={resource.id} />
                      <input type="hidden" name="courseId" value={courseId} />
                    </form>
                  ))}
                </li>
              ))}
            </ul>
            <form
              action={addLessonAction}
              encType="multipart/form-data"
              className="mt-5 space-y-3 border-t pt-5"
            >
              <p className="text-sm font-medium">New lesson</p>
              <input type="hidden" name="moduleId" value={module.id} />
              <input type="hidden" name="courseId" value={courseId} />
              <input
                name="title"
                required
                placeholder="Lesson title"
                className="h-11 w-full rounded-lg border px-3 text-sm"
              />
              <textarea
                name="body"
                rows={3}
                placeholder="Notes students read under the video"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                name="durationMin"
                type="number"
                min={0}
                defaultValue={10}
                className="h-10 w-24 rounded-lg border px-2 text-sm"
              />
              <MediaFields />
              <button
                type="submit"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              >
                Add lesson
              </button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}
