"use client";

import { useState } from "react";
import { ChevronDown, Clock, Lock, PlayCircle } from "lucide-react";
import type { Module } from "@/lib/courses";
import { cn } from "@/lib/utils";

export function CourseCurriculum({ modules }: { modules: Module[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(modules[0] ? [modules[0].id] : [])
  );

  const allOpen = modules.length > 0 && modules.every((module) => openIds.has(module.id));
  const lessonTotal = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const minutes = modules
    .flatMap((module) => module.lessons)
    .reduce((sum, lesson) => sum + lesson.durationMin, 0);

  function toggleAll() {
    if (allOpen) setOpenIds(new Set());
    else setOpenIds(new Set(modules.map((module) => module.id)));
  }

  function toggle(id: string) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section id="curriculum" className="scroll-mt-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Course content
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            {modules.length} sections · {lessonTotal} lectures · {minutes} min
            total
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="text-base font-medium text-primary hover:underline"
        >
          {allOpen ? "Collapse all sections" : "Expand all sections"}
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        {modules.map((module) => {
          const open = openIds.has(module.id);
          const moduleMinutes = module.lessons.reduce(
            (sum, lesson) => sum + lesson.durationMin,
            0
          );
          return (
            <div key={module.id} className="border-b last:border-b-0">
              <button
                type="button"
                onClick={() => toggle(module.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-muted/50"
                aria-expanded={open}
              >
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-muted-foreground transition",
                    open && "rotate-180"
                  )}
                />
                <span className="flex-1 font-heading text-lg font-semibold">
                  {module.title}
                </span>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {module.lessons.length} lectures · {moduleMinutes} min
                </span>
              </button>
              {open ? (
                <ul className="border-t bg-background/60">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center gap-3 border-b px-5 py-3.5 last:border-b-0"
                    >
                      {lesson.preview ? (
                        <PlayCircle className="size-5 shrink-0 text-primary" />
                      ) : (
                        <Lock className="size-5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 flex-1 text-base">
                        {lesson.title}
                        {lesson.preview ? (
                          <a
                            href="#preview"
                            className="ml-2 font-medium text-primary hover:underline"
                          >
                            Preview
                          </a>
                        ) : null}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="size-3.5" />
                        {lesson.durationMin} min
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
