"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, LogOut, Receipt } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { useLocale } from "@/components/locale-provider";
import type { Role } from "@prisma/client";
import { initialsFromName } from "@/lib/slug";
import { cn } from "@/lib/utils";

export function StudentShell({
  user,
  children,
}: {
  user: { name: string; role: Role };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { dict } = useLocale();
  const first = user.name.trim().split(/\s+/)[0] || user.name;
  const links = [
    { href: "/account", label: dict.studentShell.overview, icon: LayoutDashboard },
    { href: "/learn", label: dict.nav.myLearning, icon: BookOpen },
    { href: "/account/orders", label: dict.nav.orders, icon: Receipt },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="h-fit overflow-hidden rounded-2xl border bg-card">
          <div className="border-b bg-[linear-gradient(180deg,oklch(0.98_0.03_70),transparent)] px-4 py-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
                {initialsFromName(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-heading text-base font-semibold">
                  {first}
                </p>
                <p className="text-xs text-muted-foreground">{dict.studentShell.studentPanel}</p>
              </div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col">
            {links.map((link) => {
              const active =
                link.href === "/account"
                  ? pathname === "/account"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <link.icon className="size-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <form action={logoutAction} className="border-t p-2">
            <button
              type="submit"
              className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
              {dict.nav.logout}
            </button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
