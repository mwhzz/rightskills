import Link from "next/link";
import { headers } from "next/headers";
import { logoutAction } from "@/app/actions";
import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { can, getStaffSession, type StaffKey } from "@/lib/staff";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getStaffSession();
  const pathname = (await headers()).get("x-pathname") ?? "/admin";

  const links: { href: string; label: string; access: StaffKey }[] = [
    { href: "/admin", label: "Dashboard", access: "courses" },
    { href: "/admin/courses", label: "Courses", access: "courses" },
    { href: "/admin/just-added", label: "Just added", access: "courses" },
    { href: "/admin/students", label: "Students", access: "students" },
    { href: "/admin/reviews", label: "Reviews", access: "reviews" },
    { href: "/admin/orders", label: "Orders", access: "orders" },
    { href: "/admin/users", label: "Users", access: "users" },
    { href: "/admin/activity", label: "Activity log", access: "orders" },
    { href: "/admin/banners", label: "Banners", access: "banners" },
    { href: "/admin/offers", label: "Offers", access: "offers" },
    { href: "/admin/settings", label: "Settings", access: "settings" },
  ];
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

  const roleLabel = staff.isTeacher
    ? "Teacher"
    : staff.isFull
      ? "Admin"
      : "Staff";

  return (
    <div className="flex h-full min-h-0 bg-muted/40">
      <aside className="hidden h-full w-60 shrink-0 flex-col border-r bg-card md:flex">
        <Link href="/admin" className="flex items-center gap-2.5 border-b px-4 py-4">
          <BrandMark className="size-9 shrink-0 text-primary" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold tracking-tight">
              {brand.name}
            </span>
            <span className="block text-xs text-muted-foreground">{roleLabel}</span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {visible.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          >
            View site
          </Link>
        </nav>
        <form action={logoutAction} className="border-t p-3">
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full")}
          >
            Log out
          </button>
        </form>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3 overflow-x-auto md:hidden">
            <BrandMark className="size-8 shrink-0 text-primary" />
            {visible.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 text-sm font-medium",
                  isActive(link.href) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="ml-auto text-sm text-muted-foreground">
            {staff.name} · {roleLabel}
          </p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
