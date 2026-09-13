import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatWhen } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; deleted?: string }>;
}) {
  const user = await requireRole("admin", "teacher");
  const { q: qParam, deleted } = await searchParams;
  const q = (qParam ?? "").trim();
  const isAdmin = user.role === "admin";

  const students = await prisma.user.findMany({
    where: {
      role: "student",
      ...(user.role === "teacher"
        ? { enrollments: { some: { course: { teacherId: user.id } } } }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { phone: { contains: q } },
              { whatsapp: { contains: q } },
              { email: { contains: q } },
              { district: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { enrollments: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Students
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            {isAdmin
              ? "Create profiles for WhatsApp orders, unlock a course after payment, or delete an account."
              : "People enrolled in your courses."}
          </p>
        </div>
        {isAdmin ? (
          <Link href="/admin/students/new" className={cn(buttonVariants(), "h-10")}>
            Add student
          </Link>
        ) : null}
      </div>

      {deleted ? (
        <p className="mt-4 rounded-2xl border bg-primary/5 px-4 py-3 text-sm">
          Student deleted.
        </p>
      ) : null}

      <form className="mt-6 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, phone, WhatsApp…"
          className="h-10 min-w-60 flex-1 rounded-lg border px-3 text-sm"
        />
        <button type="submit" className={cn(buttonVariants({ variant: "outline" }), "h-10")}>
          Search
        </button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        {students.length} student{students.length === 1 ? "" : "s"}
      </p>

      {students.length === 0 ? (
        <p className="mt-6 rounded-2xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          {q
            ? "No students match that search."
            : isAdmin
              ? "No students yet. Add one from a WhatsApp order."
              : "No students in your courses yet."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Profession</th>
                <th className="px-4 py-3 font-medium">Courses</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                {isAdmin ? <th className="px-4 py-3 font-medium" /> : null}
              </tr>
            </thead>
            <tbody>
              {students.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium">{row.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{row.phone}</p>
                    {row.district ? (
                      <p className="text-xs text-muted-foreground">{row.district}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-xs">
                    {row.whatsapp || "—"}
                  </td>
                  <td className="px-4 py-3 align-top">{row.profession || "—"}</td>
                  <td className="px-4 py-3 align-top">{row._count.enrollments}</td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    {formatWhen(row.createdAt)}
                  </td>
                  {isAdmin ? (
                    <td className="px-4 py-3 align-top text-right">
                      <Link
                        href={`/admin/students/${row.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
