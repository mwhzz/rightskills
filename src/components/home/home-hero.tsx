import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const topics = ["Development", "Design", "English", "Career"] as const;

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#2a140c]">
      <img
        src="/instructors/shaila.jpg"
        alt=""
        className="absolute inset-y-0 right-0 h-full w-full object-cover object-[center_18%] sm:w-[62%] sm:object-[center_12%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,#1f0e08_0%,#2a140c_28%,rgb(42_20_12/.72)_48%,rgb(42_20_12/.18)_72%,transparent_100%)] max-sm:bg-[linear-gradient(180deg,#1f0e08_0%,rgb(31_14_8/.78)_42%,rgb(31_14_8/.35)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-[-40%] h-[140%] w-[55%] rounded-full bg-primary/25 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[16.5rem] w-full max-w-7xl items-center px-4 py-7 sm:min-h-[18rem] sm:px-6 lg:min-h-[19.5rem] lg:py-8">
        <div className="max-w-xl">
          <h1 className="font-heading text-[2.15rem] font-semibold leading-[1.02] tracking-tight text-white sm:text-4xl lg:text-[2.85rem]">
            Learn skills you can use.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/75 sm:text-base">
            Short paths. Pay by bKash or Nagad — access unlocks after your TrxID
            is confirmed.
          </p>
          <p className="mt-4 text-[11px] font-medium tracking-[0.14em] text-white/55 uppercase">
            {topics.join(" · ")}
          </p>
          <Link
            href="/courses"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-5 h-10 rounded-full px-5"
            )}
          >
            Browse courses
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </div>
    </section>
  );
}
