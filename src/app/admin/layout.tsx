import Link from "next/link";
import { headers } from "next/headers";
import { requireRole } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("admin", "teacher");
  const isAdmin = user.role === "admin";
  const pathname = (await headers()).get("x-pathname") ?? "/admin";

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/courses", label: "Courses" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/reviews", label: "Reviews" },
    ...(isAdmin
      ? [
          { href: "/admin/orders", label: "Orders" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/banners", label: "Banners" },
          { href: "/admin/settings", label: "Settings" },
        ]
      : []),
  ];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex h-full min-h-0 bg-muted/40">
      <aside className="hidden h-full w-60 shrink-0 flex-col border-r bg-card md:flex">
        <Link href="/admin" className="flex items-center gap-2.5 border-b px-4 py-4">
          <BrandMark className="size-9 shrink-0 text-primary" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold tracking-tight">
              Right Skills
            </span>
            <span className="block text-xs text-muted-foreground">
              {isAdmin ? "Admin" : "Teacher"}
            </span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {links.map((link) => (
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
            {links.map((link) => (
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
            {user.name} · {user.role}
          </p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
