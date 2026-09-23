import { readFile, stat } from "node:fs/promises";
import { NextResponse } from "next/server";
import { absoluteUploadPath, imageContentType } from "@/lib/uploads";

export const runtime = "nodejs";

const FOLDERS = new Set(["instructors", "banners", "covers", "offers"]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await context.params;
  const relative = parts.join("/");
  if (
    parts.length < 2 ||
    !FOLDERS.has(parts[0] ?? "") ||
    relative.includes("..")
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = absoluteUploadPath(relative);
  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat?.isFile()) {
    return new NextResponse("Missing file", { status: 404 });
  }

  // Read the whole file before responding. A live stream plus Content-Length
  // was sometimes cut off, so the browser kept a blank image until reload.
  const body = await readFile(filePath).catch(() => null);
  if (!body || body.length === 0) {
    return new NextResponse("Missing file", { status: 404 });
  }

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": imageContentType(relative),
      "Content-Length": String(body.length),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
