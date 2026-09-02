import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function authorizeLessonMedia(lessonId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized", status: 401 as const };

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } }, resources: true },
  });
  if (!lesson) return { error: "Not found", status: 404 as const };

  const staff = session.role === "admin" || session.role === "teacher";
  if (staff) {
    if (
      session.role === "teacher" &&
      lesson.module.course.teacherId !== session.id
    ) {
      return { error: "Forbidden", status: 403 as const };
    }
    return { lesson, session };
  }

  const enrolled = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.id,
        courseId: lesson.module.courseId,
      },
    },
  });
  if (!enrolled) return { error: "Forbidden", status: 403 as const };
  return { lesson, session };
}
