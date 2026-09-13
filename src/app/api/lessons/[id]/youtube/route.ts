import { NextResponse } from "next/server";
import { authorizeLessonMedia } from "@/lib/lesson-media";
import { youtubeId } from "@/lib/video";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const access = await authorizeLessonMedia(id);
  if ("error" in access) {
    return new NextResponse(access.error, { status: access.status });
  }

  const videoId = youtubeId(access.lesson.videoUrl ?? "");
  if (!videoId) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json(
    { id: videoId },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
