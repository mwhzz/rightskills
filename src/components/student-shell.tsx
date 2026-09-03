"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, LogOut, Receipt } from "lucide-react";
import { logoutAction } from "@/app/actions";
import type { Role } from "@prisma/client";
import { initialsFromName } from "@/lib/slug";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/learn", label: "My learning", icon: BookOpen },
  { href: "/account/orders", label: "Orders", icon: Receipt },
];

export function StudentShell({
  user,
  children,
}: {
  user: { name: string; role: Role };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const first = user.name.trim().split(/\s+/)[0] || user.name;

  function isActive(href: string) {
    return href === "/account"
      ? pathname === "/account"
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:py-10">
      <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-6">
        <aside className="mb-5 lg:mb-0 lg:h-fit">
          <div className="hidden overflow-hidden rounded-2xl border bg-card lg:block">
            <div className="border-b bg-[linear-gradient(180deg,oklch(0.98_0.03_70),transparent)] px-4 py-5">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
                  {initialsFromName(user.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-heading text-base font-semibold">
                    {first}
                  </p>
                  <p className="text-xs text-muted-foreground">Student panel</p>
                </div>
              </div>
            </div>
            <nav className="flex flex-col gap-1 p-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <link.icon className="size-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <form action={logoutAction} className="border-t p-2">
              <button
                type="submit"
                className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </form>
          </div>

          <div className="lg:hidden">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary font-heading text-xs font-semibold text-primary-foreground">
                {initialsFromName(user.name)}
              </span>
              <p className="truncate font-heading text-sm font-semibold">{first}</p>
            </div>
            <nav className="sticky top-14 z-30 -mx-4 flex gap-1 overflow-x-auto border-b bg-background/95 px-4 py-2 backdrop-blur-md">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <link.icon className="size-3.5" />
                  {link.label}
                </Link>
              ))}
              <form action={logoutAction} className="ml-auto shrink-0">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground"
                >
                  <LogOut className="size-3.5" />
                  Log out
                </button>
              </form>
            </nav>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
