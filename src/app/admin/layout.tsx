import Link from "next/link";
import { headers } from "next/headers";
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
import { can, getStaffSession, type StaffKey } from "@/lib/staff";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type NavGroup = "Teaching" | "Sales" | "Site";

const links: {
  href: string;
  label: string;
  access: StaffKey;
  icon: LucideIcon;
  group?: NavGroup;
}[] = [
  { href: "/admin", label: "Dashboard", access: "courses", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", access: "courses", icon: BookOpen, group: "Teaching" },
  { href: "/admin/just-added", label: "Just added", access: "courses", icon: Sparkles, group: "Teaching" },
  { href: "/admin/students", label: "Students", access: "students", icon: GraduationCap, group: "Teaching" },
  { href: "/admin/reviews", label: "Reviews", access: "reviews", icon: Star, group: "Teaching" },
  { href: "/admin/orders", label: "Orders", access: "orders", icon: Receipt, group: "Sales" },
  { href: "/admin/promos", label: "Promos", access: "orders", icon: Ticket, group: "Sales" },
  { href: "/admin/users", label: "Users", access: "users", icon: Users, group: "Site" },
  { href: "/admin/activity", label: "Activity log", access: "orders", icon: ScrollText, group: "Site" },
  { href: "/admin/banners", label: "Banners", access: "banners", icon: ImageIcon, group: "Site" },
  { href: "/admin/offers", label: "Offers", access: "offers", icon: Tag, group: "Site" },
  { href: "/admin/settings", label: "Settings", access: "settings", icon: Settings, group: "Site" },
];

const groups: NavGroup[] = ["Teaching", "Sales", "Site"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getStaffSession();
  const pathname = (await headers()).get("x-pathname") ?? "/admin";

  const visible = links.filter((link) => {
    if (link.href === "/admin") return true;
    if (staff.isTeacher && link.href === "/admin/just-added") return false;
    if (staff.isTeacher && (link.access === "courses" || link.access === "reviews")) {
      return true;
    }
    if (staff.isTeacher && link.access === "students") return true;
    if (link.href === "/admin/activity") return !staff.isTeacher;
    return can(staff.access, link.access);
  });

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const roleLabel = staff.isTeacher ? "Teacher" : staff.isFull ? "Admin" : "Staff";
  const home = visible.find((link) => link.href === "/admin");

  return (
    <div className="flex h-full min-h-0 bg-[#f6f0ea]">
      <aside className="hidden h-full w-[16.5rem] shrink-0 flex-col bg-[#2a1810] text-[#fff6ee] md:flex">
        <Link href="/admin" className="flex items-center gap-3 px-5 pt-6 pb-5">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#fff6ee]">
            <BrandMark className="size-7" />
          </span>
          <span className="min-w-0">
            <span className="block font-heading text-[15px] leading-tight font-semibold tracking-tight">
              Right Skills
            </span>
            <span className="mt-0.5 block text-xs text-[#e4c4ae]">{roleLabel}</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
          {home ? <NavLink link={home} active={isActive(home.href)} /> : null}
          {groups.map((group) => {
            const items = visible.filter((link) => link.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <p className="px-3 pb-1.5 text-[11px] font-medium tracking-[0.16em] text-[#c9a08a] uppercase">
                  {group}
                </p>
                <div className="flex flex-col gap-0.5">
                  {items.map((link) => (
                    <NavLink key={link.href} link={link} active={isActive(link.href)} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#f0d4c2] transition hover:bg-white/8"
          >
            <ExternalLink className="size-4 shrink-0" />
            View site
          </Link>
          <div className="mt-2 flex items-center gap-3 px-3 pt-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fff1e6] font-heading text-sm font-semibold text-[#2a1810]">
              {staff.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{staff.name}</span>
              <span className="block text-xs text-[#c9a08a]">{roleLabel}</span>
            </span>
          </div>
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#f0d4c2] transition hover:bg-white/8"
            >
              <LogOut className="size-4 shrink-0" />
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 bg-[#2a1810] px-3 py-3 text-[#fff6ee] md:hidden">
          <Link href="/admin" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#fff6ee]">
            <BrandMark className="size-6" />
          </Link>
          <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {visible.map((link) => {
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
            <button type="submit" className="flex size-9 items-center justify-center rounded-xl text-[#f0d4c2]" aria-label="Log out">
              <LogOut className="size-4" />
            </button>
          </form>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}

function NavLink({
  link,
  active,
}: {
  link: { href: string; label: string; icon: LucideIcon };
  active: boolean;
}) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition",
        active ? "bg-[#fff6ee] text-[#2a1810]" : "text-[#f0d4c2] hover:bg-white/8"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {link.label}
    </Link>
  );
}
