import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { absoluteUploadPath } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { module: { include: { course: true } } },
  });
  if (!lesson?.videoPath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const staff = session.role === "admin" || session.role === "teacher";
  if (!staff) {
    const enrolled = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.id,
          courseId: lesson.module.courseId,
        },
      },
    });
    if (!enrolled) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  } else if (session.role === "teacher" && lesson.module.course.teacherId !== session.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const filePath = absoluteUploadPath(lesson.videoPath);
  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat) {
    return new NextResponse("Missing file", { status: 404 });
  }

  const stream = createReadStream(filePath);
  const webStream = Readable.toWeb(stream) as unknown as ReadableStream;
  const type = lesson.videoPath.endsWith(".webm")
    ? "video/webm"
    : lesson.videoPath.endsWith(".mov")
      ? "video/quicktime"
      : "video/mp4";

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(fileStat.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
