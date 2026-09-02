"use client";

import { useState } from "react";
import { FileUp, Film } from "lucide-react";
import { formatBytes } from "@/lib/format";
import { RESOURCE_MAX_BYTES, VIDEO_MAX_BYTES } from "@/lib/upload-limits";

export function MediaFields({
  videoRequired = false,
}: {
  videoRequired?: boolean;
}) {
  const [videoLabel, setVideoLabel] = useState("");
  const [resourceLabel, setResourceLabel] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed bg-background px-4 py-4">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Film className="size-4 text-primary" />
          Lesson video
        </span>
        <input
          type="file"
          name="video"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov,.m4v"
          required={videoRequired}
          className="text-xs file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setError("");
            if (!file) {
              setVideoLabel("");
              return;
            }
            if (file.size > VIDEO_MAX_BYTES) {
              setError("Video must be 200MB or smaller.");
              event.target.value = "";
              setVideoLabel("");
              return;
            }
            setVideoLabel(`${file.name} · ${formatBytes(file.size)}`);
          }}
        />
        <span className="text-xs text-muted-foreground">
          {videoLabel || "MP4, WebM, or MOV · up to 200MB"}
        </span>
      </label>
      <label className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed bg-background px-4 py-4">
        <span className="flex items-center gap-2 text-sm font-medium">
          <FileUp className="size-4 text-primary" />
          Resources
        </span>
        <input
          type="file"
          name="resources"
          multiple
          accept=".pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv"
          className="text-xs file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1"
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            setError("");
            if (files.some((file) => file.size > RESOURCE_MAX_BYTES)) {
              setError("Each resource must be 50MB or smaller.");
              event.target.value = "";
              setResourceLabel("");
              return;
            }
            setResourceLabel(
              files.length
                ? files.map((file) => file.name).join(", ")
                : ""
            );
          }}
        />
        <span className="text-xs text-muted-foreground">
          {resourceLabel || "PDF, ZIP, Office, images · 50MB each"}
        </span>
      </label>
      {error ? (
        <p className="text-sm text-destructive sm:col-span-2">{error}</p>
      ) : null}
    </div>
  );
}
