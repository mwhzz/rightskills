import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { authorizeLessonMedia } from "@/lib/lesson-media";
import { absoluteUploadPath } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; resourceId: string }> }
) {
  const { id, resourceId } = await context.params;
  const access = await authorizeLessonMedia(id);
  if ("error" in access) {
    return new NextResponse(access.error, { status: access.status });
  }

  const resource = access.lesson.resources.find((item) => item.id === resourceId);
  if (!resource) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = absoluteUploadPath(resource.filePath);
  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat) {
    return new NextResponse("Missing file", { status: 404 });
  }

  const encoded = encodeURIComponent(resource.name).replace(/['()]/g, escape);
  const stream = createReadStream(filePath);
  return new NextResponse(Readable.toWeb(stream) as unknown as ReadableStream, {
    headers: {
      "Content-Type": resource.mimeType,
      "Content-Length": String(fileStat.size),
      "Content-Disposition": `attachment; filename*=UTF-8''${encoded}`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
