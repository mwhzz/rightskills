import Link from "next/link";
import { Trash2 } from "lucide-react";
import { CourseCover } from "@/components/course-cover";
import { buttonVariants } from "@/components/ui/button";
import { formatBdt } from "@/lib/format";
import { getCart } from "@/lib/session";
import { removeFromCartAction } from "@/app/actions";
import { listPublishedCourses } from "@/lib/queries";
import { cn } from "@/lib/utils";

export async function CartView() {
  const [cart, courses] = await Promise.all([getCart(), listPublishedCourses()]);
  const items = courses.filter((course) => cart.includes(course.slug));
  const cartTotal = items.reduce((sum, course) => sum + course.priceBdt, 0);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <p className="font-heading text-lg font-semibold">Cart is empty</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Pick a course from the catalogue. Pay by bKash or Nagad send-money;
          access unlocks after an admin confirms your TrxID.
        </p>
        <Link
          href="/courses"
          className={cn(buttonVariants({ size: "lg" }), "mt-5")}
        >
          Browse courses
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-4">
        {items.map((course) => (
          <li
            key={course.slug}
            className="flex flex-col overflow-hidden rounded-xl border bg-card sm:flex-row"
          >
            <CourseCover
              course={course}
              className="h-32 w-full sm:h-auto sm:w-44"
            />
            <div className="flex flex-1 flex-col justify-between gap-3 p-4">
              <div>
                <Link
                  href={`/courses/${course.slug}`}
                  className="font-heading font-semibold hover:text-primary"
                >
                  {course.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.instructor.name} · {course.language}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{formatBdt(course.priceBdt)}</p>
                <form action={removeFromCartAction}>
                  <input type="hidden" name="slug" value={course.slug} />
                  <button
                    type="submit"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    <Trash2 data-icon="inline-start" />
                    Remove
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit rounded-xl border bg-card p-5">
        <h2 className="font-heading text-base font-semibold">Order summary</h2>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted-foreground">
            {items.length} course{items.length === 1 ? "" : "s"}
          </span>
          <span className="font-medium">{formatBdt(cartTotal)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t pt-3 text-sm">
          <span className="font-medium">Total</span>
          <span className="font-semibold">{formatBdt(cartTotal)}</span>
        </div>
        <Link
          href="/checkout"
          className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full")}
        >
          Checkout
        </Link>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          You will send money to our bKash or Nagad number, then paste the TrxID.
        </p>
      </aside>
    </div>
  );
}
