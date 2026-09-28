"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  ScrollText,
  Settings,
  Sparkles,
  Star,
  Tag,
  Ticket,
  Users,
  X,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const home = links.find((link) => link.href === "/admin");
  const current = links.find((link) => isActive(link.href, pathname));

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-full min-h-0 bg-[#f6f0ea]">
      <aside className="hidden h-full w-[16.5rem] shrink-0 flex-col bg-[#2a1810] text-[#fff6ee] md:flex">
        <SidePanel
          links={links}
          name={name}
          roleLabel={roleLabel}
          pathname={pathname}
          home={home}
        />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-[#24160f]/55"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[min(19rem,88vw)] flex-col bg-[#2a1810] text-[#fff6ee] shadow-[0_24px_60px_-20px_rgba(36,22,15,0.7)]">
            <SidePanel
              links={links}
              name={name}
              roleLabel={roleLabel}
              pathname={pathname}
              home={home}
              onClose={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 bg-[#2a1810] px-3 py-3 text-[#fff6ee] md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex size-10 items-center justify-center rounded-xl bg-white/10"
          >
            <Menu className="size-5" />
          </button>
          <span className="min-w-0 flex-1 truncate font-heading text-base font-semibold">
            {current?.label ?? "Admin"}
          </span>
          <Link
            href="/admin"
            className="flex size-10 items-center justify-center rounded-xl bg-[#fff6ee]"
          >
            <BrandMark className="size-6" />
          </Link>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}

function isActive(href: string, pathname: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidePanel({
  links,
  name,
  roleLabel,
  pathname,
  home,
  onClose,
}: {
  links: AdminNavLink[];
  name: string;
  roleLabel: string;
  pathname: string;
  home?: AdminNavLink;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <Link href="/admin" onClick={onClose} className="flex min-w-0 flex-1 items-center gap-2.5">
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
        {onClose ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xl text-[#f0d4c2]"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-2.5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {home ? (
          <NavLink link={home} active={isActive(home.href, pathname)} onClose={onClose} />
        ) : null}
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
                  <NavLink
                    key={link.href}
                    link={link}
                    active={isActive(link.href, pathname)}
                    onClose={onClose}
                  />
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
    </>
  );
}

function NavLink({
  link,
  active,
  onClose,
}: {
  link: AdminNavLink;
  active: boolean;
  onClose?: () => void;
}) {
  const Icon = icons[link.href] ?? LayoutDashboard;
  return (
    <Link
      href={link.href}
      onClick={onClose}
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
