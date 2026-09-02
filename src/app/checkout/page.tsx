import Link from "next/link";
import { CheckoutAuth } from "@/components/checkout-auth";
import { CheckoutForm } from "@/components/checkout-form";
import { PaymentSteps } from "@/components/payment-steps";
import { formatBdt } from "@/lib/format";
import { getCart } from "@/lib/session";
import { getSession } from "@/lib/auth";
import { getOwnedSlugsForUser, getSettings, listPublishedCourses } from "@/lib/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; auth?: string }>;
}) {
  const session = await getSession();
  const { error, auth } = await searchParams;
  const [cart, courses, settings, owned] = await Promise.all([
    getCart(),
    listPublishedCourses(),
    getSettings(),
    session ? getOwnedSlugsForUser(session.id) : Promise.resolve([] as string[]),
  ]);
  const alreadyOwned = courses.filter(
    (course) => owned.includes(course.slug) && cart.includes(course.slug)
  );
  const items = courses.filter(
    (course) => cart.includes(course.slug) && !owned.includes(course.slug)
  );
  const cartTotal = items.reduce((sum, course) => sum + course.priceBdt, 0);
  const authMode = auth === "login" ? "login" : "register";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
        Checkout
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        {session ? "Place the order, then send money" : "Your courses are waiting"}
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        {session
          ? `Paying as ${session.name}. After this step you will see the wallet number and amount. Courses unlock only after an admin confirms the TrxID.`
          : "No account needed to pick a course. Log in or create one here to place the order, then send money on bKash or Nagad."}
      </p>

      <div className="mt-8">
        <PaymentSteps current={1} />
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border bg-card px-6 py-16 text-center">
          <p className="font-heading text-2xl font-semibold">Nothing to pay for</p>
          <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
            {alreadyOwned.length
              ? "Every course in your cart is already unlocked on this account."
              : "Add a course first, then come back to checkout."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/courses" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
              Browse courses
            </Link>
            {session ? (
              <Link
                href="/learn"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
              >
                My learning
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {session ? (
            <CheckoutForm
              totalBdt={cartTotal}
              error={error}
              bkashNumber={settings.bkashNumber}
              nagadNumber={settings.nagadNumber}
            />
          ) : (
            <CheckoutAuth error={error} initialMode={authMode} />
          )}
          <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-heading text-lg font-semibold">Order summary</h2>
              <ul className="mt-4 space-y-3">
                {items.map((course) => (
                  <li key={course.slug} className="flex gap-3">
                    <div
                      className="size-12 shrink-0 rounded-lg"
                      style={{
                        backgroundImage: `linear-gradient(145deg, ${course.cover.from}, ${course.cover.to})`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="block truncate text-sm font-medium hover:text-primary"
                      >
                        {course.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatBdt(course.priceBdt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t pt-3 text-sm font-semibold">
                <span>
                  Total · {items.length} course{items.length === 1 ? "" : "s"}
                </span>
                <span>{formatBdt(cartTotal)}</span>
              </div>
              <Link
                href="/cart"
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                Edit cart
              </Link>
            </div>
            <div className="rounded-2xl border bg-card p-5 text-sm leading-6 text-muted-foreground">
              <p className="font-heading text-base font-semibold text-foreground">
                After you place the order
              </p>
              <ol className="mt-3 space-y-2">
                <li>1. Copy the amount and the wallet number.</li>
                <li>2. Send Money from your bKash or Nagad app.</li>
                <li>3. Paste the TrxID — you can do that on the next screen.</li>
                <li>4. Wait for an admin to match it. Then open My learning.</li>
              </ol>
            </div>
            {alreadyOwned.length > 0 ? (
              <p className="rounded-2xl border px-4 py-3 text-sm text-muted-foreground">
                Already unlocked and skipped:{" "}
                {alreadyOwned.map((course) => course.title).join(", ")}
              </p>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}
