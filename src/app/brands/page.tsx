import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { studioBrands } from "@/lib/studio-brands";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Brands we have built",
  description:
    "Identity work from the Right Skills branding desk — packing, apps, hotels, and shops.",
};

export default function BrandsPage() {
  const [featured, ...rest] = studioBrands;

  return (
    <div>
      <section className="border-b bg-[linear-gradient(180deg,oklch(0.98_0.02_70),oklch(0.992_0.006_75))]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:gap-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-16">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase sm:text-base">
              Studio work
            </p>
            <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:mt-3 sm:text-5xl">
              Brands we have built
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-3 sm:text-lg sm:leading-8">
              Identity work from the Right Skills branding desk. The same
              system we teach — packing, screens, rooms, and shops.
            </p>
          </div>
          <Link
            href="/courses/freelance-graphic-upwork"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 w-full shrink-0 px-6 text-base sm:h-12 sm:w-auto"
            )}
          >
            Branding course
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        {featured ? (
          <Link
            href={`/brands/${featured.slug}`}
            className="group grid overflow-hidden rounded-[1.8rem] border bg-card lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[28rem]">
              <img
                src={featured.image}
                alt={featured.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <p className="text-sm tracking-[0.16em] text-primary uppercase">
                {featured.category} · {featured.year}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:mt-3 sm:text-4xl">
                {featured.name}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-lg sm:leading-8">
                {featured.summary}
              </p>
              <div className="mt-6 flex gap-2">
                {featured.colors.map((color) => (
                  <span
                    key={color.hex}
                    className="size-5 rounded-full border border-black/10"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden
                  />
                ))}
              </div>
              <p className="mt-8 text-base font-medium text-primary">
                Read the case
                <ArrowRight className="ml-1 inline size-4" />
              </p>
            </div>
          </Link>
        ) : null}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((work) => (
            <Link
              key={work.slug}
              href={`/brands/${work.slug}`}
              className="group overflow-hidden rounded-3xl border bg-card"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <img
                  src={work.image}
                  alt={work.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(20,12,6,0.72),transparent)] p-5">
                  <p className="text-xs tracking-[0.16em] text-white/70 uppercase">
                    {work.category} · {work.year}
                  </p>
                  <h2 className="mt-1 font-heading text-2xl font-semibold text-white">
                    {work.name}
                  </h2>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <p className="text-base text-muted-foreground">{work.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
