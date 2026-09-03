import Link from "next/link";
import { BrandShowcase } from "@/components/home/brand-showcase";
import { studioBrands } from "@/lib/studio-brands";

export function BrandPortfolio() {
  return (
    <section id="brands" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
            Studio work
          </p>
          <h2 className="mt-2 font-heading text-xl font-semibold tracking-tight sm:text-4xl">
            Brands we have built
          </h2>
        </div>
        <Link
          href="/brands"
          className="text-sm font-medium text-primary hover:underline"
        >
          See all work
        </Link>
      </div>
      <div className="mt-6">
        <BrandShowcase brands={studioBrands} />
      </div>
    </section>
  );
}
