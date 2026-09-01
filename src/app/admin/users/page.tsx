import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createTeacherAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  await requireRole("admin");
  const { created, error } = await searchParams;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a teacher account. They log in at /login then open Admin.
      </p>
      {created ? (
        <p className="mt-4 text-sm text-primary">Teacher saved.</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-destructive">Check name, phone, and password.</p>
      ) : null}
      <form action={createTeacherAction} className="mt-6 grid max-w-xl gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
        <input name="name" placeholder="Teacher name" required className="h-10 rounded-lg border px-2.5 text-sm" />
        <input name="phone" placeholder="01XXXXXXXXX" required className="h-10 rounded-lg border px-2.5 text-sm" />
        <input name="password" type="password" placeholder="Password" required minLength={6} className="h-10 rounded-lg border px-2.5 text-sm" />
        <button type="submit" className={cn(buttonVariants(), "sm:col-span-2")}>
          Save teacher
        </button>
      </form>
      <div className="mt-8 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.phone}</td>
                <td className="px-3 py-2">{row.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
