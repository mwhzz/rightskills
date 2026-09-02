import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createTeacherAction, setUserPinAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string; pin?: string }>;
}) {
  await requireRole("admin");
  const { created, error, pin } = await searchParams;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a teacher account. They log in at /login with a 4-digit PIN.
      </p>
      {created ? (
        <p className="mt-4 text-sm text-primary">Teacher saved.</p>
      ) : null}
      {pin ? (
        <p className="mt-4 text-sm text-primary">PIN updated.</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-destructive">Check name, phone, and 4-digit PIN.</p>
      ) : null}
      <form action={createTeacherAction} className="mt-6 grid max-w-xl gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
        <input name="name" placeholder="Teacher name" required className="h-10 rounded-lg border px-2.5 text-sm" />
        <input name="phone" placeholder="01XXXXXXXXX" required className="h-10 rounded-lg border px-2.5 text-sm" />
        <input name="pin" type="password" inputMode="numeric" placeholder="4-digit PIN" required minLength={4} maxLength={4} pattern="[0-9]{4}" className="h-10 rounded-lg border px-2.5 text-sm tracking-[0.4em]" />
        <button type="submit" className={cn(buttonVariants(), "sm:col-span-2")}>
          Save teacher
        </button>
      </form>
      <form action={setUserPinAction} className="mt-4 grid max-w-xl gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
        <p className="sm:col-span-2 text-sm font-medium">Reset a user PIN</p>
        <input name="phone" placeholder="01XXXXXXXXX" required className="h-10 rounded-lg border px-2.5 text-sm" />
        <input name="pin" type="password" inputMode="numeric" placeholder="New 4-digit PIN" required minLength={4} maxLength={4} pattern="[0-9]{4}" className="h-10 rounded-lg border px-2.5 text-sm tracking-[0.4em]" />
        <button type="submit" className={cn(buttonVariants({ variant: "outline" }), "sm:col-span-2")}>
          Set PIN
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
