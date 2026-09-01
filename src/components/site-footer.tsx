import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { categories } from "@/lib/courses";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <BrandMark className="size-8 text-primary" />
            <span className="text-sm font-semibold">Skills Bangladesh</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Job-ready courses priced in taka, taught for the Bangladeshi market —
            freelance, office, and career skills you can use this month.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Categories</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/courses?category=${category.id}`}
                  className="hover:text-foreground"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Learn</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/courses" className="hover:text-foreground">
                All courses
              </Link>
            </li>
            <li>
              <Link href="/learn" className="hover:text-foreground">
                My learning
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-foreground">
                Cart
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-xs leading-5 text-muted-foreground">
            Pay with bKash or Nagad Send Money. Courses unlock after we confirm
            your TrxID.
          </p>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Skills Bangladesh. Built for learners across
          Bangladesh.
        </p>
      </div>
    </footer>
  );
}
