import Link from "next/link";
import { CheckCircle2, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CopyValue } from "@/components/copy-value";
import { PaymentSteps } from "@/components/payment-steps";
import { TrxForm } from "@/components/trx-form";
import { formatBdt, formatWhen } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Send money",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; submitted?: string; error?: string }>;
}) {
  const user = await requireUser("/checkout");
  const { order: orderId, submitted, error } = await searchParams;
  const [settings, order] = await Promise.all([
    getSettings(),
    prisma.order.findFirst({
      where: { orderId: orderId ?? "", userId: user.id },
      include: { items: { include: { course: true } } },
    }),
  ]);

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border bg-card px-6 py-16 text-center">
          <p className="font-heading text-2xl font-semibold">No order found</p>
          <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
            If you just placed an order, open My orders. Otherwise start from
            the cart.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/account/orders" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
              My orders
            </Link>
            <Link
              href="/cart"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
            >
              Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const payTo =
    order.method === "nagad" ? settings.nagadNumber : settings.bkashNumber;
  const methodLabel = order.method === "nagad" ? "Nagad" : "bKash";
  const paid = order.status === "paid";
  const waiting = order.status === "awaiting_review";
  const currentStep: 1 | 2 | 3 = paid ? 3 : 2;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
        {paid ? "Unlocked" : "Send money"}
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {paid
              ? "Payment confirmed"
              : waiting
                ? "TrxID received"
                : `Send ${formatBdt(order.totalBdt)} via ${methodLabel}`}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Order {order.orderId} · placed {formatWhen(order.createdAt)}
          </p>
        </div>
        {paid ? (
          <CheckCircle2 className="size-12 text-primary" />
        ) : (
          <Wallet className="size-12 text-primary" />
        )}
      </div>

      <div className="mt-8">
        <PaymentSteps current={currentStep} />
      </div>

      {submitted ? (
        <p className="mt-6 rounded-2xl border bg-primary/5 px-4 py-3 text-sm">
          TrxID submitted. Keep this page or check My orders — the course unlocks
          after an admin matches the payment.
        </p>
      ) : null}
      {error === "trx" ? (
        <p className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Enter a valid TrxID (at least 4 characters).
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_0.9fr]">
        <div className="rounded-2xl border bg-card p-6">
          {paid ? (
            <>
              <p className="font-heading text-xl font-semibold">Open your course</p>
              <p className="mt-2 text-sm text-muted-foreground">
                This order is marked paid. Lessons are on My learning.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {order.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/learn/${item.course.slug}`}
                    className={cn(buttonVariants({ size: "lg" }), "h-11")}
                  >
                    Open {item.course.title}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                Send exactly
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="font-heading text-4xl font-semibold">
                  {formatBdt(order.totalBdt)}
                </p>
                <CopyValue value={String(order.totalBdt)} />
              </div>
              <p className="mt-6 text-xs tracking-[0.14em] text-muted-foreground uppercase">
                To {methodLabel}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="font-heading text-3xl font-semibold tracking-wide">
                  {payTo || "Number not set yet — contact support"}
                </p>
                {payTo ? <CopyValue value={payTo} /> : null}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono font-medium">{order.orderId}</span>
                <CopyValue value={order.orderId} />
              </div>
              {settings.payInstructions ? (
                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                  {settings.payInstructions}
                </p>
              ) : null}
              <ol className="mt-5 space-y-2 text-sm text-muted-foreground">
                <li>1. Open {methodLabel} and choose Send Money.</li>
                <li>2. Pay the exact amount to the number above.</li>
                <li>3. Copy the TrxID from the SMS or app, then paste it here.</li>
              </ol>
            </>
          )}
        </div>

        <div className="space-y-4">
          {!paid ? (
            <div className="rounded-2xl border bg-card p-5">
              <p className="font-heading text-lg font-semibold">Paste TrxID</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {waiting
                  ? "You can update it if you sent a new payment."
                  : "Do this as soon as the Send Money is done."}
              </p>
              <div className="mt-4">
                <TrxForm
                  orderId={order.orderId}
                  defaultTrxId={order.trxId}
                  from="success"
                />
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border bg-card p-5">
            <p className="font-heading text-lg font-semibold">In this order</p>
            <ul className="mt-3 space-y-2 text-sm">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
                >
                  <span className="min-w-0 truncate font-medium">
                    {item.course.title}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatBdt(item.priceBdt)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/account/orders"
                className={cn(
                  buttonVariants({ variant: paid ? "outline" : "default", size: "lg" }),
                  "h-11"
                )}
              >
                All orders
              </Link>
              <Link
                href="/learn"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
              >
                My learning
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
