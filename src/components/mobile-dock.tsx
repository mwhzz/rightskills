"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function hideDock(pathname: string) {
  if (pathname.startsWith("/learn")) return true;
  if (pathname.startsWith("/account")) return true;
  if (pathname.startsWith("/checkout")) return true;
  if (pathname === "/cart") return true;
  if (pathname === "/login" || pathname === "/register") return true;
  if (pathname.startsWith("/courses/") && pathname !== "/courses") return true;
  return false;
}

export function MobileDock({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 180);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (hideDock(pathname)) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur-md transition-transform duration-300 md:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <Link
        href={href}
        className={cn(buttonVariants(), "h-11 w-full rounded-full")}
      >
        {label}
      </Link>
    </div>
  );
}
