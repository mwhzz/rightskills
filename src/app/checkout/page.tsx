import Link from "next/link";
import { CheckoutAuth } from "@/components/checkout-auth";
import { CheckoutForm } from "@/components/checkout-form";
import { PaymentSteps } from "@/components/payment-steps";
import { formatBdt } from "@/lib/format";
import { getCart } from "@/lib/session";
import { getSession } from "@/lib/auth";
import { getOwnedSlugsForUser, getSettings, listPublishedCourses } from "@/lib/queries";
import { getDictionary, getLocale } from "@/lib/i18n";
import { courseTitle } from "@/lib/courses";
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
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
        {dict.checkout.kicker}
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        {session ? dict.checkout.titleLoggedIn : dict.checkout.titleGuest}
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        {session
          ? dict.checkout.subtitleLoggedIn(session.name)
          : dict.checkout.subtitleGuest}
      </p>

      <div className="mt-8">
        <PaymentSteps current={1} />
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border bg-card px-6 py-16 text-center">
          <p className="font-heading text-2xl font-semibold">{dict.checkout.nothingToPay}</p>
          <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
            {alreadyOwned.length
              ? dict.checkout.alreadyOwnedBody
              : dict.checkout.addCourseBody}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/courses" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
              {dict.mobileDock.browseCourses}
            </Link>
            {session ? (
              <Link
                href="/learn"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
              >
                {dict.nav.myLearning}
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
              defaultPayerNumber={session.phone ?? ""}
            />
          ) : (
            <CheckoutAuth error={error} initialMode={authMode} />
          )}
          <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-heading text-lg font-semibold">{dict.checkout.orderSummary}</h2>
              <ul className="mt-4 space-y-3">
                {items.map((course) => (
                  <li key={course.slug} className="flex gap-3">
                    {course.cover.image ? (
                      <img
                        src={course.cover.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="size-12 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="size-12 shrink-0 rounded-lg"
                        style={{
                          backgroundImage: `linear-gradient(145deg, ${course.cover.from}, ${course.cover.to})`,
                        }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="block truncate text-sm font-medium hover:text-primary"
                      >
                        {courseTitle(course, locale)}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatBdt(course.priceBdt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t pt-3 text-sm font-semibold">
                <span>{dict.checkout.totalCourses(items.length)}</span>
                <span>{formatBdt(cartTotal)}</span>
              </div>
              <Link
                href="/cart"
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                {dict.checkout.editCart}
              </Link>
            </div>
            <div className="rounded-2xl border bg-card p-5 text-sm leading-6 text-muted-foreground">
              <p className="font-heading text-base font-semibold text-foreground">
                {dict.checkout.howItWorks}
              </p>
              <ol className="mt-3 space-y-2">
                {dict.checkout.steps.map((step, index) => (
                  <li key={step}>
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>
            </div>
            {alreadyOwned.length > 0 ? (
              <p className="rounded-2xl border px-4 py-3 text-sm text-muted-foreground">
                {dict.checkout.alreadyUnlockedPrefix}
                {alreadyOwned.map((course) => courseTitle(course, locale)).join(", ")}
              </p>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}
