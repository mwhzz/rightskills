import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { trackMetaEvent } from "@/lib/meta";

const BROWSER_EVENTS = new Set(["PageView", "ViewContent"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  const event = typeof record.event === "string" ? record.event : "";
  const eventId = typeof record.eventId === "string" ? record.eventId.slice(0, 80) : "";
  if (!BROWSER_EVENTS.has(event) || !eventId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const contentIds = Array.isArray(record.contentIds)
    ? record.contentIds.filter((item): item is string => typeof item === "string").slice(0, 20)
    : undefined;
  const session = await getSession().catch(() => null);
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.id },
        select: { email: true, phone: true, name: true },
      })
    : null;

  const result = await trackMetaEvent({
    eventName: event,
    eventId,
    url: typeof record.url === "string" ? record.url.slice(0, 500) : undefined,
    contentIds,
    contentName: typeof record.contentName === "string" ? record.contentName : undefined,
    value: typeof record.value === "number" && record.value >= 0 && record.value <= 1_000_000
      ? record.value
      : undefined,
    fbp: typeof record.fbp === "string" ? record.fbp.slice(0, 200) : undefined,
    fbc: typeof record.fbc === "string" ? record.fbc.slice(0, 200) : undefined,
    user: user ?? undefined,
  });

  return NextResponse.json(
    { ok: result.status === "sent", status: result.status },
    { status: result.status === "failed" ? 502 : 200 },
  );
}
