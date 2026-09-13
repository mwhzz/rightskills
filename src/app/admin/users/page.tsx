import { requireAccess, parseAccess, STAFF_KEYS, STAFF_LABELS } from "@/lib/staff";
import { prisma } from "@/lib/db";
import {
  createTeacherAction,
  createStaffAction,
  setUserPinAction,
  updateStaffAccessAction,
} from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    error?: string;
    pin?: string;
    staff?: string;
    access?: string;
  }>;
}) {
  const actor = await requireAccess("users");
  const { created, error, pin, staff, access } = await searchParams;
  const users = await prisma.user.findMany({
    where: { role: { in: ["admin", "teacher"] } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="font-heading text-2xl font-semibold">Users & staff</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Teachers only edit their own courses. Staff can be limited to orders,
        courses, students, and so on. Full access can do everything. Every action
        is written to the activity log.
      </p>
      {created ? <p className="mt-4 text-sm text-primary">Teacher saved.</p> : null}
      {staff ? <p className="mt-4 text-sm text-primary">Staff saved.</p> : null}
      {access ? <p className="mt-4 text-sm text-primary">Access updated.</p> : null}
      {pin ? <p className="mt-4 text-sm text-primary">PIN updated.</p> : null}
      {error === "last" ? (
        <p className="mt-4 text-sm text-destructive">
          Keep at least one full-access admin.
        </p>
      ) : error ? (
        <p className="mt-4 text-sm text-destructive">
          Check name, phone, 4-digit PIN, and access.
        </p>
      ) : null}

      <form
        action={createStaffAction}
        className="mt-6 grid max-w-3xl gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
      >
        <p className="sm:col-span-2 font-medium">Add staff</p>
        <input
          name="name"
          placeholder="Staff name"
          required
          className="h-10 rounded-lg border px-2.5 text-sm"
        />
        <input
          name="phone"
          placeholder="01XXXXXXXXX"
          required
          className="h-10 rounded-lg border px-2.5 text-sm"
        />
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          placeholder="4-digit PIN"
          required
          minLength={4}
          maxLength={4}
          pattern="[0-9]{4}"
          className="h-10 rounded-lg border px-2.5 text-sm tracking-[0.4em]"
        />
        <fieldset className="sm:col-span-2 grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
          <legend className="px-1 text-sm font-medium">Access</legend>
          {STAFF_KEYS.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={`access_${key}`}
                defaultChecked={key === "orders"}
                disabled={key === "full" && !actor.isFull}
              />
              {STAFF_LABELS[key]}
            </label>
          ))}
        </fieldset>
        <button type="submit" className={cn(buttonVariants(), "sm:col-span-2")}>
          Save staff
        </button>
      </form>

      <form
        action={createTeacherAction}
        className="mt-4 grid max-w-3xl gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
      >
        <p className="sm:col-span-2 font-medium">Add teacher</p>
        <input name="name" placeholder="Teacher name" required className="h-10 rounded-lg border px-2.5 text-sm" />
        <input name="phone" placeholder="01XXXXXXXXX" required className="h-10 rounded-lg border px-2.5 text-sm" />
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          placeholder="4-digit PIN"
          required
          minLength={4}
          maxLength={4}
          pattern="[0-9]{4}"
          className="h-10 rounded-lg border px-2.5 text-sm tracking-[0.4em]"
        />
        <button type="submit" className={cn(buttonVariants({ variant: "outline" }), "sm:col-span-2")}>
          Save teacher
        </button>
      </form>

      <form
        action={setUserPinAction}
        className="mt-4 grid max-w-3xl gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
      >
        <p className="sm:col-span-2 text-sm font-medium">Reset a user PIN</p>
        <input name="phone" placeholder="01XXXXXXXXX" required className="h-10 rounded-lg border px-2.5 text-sm" />
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          placeholder="New 4-digit PIN"
          required
          minLength={4}
          maxLength={4}
          pattern="[0-9]{4}"
          className="h-10 rounded-lg border px-2.5 text-sm tracking-[0.4em]"
        />
        <button type="submit" className={cn(buttonVariants({ variant: "outline" }), "sm:col-span-2")}>
          Set PIN
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {users.map((row) => {
          const accessKeys = row.role === "admin" ? parseAccess(row.staffAccess) : null;
          return (
            <div key={row.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{row.phone}</p>
                  <p className="mt-1 text-xs uppercase text-muted-foreground">{row.role}</p>
                </div>
                {accessKeys ? (
                  <p className="text-sm text-muted-foreground">
                    {accessKeys.has("full")
                      ? "Full access"
                      : [...accessKeys].map((key) => STAFF_LABELS[key]).join(" · ")}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Own courses only</p>
                )}
              </div>
              {row.role === "admin" && accessKeys ? (
                <form action={updateStaffAccessAction} className="mt-4 grid gap-2 sm:grid-cols-2">
                  <input type="hidden" name="id" value={row.id} />
                  {STAFF_KEYS.map((key) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name={`access_${key}`}
                        defaultChecked={
                          key === "full"
                            ? accessKeys.has("full")
                            : accessKeys.has(key)
                        }
                        disabled={key === "full" && !actor.isFull}
                      />
                      {STAFF_LABELS[key]}
                    </label>
                  ))}
                  <button
                    type="submit"
                    className={cn(buttonVariants({ size: "sm" }), "sm:col-span-2 mt-2 w-fit")}
                  >
                    Save access
                  </button>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
