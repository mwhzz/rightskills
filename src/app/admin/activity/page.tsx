import { getStaffSession } from "@/lib/staff";
import { prisma } from "@/lib/db";
import { formatDateDhaka, formatTimeDhaka } from "@/lib/format";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const staff = await getStaffSession();
  if (staff.isTeacher) redirect("/admin");
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Activity log
      </h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Who marked an order paid, who edited a course, who changed staff access.
        Bangladesh time.
      </p>
      {logs.length === 0 ? (
        <p className="mt-8 rounded-2xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          No staff actions logged yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 align-top">
                    <p>{formatDateDhaka(row.createdAt)}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatTimeDhaka(row.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium">{row.user.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {row.user.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-xs">
                    {row.action}
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    {row.detail}
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
