import Link from "next/link";
import { submitTrxAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/queries";
import { formatBdt } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  pending: "Waiting for TrxID",
  awaiting_review: "Waiting for admin",
  paid: "Paid — course unlocked",
  rejected: "Rejected",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string }>;
}) {
  const user = await requireUser();
  const { error, submitted } = await searchParams;
  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { course: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getSettings(),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        My orders
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Send Money to{" "}
        <span className="font-medium text-foreground">
          bKash {settings.bkashNumber || "—"} / Nagad {settings.nagadNumber || "—"}
        </span>
        . Then paste the TrxID.
      </p>
      {submitted ? (
        <p className="mt-4 rounded-lg border bg-primary/5 px-3 py-2 text-sm">
          TrxID submitted. We will unlock the course after checking the payment.
        </p>
      ) : null}
      {error === "trx" ? (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Enter a valid TrxID.
        </p>
      ) : null}

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <p className="font-heading font-semibold">No orders yet</p>
          <Link href="/courses" className={cn(buttonVariants(), "mt-4")}>
            Browse courses
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-heading font-semibold">{order.orderId}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatBdt(order.totalBdt)} · {order.method.toUpperCase()} ·{" "}
                    {statusLabel[order.status]}
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {order.items.map((item) => (
                  <li key={item.id}>{item.course.title}</li>
                ))}
              </ul>
              {order.status === "pending" || order.status === "awaiting_review" ? (
                <form action={submitTrxAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input type="hidden" name="orderId" value={order.orderId} />
                  <input
                    name="trxId"
                    defaultValue={order.trxId ?? ""}
                    placeholder="TrxID"
                    className="h-10 flex-1 rounded-lg border border-input px-2.5 text-sm"
                  />
                  <button type="submit" className={cn(buttonVariants())}>
                    Submit TrxID
                  </button>
                </form>
              ) : null}
              {order.status === "paid" ? (
                <Link
                  href={`/learn/${order.items[0]?.course.slug ?? ""}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
                >
                  Open course
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
