"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Receipt,
  ScrollText,
  Settings,
  Sparkles,
  Star,
  Tag,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/app/actions";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

export type AdminNavLink = {
  href: string;
  label: string;
  group?: "Teaching" | "Sales" | "Site";
};

const icons: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/courses": BookOpen,
  "/admin/just-added": Sparkles,
  "/admin/students": GraduationCap,
  "/admin/reviews": Star,
  "/admin/orders": Receipt,
  "/admin/promos": Ticket,
  "/admin/users": Users,
  "/admin/activity": ScrollText,
  "/admin/banners": ImageIcon,
  "/admin/offers": Tag,
  "/admin/settings": Settings,
};

const groups = ["Teaching", "Sales", "Site"] as const;

export function AdminShell({
  links,
  name,
  roleLabel,
  children,
}: {
  links: AdminNavLink[];
  name: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const home = links.find((link) => link.href === "/admin");

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex h-full min-h-0 bg-[#f6f0ea]">
      <aside className="hidden h-full w-[16.5rem] shrink-0 flex-col bg-[#2a1810] text-[#fff6ee] md:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#fff6ee]">
            <BrandMark className="size-6" />
          </span>
          <span className="min-w-0">
            <span className="block font-heading text-sm leading-tight font-semibold tracking-tight">
              Right Skills
            </span>
            <span className="block text-[11px] text-[#e4c4ae]">{roleLabel}</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-3 px-2.5 pb-2">
          {home ? <NavLink link={home} active={isActive(home.href)} /> : null}
          {groups.map((group) => {
            const items = links.filter((link) => link.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <p className="px-2.5 pb-0.5 text-[10px] font-medium tracking-[0.16em] text-[#c9a08a] uppercase">
                  {group}
                </p>
                <div className="flex flex-col">
                  {items.map((link) => (
                    <NavLink key={link.href} link={link} active={isActive(link.href)} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 border-t border-white/10 px-3 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff1e6] font-heading text-xs font-semibold text-[#2a1810]">
            {name.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm leading-tight font-medium">{name}</span>
            <span className="block text-[11px] text-[#c9a08a]">{roleLabel}</span>
          </span>
          <Link
            href="/"
            aria-label="View site"
            className="flex size-8 items-center justify-center rounded-lg text-[#f0d4c2] transition hover:bg-white/8"
          >
            <ExternalLink className="size-4" />
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Log out"
              className="flex size-8 items-center justify-center rounded-lg text-[#f0d4c2] transition hover:bg-white/8"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 bg-[#2a1810] px-3 py-3 text-[#fff6ee] md:hidden">
          <Link href="/admin" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#fff6ee]">
            <BrandMark className="size-6" />
          </Link>
          <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium",
                    active ? "bg-[#fff6ee] text-[#2a1810]" : "text-[#f0d4c2]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex size-9 items-center justify-center rounded-xl text-[#f0d4c2]"
              aria-label="Log out"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}

function NavLink({ link, active }: { link: AdminNavLink; active: boolean }) {
  const Icon = icons[link.href] ?? LayoutDashboard;
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition",
        active ? "bg-[#fff6ee] text-[#2a1810]" : "text-[#f0d4c2] hover:bg-white/8"
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {link.label}
    </Link>
  );
}
