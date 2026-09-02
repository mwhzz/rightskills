import path from "node:path";
import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";
import {
  RESOURCE_MAX_BYTES,
  VIDEO_MAX_BYTES,
} from "@/lib/upload-limits";

export { RESOURCE_MAX_BYTES, VIDEO_MAX_BYTES } from "@/lib/upload-limits";

const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".m4v"];
const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

const RESOURCE_EXTS = [
  ".pdf",
  ".zip",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".txt",
  ".csv",
];

const RESOURCE_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".txt": "text/plain",
  ".csv": "text/csv",
};

export function uploadsRoot() {
  return process.env.UPLOADS_DIR?.trim() || path.join(process.cwd(), "uploads");
}

export function absoluteUploadPath(relative: string) {
  const normalized = relative.replace(/^[/\\]+/, "").replace(/\\/g, "/");
  if (normalized.includes("..")) {
    throw new Error("Invalid path");
  }
  return path.join(uploadsRoot(), normalized);
}

export function videoContentType(filePath: string) {
  if (filePath.endsWith(".webm")) return "video/webm";
  if (filePath.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

function extOf(name: string) {
  return path.extname(name).toLowerCase();
}

async function writeFile(full: string, file: File) {
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, Buffer.from(await file.arrayBuffer()));
}

export async function removeUpload(relative: string | null | undefined) {
  if (!relative) return;
  await fs.unlink(absoluteUploadPath(relative)).catch(() => undefined);
}

async function removeLessonVideoFiles(lessonId: string) {
  const dir = path.join(uploadsRoot(), "lessons");
  await Promise.all(
    VIDEO_EXTS.map((ext) =>
      fs.unlink(path.join(dir, `${lessonId}${ext}`)).catch(() => undefined)
    )
  );
}

export async function saveLessonVideo(lessonId: string, file: File) {
  const ext = extOf(file.name);
  const okType = VIDEO_TYPES.has(file.type) || VIDEO_EXTS.includes(ext);
  if (!okType) {
    throw new Error("Only MP4, WebM, or MOV videos are allowed.");
  }
  if (file.size > VIDEO_MAX_BYTES) {
    throw new Error("Video must be 200MB or smaller.");
  }
  const safeExt = VIDEO_EXTS.includes(ext) ? ext : ".mp4";
  await removeLessonVideoFiles(lessonId);
  const relative = path.posix.join("lessons", `${lessonId}${safeExt}`);
  await writeFile(path.join(uploadsRoot(), "lessons", `${lessonId}${safeExt}`), file);
  return {
    relative,
    name: file.name.slice(0, 180),
    bytes: file.size,
  };
}

export async function saveLessonResource(lessonId: string, file: File) {
  const ext = extOf(file.name);
  if (!RESOURCE_EXTS.includes(ext)) {
    throw new Error(
      "Resources must be PDF, ZIP, Office, image, TXT, or CSV files."
    );
  }
  if (file.size > RESOURCE_MAX_BYTES) {
    throw new Error("Each resource must be 50MB or smaller.");
  }
  const id = randomBytes(8).toString("hex");
  const relative = path.posix.join("resources", lessonId, `${id}${ext}`);
  await writeFile(absoluteUploadPath(relative), file);
  return {
    relative,
    name: file.name.slice(0, 180),
    mimeType: RESOURCE_TYPES[ext] ?? "application/octet-stream",
    bytes: file.size,
  };
}

export function isUploadFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0 && Boolean(value.name);
}
