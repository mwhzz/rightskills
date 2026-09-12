import Link from "next/link";
import type { Role } from "@prisma/client";
import { BrandMark } from "@/components/brand-mark";
import { logoutAction } from "@/app/actions";
import { getDictionary, getLocale } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { categories } from "@/lib/courses";

export async function SiteFooter({
  user = null,
}: {
  user?: { name: string; role: Role } | null;
}) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const staff = user?.role === "admin" || user?.role === "teacher";
  const learn = [
    { href: "/courses", label: dict.footer.allCourses },
    { href: "/brands", label: dict.nav.studio },
    { href: "/instructors", label: dict.nav.instructors },
    { href: "/cart", label: dict.nav.cart },
  ];
  const account = user
    ? [
        { href: "/account", label: dict.nav.myPanel },
        { href: "/learn", label: dict.nav.myLearning },
        { href: "/account/orders", label: dict.nav.orders },
        ...(staff ? [{ href: "/admin", label: dict.nav.studio }] : []),
      ]
    : [
        { href: "/login", label: dict.nav.login },
        { href: "/register", label: dict.footer.createAccount },
        { href: "/checkout", label: dict.footer.checkout },
      ];

  return (
    <footer className="mt-auto bg-[oklch(0.205_0.028_48)] text-[oklch(0.97_0.01_75)]">
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-8%] h-64 w-64 rounded-full bg-primary/25 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-16 pb-10 sm:px-6">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-md">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <BrandMark className="size-9 text-primary" />
                <span className="font-heading text-lg font-semibold tracking-tight">
                  {brand.name}
                </span>
              </Link>
              <p className="mt-5 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {dict.footer.tagline}
              </p>
              <p className="mt-3 text-base leading-7 text-white/55">
                {brand.description}
              </p>
            </div>
            <p className="text-sm text-white/40">{dict.footer.locationNote}</p>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <FooterCol title={dict.footer.learnTitle} links={learn} />
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-white/40 uppercase">
                {dict.footer.topicsTitle}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-white/65">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/courses?category=${category.id}`}
                      className="transition-colors hover:text-white"
                    >
                      {locale === "bn" ? category.bangla : category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-white/40 uppercase">
                {dict.footer.accountTitle}
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
                        {dict.nav.logout}
                      </button>
                    </form>
                  </li>
                ) : null}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-white/40 uppercase">
                {dict.footer.accessTitle}
              </p>
              <p className="mt-4 max-w-xs text-sm leading-7 text-white/55">
                {dict.footer.accessBody}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {brand.name}. {dict.footer.rightsReserved}
          </p>
          <p>{dict.footer.paymentNote}</p>
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
