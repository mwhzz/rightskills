import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatBdt } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const user = await requireUser();
  const { order: orderId } = await searchParams;
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
        <div className="rounded-xl border bg-card px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">No order found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            If you just placed an order, open My orders. Otherwise start from the cart.
          </p>
          <Link href="/account/orders" className={cn(buttonVariants(), "mt-5")}>
            My orders
          </Link>
        </div>
      </div>
    );
  }

  const payTo =
    order.method === "nagad" ? settings.nagadNumber : settings.bkashNumber;
  const methodLabel = order.method === "nagad" ? "Nagad" : "bKash";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-lg rounded-xl border bg-card px-6 py-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">
          Send money to complete
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order <span className="font-medium text-foreground">{order.orderId}</span>
          {" · "}
          {formatBdt(order.totalBdt)} via {methodLabel}
        </p>
        <div className="mt-6 rounded-lg border bg-muted/40 px-4 py-4 text-left text-sm">
          <p>
            Send <span className="font-semibold">{formatBdt(order.totalBdt)}</span> to
          </p>
          <p className="mt-1 font-heading text-xl font-semibold tracking-wide">
            {payTo || "Number not set yet — contact admin"}
          </p>
          <p className="mt-3 text-muted-foreground">{settings.payInstructions}</p>
        </div>
        <ul className="mt-6 space-y-2 text-left text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="rounded-lg border px-3 py-2 font-medium">
              {item.course.title}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/account/orders"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Paste TrxID
          </Link>
          <Link
            href="/learn"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            My learning
          </Link>
        </div>
      </div>
    </div>
  );
}
