import Link from "next/link";
import { CheckCircle2, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CopyValue } from "@/components/copy-value";
import { PaymentSteps } from "@/components/payment-steps";
import { formatBdt, formatWhen } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getSettings } from "@/lib/queries";
import { courseTitle } from "@/lib/courses";
import { coverImageSrc } from "@/lib/cover-image";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Send money",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const user = await requireUser("/checkout");
  const { order: orderId } = await searchParams;
  const [settings, order, dict, locale] = await Promise.all([
    getSettings(),
    prisma.order.findFirst({
      where: { orderId: orderId ?? "", userId: user.id },
      include: { items: { include: { course: true } } },
    }),
    getDictionary(),
    getLocale(),
  ]);

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-[1.75rem] bg-card px-6 py-14 text-center shadow-[0_24px_60px_-36px_rgba(80,40,10,0.4)] ring-1 ring-black/5">
          <p className="font-heading text-3xl font-semibold">{dict.checkoutSuccess.noOrderTitle}</p>
          <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-muted-foreground">
            {dict.checkoutSuccess.noOrderBody}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Link href="/account/orders" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-2xl px-5")}>
              {dict.checkoutSuccess.myOrders}
            </Link>
            <Link
              href="/cart"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-2xl px-5")}
            >
              {dict.nav.cart}
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

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          {paid ? <CheckCircle2 className="size-5" /> : <Wallet className="size-5" />}
        </span>
        <p className="text-sm font-medium text-primary">
          {paid ? dict.checkoutSuccess.unlockedKicker : dict.checkoutSuccess.sendMoneyKicker}
        </p>
      </div>
      <h1 className="mt-4 font-heading text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
        {paid
          ? dict.checkoutSuccess.paymentConfirmed
          : dict.checkoutSuccess.sendVia(formatBdt(order.totalBdt), methodLabel)}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {dict.checkoutSuccess.orderPlaced(order.orderId, formatWhen(order.createdAt))}
      </p>

      {paid ? (
        <div className="mt-8">
          <PaymentSteps current={3} />
          <div className="mt-6 rounded-[1.6rem] bg-card p-6 shadow-[0_24px_60px_-36px_rgba(80,40,10,0.4)] ring-1 ring-black/5">
            <p className="font-heading text-2xl font-semibold">{dict.checkoutSuccess.openYourCourse}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{dict.checkoutSuccess.paidBody}</p>
            <div className="mt-5 flex flex-col gap-2">
              {order.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/learn/${item.course.slug}`}
                  className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-2xl")}
                >
                  {dict.checkoutSuccess.openCourse(courseTitle(item.course, locale))}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-card shadow-[0_28px_70px_-36px_rgba(80,40,10,0.45)] ring-1 ring-black/5">
          <div className="divide-y divide-foreground/10 px-5 sm:px-7">
            <PayRow
              label={dict.checkoutSuccess.sendExactly}
              value={formatBdt(order.totalBdt)}
              copy={String(order.totalBdt)}
              large
            />
            <PayRow
              label={dict.checkoutSuccess.toMethod(methodLabel)}
              value={payTo || dict.checkoutSuccess.numberNotSet}
              copy={payTo || undefined}
            />
            <PayRow
              label={dict.checkoutSuccess.orderIdLabel}
              value={order.orderId}
              copy={order.orderId}
              mono
            />
          </div>
          <p className="bg-[#fff4eb] px-5 py-4 text-sm leading-6 text-foreground/80 sm:px-7">
            {dict.checkoutSuccess.thankYou}
          </p>
        </div>
      )}

      <div className="mt-5 rounded-[1.6rem] bg-card p-5 shadow-[0_18px_40px_-32px_rgba(80,40,10,0.4)] ring-1 ring-black/5">
        <p className="text-sm font-medium text-muted-foreground">{dict.checkoutSuccess.inThisOrder}</p>
        <ul className="mt-3 space-y-3">
          {order.items.map((item) => {
            const cover = coverImageSrc(item.course.coverImage);
            return (
              <li key={item.id} className="flex items-center gap-3">
                {cover ? (
                  <img
                    src={cover}
                    alt=""
                    className="size-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="size-14 shrink-0 rounded-xl bg-[#fff1e6]" />
                )}
                <span className="min-w-0 flex-1 truncate font-medium">
                  {courseTitle(item.course, locale)}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {formatBdt(item.priceBdt)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <Link
          href="/account/orders"
          className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-2xl text-base")}
        >
          {dict.checkoutSuccess.allOrders}
        </Link>
        <Link
          href="/learn"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 rounded-2xl bg-card text-base"
          )}
        >
          {dict.nav.myLearning}
        </Link>
      </div>
    </div>
  );
}

function PayRow({
  label,
  value,
  copy,
  large,
  mono,
}: {
  label: string;
  value: string;
  copy?: string;
  large?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 font-semibold tracking-tight",
            mono ? "font-mono text-lg" : "font-heading",
            large ? "text-4xl" : "text-[1.65rem]"
          )}
        >
          {value}
        </p>
      </div>
      {copy ? <CopyValue value={copy} className="rounded-full bg-[#fff7f1] px-3" /> : null}
    </div>
  );
}
