import Link from "next/link";
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

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/courses", label: "Courses" },
    ...(isAdmin
      ? [
          { href: "/admin/orders", label: "Orders" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/settings", label: "Settings" },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-full bg-muted/40">
      <aside className="hidden w-56 shrink-0 border-r bg-card md:flex md:flex-col">
        <Link href="/admin" className="flex items-center gap-2 border-b px-4 py-4">
          <BrandMark className="size-7 text-primary" />
          <span className="text-sm font-semibold">Panel</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            View site
          </Link>
        </nav>
        <form action={logoutAction} className="border-t p-3">
          <button type="submit" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full")}>
            Log out
          </button>
        </form>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {user.name} · {user.role}
          </p>
        </header>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
