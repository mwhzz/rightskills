import path from "node:path";
import fs from "node:fs/promises";

const MAX_BYTES = 200 * 1024 * 1024;
const ALLOWED = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export function uploadsRoot() {
  return process.env.UPLOADS_DIR?.trim() || path.join(process.cwd(), "uploads");
}

export function lessonUploadsDir() {
  return path.join(uploadsRoot(), "lessons");
}

export async function saveLessonVideo(lessonId: string, file: File) {
  if (!ALLOWED.has(file.type) && !/\.(mp4|webm|mov)$/i.test(file.name)) {
    throw new Error("Only MP4, WebM, or MOV videos are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Video must be 200MB or smaller.");
  }

  const ext = path.extname(file.name).toLowerCase() || ".mp4";
  const safeExt = [".mp4", ".webm", ".mov"].includes(ext) ? ext : ".mp4";
  const relative = path.posix.join("lessons", `${lessonId}${safeExt}`);
  const dir = lessonUploadsDir();
  await fs.mkdir(dir, { recursive: true });
  const full = path.join(dir, `${lessonId}${safeExt}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(full, buffer);
  return relative.replace(/\\/g, "/");
}

export function absoluteUploadPath(relative: string) {
  const normalized = relative.replace(/^[/\\]+/, "").replace(/\\/g, "/");
  if (normalized.includes("..")) {
    throw new Error("Invalid path");
  }
  return path.join(uploadsRoot(), normalized);
}
