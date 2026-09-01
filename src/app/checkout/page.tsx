import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
import { courses } from "@/lib/courses";
import { formatBdt } from "@/lib/format";
import { getCart } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cart = await getCart();
  const items = courses.filter((course) => cart.includes(course.slug));
  const cartTotal = items.reduce((sum, course) => sum + course.priceBdt, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Checkout
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Demo payment — bKash, Nagad, or card. No money is collected.
      </p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">Nothing to pay for</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a course first, then come back to checkout.
          </p>
          <Link
            href="/courses"
            className={cn(buttonVariants({ size: "lg" }), "mt-5")}
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <CheckoutForm totalBdt={cartTotal} error={error} />
          <aside className="h-fit rounded-xl border bg-card p-5">
            <h2 className="font-heading text-base font-semibold">
              You are buying
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {items.map((course) => (
                <li key={course.slug} className="flex justify-between gap-3">
                  <span className="leading-snug">{course.title}</span>
                  <span className="shrink-0 font-medium">
                    {formatBdt(course.priceBdt)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t pt-3 text-sm font-semibold">
              <span>Total</span>
              <span>{formatBdt(cartTotal)}</span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
