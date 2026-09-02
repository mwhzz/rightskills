import Link from "next/link";
import { ArrowRight, Play, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { HomepageLearning } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function ContinueStrip({ learning }: { learning: HomepageLearning }) {
  if (!learning.continueItem && learning.openOrderCount === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
      <div className="grid gap-3 md:grid-cols-2">
        {learning.continueItem ? (
          <Link
            href={learning.continueItem.href}
            className="group flex items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-3.5 shadow-[0_10px_30px_-24px_rgba(80,40,10,0.35)] transition hover:border-primary/40"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Play className="size-4 fill-current" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-[0.14em] text-primary uppercase">
                  Continue learning
                </p>
                <p className="mt-0.5 truncate font-heading text-base font-semibold">
                  {learning.continueItem.title}
                </p>
                <div className="mt-1.5 h-1 w-36 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${learning.continueItem.pct}%` }}
                  />
                </div>
              </div>
            </div>
            <span className="hidden shrink-0 text-sm font-medium text-primary sm:inline">
              {learning.continueItem.pct}%
            </span>
          </Link>
        ) : null}

        {learning.openOrderCount > 0 ? (
          <Link
            href="/account/orders"
            className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3.5 transition hover:border-amber-300"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-900">
                <Wallet className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-[0.14em] text-amber-800 uppercase">
                  Open orders
                </p>
                <p className="mt-0.5 text-sm text-amber-950">
                  {learning.openOrderCount} waiting for TrxID or review
                </p>
              </div>
            </div>
            <span
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "hidden h-8 rounded-full border-amber-300 bg-white sm:inline-flex"
              )}
            >
              Orders
              <ArrowRight data-icon="inline-end" />
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
