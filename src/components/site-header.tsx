"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, BookOpen } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/learn", label: "My learning" },
];

export function SiteHeader({ cartCount = 0 }: { cartCount?: number }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="size-8 text-primary" />
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">
              Skills Bangladesh
            </span>
            <span className="block text-[11px] text-muted-foreground">
              স্কিল শিখুন, ক্যারিয়ার গড়ুন
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/cart"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "relative hidden sm:inline-flex"
            )}
          >
            <ShoppingBag data-icon="inline-start" />
            Cart
            {cartCount > 0 ? (
              <span className="ml-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/courses"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden sm:inline-flex"
            )}
          >
            Browse courses
          </Link>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                <Link
                  href="/"
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Home
                </Link>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/cart"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  <ShoppingBag className="size-4" />
                  Cart {cartCount > 0 ? `(${cartCount})` : ""}
                </Link>
                <Link
                  href="/learn"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  <BookOpen className="size-4" />
                  Continue learning
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
