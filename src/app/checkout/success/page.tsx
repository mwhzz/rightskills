import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getCourse } from "@/lib/courses";
import { formatBdt } from "@/lib/format";
import { getPurchases } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const purchases = await getPurchases();
  const order =
    purchases.find((item) => item.orderId === orderId) ?? purchases[0];

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-xl border bg-card px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">No order found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            If you just paid, refresh this page. Otherwise start from the cart.
          </p>
          <Link href="/cart" className={cn(buttonVariants(), "mt-5")}>
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-lg rounded-xl border bg-card px-6 py-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">You are in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order <span className="font-medium text-foreground">{order.orderId}</span>{" "}
          · {formatBdt(order.totalBdt)} via{" "}
          {order.method === "bkash"
            ? "bKash"
            : order.method === "nagad"
              ? "Nagad"
              : "card"}
        </p>
        <ul className="mt-6 space-y-2 text-left text-sm">
          {order.slugs.map((slug) => {
            const course = getCourse(slug);
            return (
              <li key={slug} className="rounded-lg border px-3 py-2 font-medium">
                {course?.title ?? slug}
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={`/learn/${order.slugs[0]}`}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Start learning
          </Link>
          <Link
            href="/learn"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            My library
          </Link>
        </div>
      </div>
    </div>
  );
}
