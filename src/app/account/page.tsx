import Link from "next/link";
import { BookOpen, CircleCheck, Clock, Play, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatBdt } from "@/lib/format";
import { getHomepageLearning } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My panel",
};

export default async function StudentPanelPage() {
  const user = await requireUser("/account");
  const [learning, recentOrders] = await Promise.all([
    getHomepageLearning(user.id),
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { course: { select: { title: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const firstName = user.name.trim().split(/\s+/)[0] || user.name;
  const progress = Object.values(learning.progressBySlug);
  const finished = progress.filter(
    (item) => item.total > 0 && item.done >= item.total
  ).length;
  const inProgress = Math.max(0, learning.ownedSlugs.length - finished);
  const continueItem = learning.continueItem;

  return (
    <div>
      <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
        Student panel
      </p>
      <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-4xl">
        Welcome back, {firstName}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
        Your courses, payments, and progress — in one place.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2.5 xl:grid-cols-4 xl:gap-3">
        <Stat label="Unlocked" value={String(learning.ownedSlugs.length)} />
        <Stat label="In progress" value={String(inProgress)} />
        <Stat label="Finished" value={String(finished)} />
        <Stat label="Open orders" value={String(learning.openOrderCount)} />
      </div>

      {continueItem ? (
        <Link
          href={continueItem.href}
          className="group mt-6 flex flex-col overflow-hidden rounded-2xl border bg-card sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-4 p-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Play className="size-5 fill-current" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-[0.14em] text-primary uppercase">
                Continue
              </p>
              <p className="mt-1 truncate font-heading text-lg font-semibold group-hover:text-primary">
                {continueItem.title}
              </p>
              <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${continueItem.pct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t px-5 py-4 sm:border-t-0 sm:border-l">
            <span className="text-sm font-medium">{continueItem.pct}% done</span>
            <span className={cn(buttonVariants(), "h-9 rounded-full px-4")}>
              Resume
            </span>
          </div>
        </Link>
      ) : (
        <div className="mt-6 rounded-2xl border bg-card px-5 py-8">
          <p className="font-heading text-xl font-semibold">No course unlocked yet</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Buy a course, send the payment, paste the TrxID. After an admin
            confirms it, it shows up in My learning.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/courses" className={cn(buttonVariants(), "h-9 rounded-full px-4")}>
              Browse courses
            </Link>
            <Link
              href="/account/orders"
              className={cn(buttonVariants({ variant: "outline" }), "h-9 rounded-full px-4")}
            >
              Orders
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold">Orders</h2>
            <Link href="/account/orders" className="text-sm font-medium text-primary hover:underline">
              All orders
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nothing placed yet. Checkout keeps your cart even before you log in.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{order.orderId}</p>
                    <p className="truncate text-muted-foreground">
                      {order.items.map((item) => item.course.title).join(", ")}
                    </p>
                  </div>
                  <span className="shrink-0 text-muted-foreground">
                    {formatBdt(order.totalBdt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold">Shortcuts</h2>
          </div>
          <div className="mt-4 grid gap-2">
            <Shortcut href="/learn" icon={BookOpen} label="My learning" hint="Watch unlocked courses" />
            <Shortcut href="/account/orders" icon={Wallet} label="Paste a TrxID" hint="Open payments" />
            <Shortcut href="/courses" icon={Clock} label="Browse catalogue" hint="Find the next path" />
            <Shortcut href="/learn" icon={CircleCheck} label="Finished courses" hint="Rewatch anytime" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>
    </div>
  );
}

function Shortcut({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string;
  icon: typeof BookOpen;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition hover:border-primary/40"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </Link>
  );
}

