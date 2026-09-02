import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatWhen } from "@/lib/format";

export default async function AdminStudentsPage() {
  const user = await requireRole("admin", "teacher");
  const enrollments = await prisma.enrollment.findMany({
    where:
      user.role === "teacher" ? { course: { teacherId: user.id } } : undefined,
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Students
      </h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        {user.role === "teacher"
          ? "People enrolled in your courses after a paid order."
          : "Every enrollment on the platform."}
      </p>
      <p className="mt-6 text-sm text-muted-foreground">
        {enrollments.length} enrollment{enrollments.length === 1 ? "" : "s"}
      </p>

      {enrollments.length === 0 ? (
        <p className="mt-6 rounded-2xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          No students yet. They show up here when an order is marked paid.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium">{row.user.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {row.user.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/courses/${row.course.id}`}
                      className="hover:text-primary"
                    >
                      {row.course.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    {formatWhen(row.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
