import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminHomePage() {
  const user = await requireRole("admin", "teacher");
  const isAdmin = user.role === "admin";

  const [pending, paidToday, courseCount, studentCount] = await Promise.all([
    isAdmin
      ? prisma.order.count({ where: { status: "awaiting_review" } })
      : Promise.resolve(0),
    isAdmin
      ? prisma.order.count({ where: { status: "paid" } })
      : Promise.resolve(0),
    prisma.course.count({
      where: user.role === "teacher" ? { teacherId: user.id } : undefined,
    }),
    isAdmin ? prisma.user.count({ where: { role: "student" } }) : Promise.resolve(0),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isAdmin
          ? "Approve payments and manage the catalogue."
          : "Manage your courses, modules, and lesson videos."}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin ? (
          <>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">TrxID to review</p>
              <p className="mt-1 text-2xl font-semibold">{pending}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Paid orders</p>
              <p className="mt-1 text-2xl font-semibold">{paidToday}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Students</p>
              <p className="mt-1 text-2xl font-semibold">{studentCount}</p>
            </div>
          </>
        ) : null}
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Courses</p>
          <p className="mt-1 text-2xl font-semibold">{courseCount}</p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Link href="/admin/courses" className={cn(buttonVariants())}>
          Course manager
        </Link>
        {isAdmin ? (
          <Link href="/admin/orders" className={cn(buttonVariants({ variant: "outline" }))}>
            Review orders
          </Link>
        ) : null}
      </div>
    </div>
  );
}
