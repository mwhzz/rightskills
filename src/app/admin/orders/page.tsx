import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBdt, formatWhen } from "@/lib/format";
import { approveOrderAction, rejectOrderAction } from "@/app/actions";
import { OrderStatusBadge } from "@/components/order-status";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

const statuses: { id: "all" | OrderStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "awaiting_review", label: "Needs review" },
  { id: "pending", label: "Waiting for TrxID" },
  { id: "paid", label: "Paid" },
  { id: "rejected", label: "Rejected" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole("admin");
  const { status: statusParam, q: qParam } = await searchParams;
  const status =
    statuses.some((item) => item.id === statusParam) && statusParam !== "all"
      ? (statusParam as OrderStatus)
      : undefined;
  const q = (qParam ?? "").trim();

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderId: { contains: q } },
            { trxId: { contains: q } },
            { user: { name: { contains: q } } },
            { user: { phone: { contains: q } } },
          ],
        }
      : {}),
  };

  const [orders, pending, awaiting, paid, rejected, revenue] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: true,
        items: { include: { course: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 150,
    }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: "awaiting_review" } }),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.order.count({ where: { status: "rejected" } }),
    prisma.order.aggregate({
      where: { status: "paid" },
      _sum: { totalBdt: true },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Orders</h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Match the TrxID in bKash or Nagad, then mark paid to unlock the
        courses. Reject if the reference does not match.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Needs review" value={awaiting} />
        <Stat label="Waiting for TrxID" value={pending} />
        <Stat label="Paid orders" value={paid} />
        <Stat
          label="Paid volume"
          value={formatBdt(revenue._sum.totalBdt ?? 0)}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{rejected} rejected</p>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/admin/orders">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search order ID, phone, name, TrxID"
          className="h-11 flex-1 rounded-lg border bg-background px-3 text-sm"
        />
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <button type="submit" className={cn(buttonVariants({ variant: "outline" }), "h-11")}>
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {statuses.map((item) => {
          const href =
            item.id === "all"
              ? q
                ? `/admin/orders?q=${encodeURIComponent(q)}`
                : "/admin/orders"
              : `/admin/orders?status=${item.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
          const active = (status ?? "all") === item.id;
          return (
            <Link
              key={item.id}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:border-primary/40"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 rounded-2xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          No orders in this view.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-lg font-semibold">{order.orderId}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatWhen(order.createdAt)}
                    {order.updatedAt.getTime() !== order.createdAt.getTime()
                      ? ` · updated ${formatWhen(order.updatedAt)}`
                      : ""}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                    Student
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{order.user.name}</dd>
                  <dd className="font-mono text-xs text-muted-foreground">
                    {order.user.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                    Payment
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{formatBdt(order.totalBdt)}</dd>
                  <dd className="text-xs uppercase text-muted-foreground">{order.method}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                    TrxID
                  </dt>
                  <dd className="mt-1 font-mono text-sm">
                    {order.trxId || "Not submitted yet"}
                  </dd>
                </div>
              </dl>

              <ul className="mt-4 divide-y rounded-xl border">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                  >
                    <span className="min-w-0 truncate">{item.course.title}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatBdt(item.priceBdt)}
                    </span>
                  </li>
                ))}
              </ul>

              {order.status !== "paid" && order.status !== "rejected" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={approveOrderAction}>
                    <input type="hidden" name="id" value={order.id} />
                    <button
                      type="submit"
                      disabled={!order.trxId}
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      Mark paid
                    </button>
                  </form>
                  <form action={rejectOrderAction}>
                    <input type="hidden" name="id" value={order.id} />
                    <button
                      type="submit"
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    >
                      Reject
                    </button>
                  </form>
                  {!order.trxId ? (
                    <p className="self-center text-xs text-muted-foreground">
                      Wait for the student to paste a TrxID before marking paid.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
