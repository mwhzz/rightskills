import Link from "next/link";
import type { Role } from "@prisma/client";
import { BrandMark } from "@/components/brand-mark";
import { logoutAction } from "@/app/actions";
import { brand } from "@/lib/brand";
import { categories } from "@/lib/courses";

const learn = [
  { href: "/courses", label: "All courses" },
  { href: "/brands", label: "Studio" },
  { href: "/instructors", label: "Instructors" },
  { href: "/cart", label: "Cart" },
];

export function SiteFooter({
  user = null,
}: {
  user?: { name: string; role: Role } | null;
}) {
  const staff = user?.role === "admin" || user?.role === "teacher";
  const account = user
    ? [
        { href: "/account", label: "My panel" },
        { href: "/learn", label: "My learning" },
        { href: "/account/orders", label: "Orders" },
        ...(staff ? [{ href: "/admin", label: "Studio" }] : []),
      ]
    : [
        { href: "/login", label: "Log in" },
        { href: "/register", label: "Create account" },
        { href: "/checkout", label: "Checkout" },
      ];

  return (
    <footer className="mt-auto bg-[oklch(0.205_0.028_48)] text-[oklch(0.97_0.01_75)]">
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-8%] h-64 w-64 rounded-full bg-primary/25 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-10 pb-8 sm:px-6 sm:pt-16 sm:pb-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-md">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <BrandMark className="size-9 text-primary" />
                <span className="font-heading text-lg font-semibold tracking-tight">
                  {brand.name}
                </span>
              </Link>
              <p className="mt-4 font-heading text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
                Skills, taught with care.
              </p>
              <p className="mt-3 text-base leading-7 text-white/55">
                {brand.description}
              </p>
            </div>
            <p className="text-sm text-white/40">
              Dhaka · bKash & Nagad after checkout
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 sm:mt-14 sm:gap-10 lg:grid-cols-4">
            <FooterCol title="Learn" links={learn} />
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-white/40 uppercase">
                Topics
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-white/65">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/courses?category=${category.id}`}
                      className="transition-colors hover:text-white"
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-white/40 uppercase">
                Account
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-white/65">
                {account.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
                {user ? (
                  <li>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="transition-colors hover:text-white"
                      >
                        Log out
                      </button>
                    </form>
                  </li>
                ) : null}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-white/40 uppercase">
                Access
              </p>
              <p className="mt-4 max-w-xs text-sm leading-7 text-white/55">
                Short, finished lessons. Access unlocks after payment is
                confirmed — we do not auto-unlock, and we do not issue
                certificates.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 pb-[max(4.75rem,calc(env(safe-area-inset-bottom)+3.25rem))] text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:pb-5">
          <p>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p>Manual bKash / Nagad · TrxID review</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-medium tracking-[0.18em] text-white/40 uppercase">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5 text-sm text-white/65">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
