"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logoutAction } from "@/app/actions";
import { initialsFromName } from "@/lib/slug";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/instructors", label: "Instructors" },
  { href: "/brands", label: "Studio" },
];

export function SiteHeader({
  cartCount = 0,
  user,
}: {
  cartCount?: number;
  user?: { name: string; role: Role } | null;
}) {
  const pathname = usePathname();
  const staff = user?.role === "admin" || user?.role === "teacher";
  const [scrolled, setScrolled] = useState(false);
  const loginHref =
    pathname === "/checkout" || pathname === "/cart"
      ? "/login?next=/checkout"
      : "/login";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/80 shadow-[0_12px_40px_-24px_rgba(90,40,10,0.45)] backdrop-blur-xl"
          : "border-b border-transparent bg-background/55 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <BrandMark className="size-8 text-primary" />
          <span className="font-heading text-[0.95rem] font-semibold tracking-tight">
            Right Skills
          </span>
        </Link>

        <nav className="hidden lg:block">
          <div className="flex items-center gap-0.5 rounded-full border border-border/70 bg-background/70 p-1">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <form
          action="/courses"
          method="get"
          className="relative ml-auto hidden min-w-0 max-w-xs flex-1 md:block"
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Search courses"
            aria-label="Search courses"
            className="h-9 w-full rounded-full border border-border/80 bg-background/80 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Link
            href="/cart"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "relative size-9 rounded-full"
            )}
            aria-label={cartCount ? `Cart, ${cartCount} items` : "Cart"}
          >
            <ShoppingBag className="size-4" />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            ) : null}
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "size-9 rounded-full"
                )}
                aria-label="Account menu"
              >
                <span className="font-heading text-[11px] font-semibold text-primary">
                  {initialsFromName(user.name)}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <span className="block truncate font-medium text-foreground">
                      {user.name}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/account" />}>
                    My panel
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/learn" />}>
                    My learning
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/account/orders" />}>
                    Orders
                  </DropdownMenuItem>
                  {staff ? (
                    <DropdownMenuItem render={<Link href="/admin" />}>
                      Studio
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <form action={logoutAction} className="p-0.5">
                  <button
                    type="submit"
                    className="flex w-full items-center rounded-md px-1.5 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    Log out
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href={loginHref}
              className={cn(
                buttonVariants({ size: "sm" }),
                "hidden h-9 rounded-full px-4 md:inline-flex"
              )}
            >
              Log in
            </Link>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-full lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-[20rem] p-0">
              <SheetHeader className="border-b px-5 py-5">
                <SheetTitle className="flex items-center gap-2.5">
                  <BrandMark className="size-8 text-primary" />
                  Right Skills
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-3 py-4">
                {user ? (
                  <p className="px-3 pb-2 text-sm text-muted-foreground">
                    {user.name}
                  </p>
                ) : null}
                <form action="/courses" method="get" className="px-3 pb-3 md:hidden">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      name="q"
                      placeholder="Search courses"
                      aria-label="Search courses"
                      className="h-9 w-full rounded-full border bg-background pr-3 pl-9 text-sm outline-none"
                    />
                  </div>
                </form>
                <Link href="/" className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">
                  Home
                </Link>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/account" className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">
                  My panel
                </Link>
                <Link href="/learn" className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">
                  My learning
                </Link>
                {user ? (
                  <Link href="/account/orders" className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">
                    Orders
                  </Link>
                ) : null}
                {staff ? (
                  <Link href="/admin" className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">
                    Studio
                  </Link>
                ) : null}
              </div>
              <div className="mt-auto border-t px-4 py-4">
                {user ? (
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className={cn(buttonVariants({ variant: "outline" }), "h-10 w-full rounded-full")}
                    >
                      Log out
                    </button>
                  </form>
                ) : (
                  <Link
                    href={loginHref}
                    className={cn(buttonVariants(), "h-10 w-full rounded-full")}
                  >
                    Log in
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
