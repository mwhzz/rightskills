import Link from "next/link";
import { requireAccess } from "@/lib/staff";
import { prisma } from "@/lib/db";
import { dhakaDayEnd, dhakaDayStart, formatBdt, formatWhen, shiftDhakaYmd, ymdInDhaka } from "@/lib/format";
import { approveOrderAction, rejectOrderAction } from "@/app/actions";
import { OrderStatusBadge } from "@/components/order-status";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

const statuses: { id: "all" | "needs_review" | OrderStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needs_review", label: "Needs review" },
  { id: "paid", label: "Paid" },
  { id: "rejected", label: "Rejected" },
];

function isYmd(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function ordersHref(params: {
  status?: string;
  q?: string;
  from?: string;
  to?: string;
}) {
  const search = new URLSearchParams();
  if (params.status && params.status !== "all") search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  const query = search.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string }>;
}) {
  await requireAccess("orders");
  const { status: statusParam, q: qParam, from: fromParam, to: toParam } =
    await searchParams;
  const needsReview =
    statusParam === "needs_review" || statusParam === "awaiting_review";
  const status =
    !needsReview &&
    statuses.some((item) => item.id === statusParam) &&
    statusParam !== "all"
      ? (statusParam as OrderStatus)
      : undefined;
  const q = (qParam ?? "").trim();
  const from = fromParam && isYmd(fromParam) ? fromParam : "";
  const to = toParam && isYmd(toParam) ? toParam : "";
  const currentStatus = needsReview ? "needs_review" : (status ?? "all");

  const where = {
    ...(needsReview
      ? { status: { in: ["pending", "awaiting_review"] as OrderStatus[] } }
      : status
        ? { status }
        : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: dhakaDayStart(from) } : {}),
            ...(to ? { lte: dhakaDayEnd(to) } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { orderId: { contains: q } },
            { trxId: { contains: q } },
            { payerNumber: { contains: q } },
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

  const today = ymdInDhaka();
  const yesterday = shiftDhakaYmd(today, -1);
  const last7 = shiftDhakaYmd(today, -6);
  const dateActive = Boolean(from || to);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Orders</h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Check the paid-from number against your bKash or Nagad app, then mark
        paid to unlock the course. Reject if nothing matches.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Needs review" value={pending + awaiting} />
        <Stat label="Paid orders" value={paid} />
        <Stat
          label="Paid volume"
          value={formatBdt(revenue._sum.totalBdt ?? 0)}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{rejected} rejected</p>

      <form
        className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center"
        action="/admin/orders"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, number, order ID, TrxID"
          className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            name="from"
            defaultValue={from}
            aria-label="From date"
            className="h-11 w-[10.5rem] rounded-lg border bg-background px-3 text-sm"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            aria-label="To date"
            className="h-11 w-[10.5rem] rounded-lg border bg-background px-3 text-sm"
          />
          {status ? <input type="hidden" name="status" value={status} /> : null}
          {needsReview ? <input type="hidden" name="status" value="needs_review" /> : null}
          <button type="submit" className={cn(buttonVariants(), "h-11")}>
            Search
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {statuses.map((item) => {
          const href = ordersHref({
            status: item.id,
            q,
            from,
            to,
          });
          const active = currentStatus === item.id;
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
        <span className="mx-1 hidden h-4 w-px bg-border sm:inline-block" />
        {[
          { label: "Today", from: today, to: today },
          { label: "Yesterday", from: yesterday, to: yesterday },
          { label: "Last 7 days", from: last7, to: today },
        ].map((preset) => {
          const active = from === preset.from && to === preset.to;
          return (
            <Link
              key={preset.label}
              href={ordersHref({
                status: currentStatus,
                q,
                from: preset.from,
                to: preset.to,
              })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:border-primary/40"
              )}
            >
              {preset.label}
            </Link>
          );
        })}
        {dateActive ? (
          <Link
            href={ordersHref({ status: currentStatus, q })}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear dates
          </Link>
        ) : null}
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
                <div>
                  <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                    Paid from
                  </dt>
                  <dd className="mt-1 font-mono text-sm font-medium">
                    {order.payerNumber || "Not given"}
                  </dd>
                  {order.payerNumber && order.payerNumber !== order.user.phone ? (
                    <dd className="text-xs text-muted-foreground">
                      Different from the account number
                    </dd>
                  ) : null}
                </div>
                <div>
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
                    <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>
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
