import path from "node:path";
import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import {
  IMAGE_MAX_BYTES,
  RESOURCE_MAX_BYTES,
  VIDEO_MAX_BYTES,
} from "@/lib/upload-limits";

export {
  IMAGE_MAX_BYTES,
  RESOURCE_MAX_BYTES,
  VIDEO_MAX_BYTES,
} from "@/lib/upload-limits";

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

/**
 * Uploads arrive at whatever size the admin's phone or camera produced
 * (sometimes several MB). Downscale to a sane max dimension and re-encode
 * so course covers, banners, offers, and photos don't tax every visitor's
 * connection. GIFs are left untouched to avoid breaking animation.
 */
async function processImageBuffer(
  buffer: Buffer,
  ext: string,
  maxDimension: number
): Promise<Buffer> {
  if (ext === ".gif") return buffer;

  const pipeline = sharp(buffer)
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    });

  switch (ext) {
    case ".png":
      return pipeline.png({ compressionLevel: 9 }).toBuffer();
    case ".webp":
      return pipeline.webp({ quality: 82 }).toBuffer();
    default:
      return pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  }
}

async function writeImageFile(
  full: string,
  file: File,
  ext: string,
  maxDimension: number
) {
  await fs.mkdir(path.dirname(full), { recursive: true });
  const original = Buffer.from(await file.arrayBuffer());
  const processed = await processImageBuffer(original, ext, maxDimension).catch(
    () => original
  );
  await fs.writeFile(full, processed);
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

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const IMAGE_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export function imageContentType(filePath: string) {
  return IMAGE_MIME[extOf(filePath)] ?? "image/jpeg";
}

export function assertImageFile(file: File) {
  const ext = extOf(file.name);
  const okType = IMAGE_TYPES.has(file.type) || IMAGE_EXTS.includes(ext);
  if (!okType) {
    throw new Error("Photo must be JPG, PNG, WEBP, or GIF.");
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error("Photo must be 5MB or smaller.");
  }
}

async function removeInstructorPhotoFiles(courseId: string) {
  const dir = path.join(uploadsRoot(), "instructors");
  await Promise.all(
    IMAGE_EXTS.map((ext) =>
      fs.unlink(path.join(dir, `${courseId}${ext}`)).catch(() => undefined)
    )
  );
}

export async function saveInstructorPhoto(courseId: string, file: File) {
  assertImageFile(file);
  const ext = extOf(file.name);
  const safeExt = IMAGE_EXTS.includes(ext)
    ? ext === ".jpeg"
      ? ".jpg"
      : ext
    : ".jpg";
  await removeInstructorPhotoFiles(courseId);
  const relative = path.posix.join("instructors", `${courseId}${safeExt}`);
  await writeImageFile(absoluteUploadPath(relative), file, safeExt, 800);
  return relative;
}

export async function saveBannerImage(id: string, file: File) {
  assertImageFile(file);
  const ext = extOf(file.name);
  const safeExt = IMAGE_EXTS.includes(ext)
    ? ext === ".jpeg"
      ? ".jpg"
      : ext
    : ".jpg";
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "banner";
  const dir = path.join(uploadsRoot(), "banners");
  await Promise.all(
    IMAGE_EXTS.map((item) =>
      fs.unlink(path.join(dir, `${safeId}${item}`)).catch(() => undefined)
    )
  );
  const relative = path.posix.join("banners", `${safeId}${safeExt}`);
  await writeImageFile(absoluteUploadPath(relative), file, safeExt, 1920);
  return relative;
}

export async function saveOfferImage(id: string, file: File) {
  assertImageFile(file);
  const ext = extOf(file.name);
  const safeExt = IMAGE_EXTS.includes(ext)
    ? ext === ".jpeg"
      ? ".jpg"
      : ext
    : ".jpg";
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "offer";
  const dir = path.join(uploadsRoot(), "offers");
  await Promise.all(
    IMAGE_EXTS.map((item) =>
      fs.unlink(path.join(dir, `${safeId}${item}`)).catch(() => undefined)
    )
  );
  const relative = path.posix.join("offers", `${safeId}${safeExt}`);
  await writeImageFile(absoluteUploadPath(relative), file, safeExt, 1200);
  return relative;
}

export async function removeInstructorPhoto(courseId: string) {
  await removeInstructorPhotoFiles(courseId);
}

async function removeCoverImageFiles(courseId: string) {
  const dir = path.join(uploadsRoot(), "covers");
  await Promise.all(
    IMAGE_EXTS.map((ext) =>
      fs.unlink(path.join(dir, `${courseId}${ext}`)).catch(() => undefined)
    )
  );
}

export async function saveCoverImage(courseId: string, file: File) {
  assertImageFile(file);
  const ext = extOf(file.name);
  const safeExt = IMAGE_EXTS.includes(ext)
    ? ext === ".jpeg"
      ? ".jpg"
      : ext
    : ".jpg";
  await removeCoverImageFiles(courseId);
  const relative = path.posix.join("covers", `${courseId}${safeExt}`);
  await writeImageFile(absoluteUploadPath(relative), file, safeExt, 1200);
  return relative;
}

export async function removeCoverImage(courseId: string) {
  await removeCoverImageFiles(courseId);
}
