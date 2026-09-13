import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function logStaff(action: string, detail: string, target = "") {
  try {
    const session = await getSession();
    if (!session) return;
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action,
        target: target.slice(0, 120),
        detail: detail.slice(0, 2000),
      },
    });
  } catch {
    /* logging must never block the actual work */
  }
}
