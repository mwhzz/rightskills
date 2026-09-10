import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { absoluteUploadPath, imageContentType } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await context.params;
  const relative = parts.join("/");
  if (
    parts.length < 2 ||
    !["instructors", "banners", "covers", "offers"].includes(parts[0] ?? "") ||
    relative.includes("..")
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = absoluteUploadPath(relative);
  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat) {
    return new NextResponse("Missing file", { status: 404 });
  }

  const stream = createReadStream(filePath);
  return new NextResponse(Readable.toWeb(stream) as unknown as ReadableStream, {
    headers: {
      "Content-Type": imageContentType(relative),
      "Content-Length": String(fileStat.size),
      "Cache-Control": "public, max-age=86400",
    },
  });
}
