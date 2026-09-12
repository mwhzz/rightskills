import Link from "next/link";
import { Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/queries";
import { formatBdt, formatWhen } from "@/lib/format";
import {
  OrderStatusBadge,
  StudentOrderTimeline,
} from "@/components/order-status";
import { CopyValue } from "@/components/copy-value";
import { PaymentSteps } from "@/components/payment-steps";
import { TrxForm } from "@/components/trx-form";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/lib/i18n";
import { courseTitle } from "@/lib/courses";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My orders",
};

const filterIds = ["all", "pending", "awaiting_review", "paid", "rejected"] as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string; status?: string }>;
}) {
  const user = await requireUser("/account/orders");
  const { error, submitted, status: statusParam } = await searchParams;
  const status = filterIds.includes(statusParam as (typeof filterIds)[number])
    ? (statusParam as (typeof filterIds)[number])
    : "all";

  const [allOrders, settings, dict, locale] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { course: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getSettings(),
    getDictionary(),
    getLocale(),
  ]);
  const filters = [
    { id: "all" as const, label: dict.ordersPage.filterAll },
    { id: "pending" as const, label: dict.ordersPage.filterPending },
    { id: "awaiting_review" as const, label: dict.ordersPage.filterAwaitingReview },
    { id: "paid" as const, label: dict.ordersPage.filterPaid },
    { id: "rejected" as const, label: dict.ordersPage.filterRejected },
  ];

  const orders =
    status === "all" ? allOrders : allOrders.filter((order) => order.status === status);

  const open = allOrders.filter(
    (order) => order.status === "pending" || order.status === "awaiting_review"
  ).length;
  const paid = allOrders.filter((order) => order.status === "paid").length;

  return (
    <div>
      <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
        {dict.ordersPage.kicker}
      </p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {dict.ordersPage.title}
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        {dict.ordersPage.subtitle}
      </p>

      <div className="mt-8">
        <PaymentSteps current={open ? 2 : paid ? 3 : 1} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                bKash
              </p>
              <p className="mt-2 font-heading text-2xl font-semibold tracking-wide">
                {settings.bkashNumber || dict.ordersPage.notSet}
              </p>
            </div>
            {settings.bkashNumber ? <CopyValue value={settings.bkashNumber} /> : null}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                Nagad
              </p>
              <p className="mt-2 font-heading text-2xl font-semibold tracking-wide">
                {settings.nagadNumber || dict.ordersPage.notSet}
              </p>
            </div>
            {settings.nagadNumber ? <CopyValue value={settings.nagadNumber} /> : null}
          </div>
        </div>
      </div>
      {settings.payInstructions ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {settings.payInstructions}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">{dict.ordersPage.openPayments}</p>
          <p className="mt-2 font-heading text-2xl font-semibold">{open}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">{dict.ordersPage.paid}</p>
          <p className="mt-2 font-heading text-2xl font-semibold">{paid}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">{dict.ordersPage.allOrders}</p>
          <p className="mt-2 font-heading text-2xl font-semibold">{allOrders.length}</p>
        </div>
      </div>

      {submitted ? (
        <p className="mt-6 rounded-2xl border bg-primary/5 px-4 py-3 text-sm">
          {dict.ordersPage.trxSubmittedNote}
        </p>
      ) : null}
      {error === "trx" ? (
        <p className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {dict.ordersPage.invalidTrxError}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((item) => (
          <Link
            key={item.id}
            href={item.id === "all" ? "/account/orders" : `/account/orders?status=${item.id}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              status === item.id
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:border-primary/40"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {allOrders.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-card px-6 py-16 text-center">
          <Wallet className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-4 font-heading text-2xl font-semibold">{dict.ordersPage.noOrdersTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
            {dict.ordersPage.noOrdersBody}
          </p>
          <Link href="/courses" className={cn(buttonVariants({ size: "lg" }), "mt-6 h-11")}>
            {dict.mobileDock.browseCourses}
          </Link>
        </div>
      ) : orders.length === 0 ? (
        <p className="mt-8 rounded-2xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          {dict.ordersPage.noOrdersInView}
        </p>
      ) : (
        <ul className="mt-8 space-y-5">
          {orders.map((order) => {
            const payTo =
              order.method === "nagad" ? settings.nagadNumber : settings.bkashNumber;
            const methodLabel = order.method === "nagad" ? "Nagad" : "bKash";
            return (
              <li key={order.id} className="rounded-2xl border bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-xl font-semibold">
                        {order.orderId}
                      </p>
                      <CopyValue value={order.orderId} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {dict.ordersPage.placedAt(formatWhen(order.createdAt))}
                      {order.updatedAt.getTime() !== order.createdAt.getTime()
                        ? dict.ordersPage.updatedAt(formatWhen(order.updatedAt))
                        : ""}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} audience="student" />
                </div>

                <div className="mt-5">
                  <StudentOrderTimeline status={order.status} />
                </div>

                <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                      {dict.ordersPage.amountLabel}
                    </dt>
                    <dd className="mt-1 flex items-center gap-2 font-heading text-xl font-semibold">
                      {formatBdt(order.totalBdt)}
                      <CopyValue value={String(order.totalBdt)} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                      {dict.ordersPage.sendViaLabel(methodLabel)}
                    </dt>
                    <dd className="mt-1 flex items-center gap-2 font-heading text-lg font-semibold tracking-wide">
                      {payTo || dict.ordersPage.numberNotSet}
                      {payTo ? <CopyValue value={payTo} /> : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                      {dict.ordersPage.trxIdLabel}
                    </dt>
                    <dd className="mt-1 font-mono text-sm">
                      {order.trxId || dict.ordersPage.trxNotSubmitted}
                    </dd>
                  </div>
                </dl>

                <ul className="mt-5 divide-y rounded-xl border">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <span className="min-w-0 truncate">{courseTitle(item.course, locale)}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {formatBdt(item.priceBdt)}
                      </span>
                    </li>
                  ))}
                </ul>

                {order.status === "pending" || order.status === "awaiting_review" ? (
                  <div className="mt-5">
                    <p className="mb-2 text-sm text-muted-foreground">
                      {dict.ordersPage.afterSendMoney(methodLabel)}
                    </p>
                    <TrxForm
                      orderId={order.orderId}
                      defaultTrxId={order.trxId}
                      defaultPayerNumber={order.payerNumber}
                    />
                  </div>
                ) : null}

                {order.status === "paid" ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/learn/${item.course.slug}`}
                        className={cn(buttonVariants({ size: "lg" }), "h-11")}
                      >
                        {dict.ordersPage.openCourse(courseTitle(item.course, locale))}
                      </Link>
                    ))}
                  </div>
                ) : null}

                {order.status === "rejected" ? (
                  <p className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {dict.ordersPage.rejectedNote}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
