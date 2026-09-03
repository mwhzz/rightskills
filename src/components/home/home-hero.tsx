import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const topics = ["Development", "Design", "English", "Career"] as const;

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fffaf5_0%,#fff6ee_55%,#fffaf5_100%)]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[-8%] h-64 w-64 rounded-full bg-primary/16 blur-3xl animate-rs-glow" />
        <div className="absolute top-8 right-[-12%] h-72 w-72 rounded-full bg-primary/12 blur-3xl animate-rs-float" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-4 py-6 sm:px-6 sm:py-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-8">
        <div className="animate-rs-fade-up">
          <p className="text-[11px] font-medium tracking-[0.2em] text-primary uppercase">
            Right Skills
          </p>
          <h1 className="mt-2 font-heading text-[2rem] font-semibold leading-[1.05] tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
            Learn skills
            <span className="text-primary"> you can use.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
            Short paths. Cinematic lessons. Pay by bKash or Nagad — access
            unlocks after your TrxID is confirmed.
          </p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {topics.map((topic) => (
              <li
                key={topic}
                className="rounded-full border border-border/80 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm"
              >
                {topic}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/courses"
              className={cn(buttonVariants({ size: "lg" }), "h-10 rounded-full px-5")}
            >
              Browse courses
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-10 rounded-full bg-background/70 px-5 backdrop-blur-sm"
              )}
            >
              Enroll now
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-rs-fade-up [animation-delay:120ms] lg:max-w-none">
          <div
            aria-hidden
            className="absolute -inset-3 rounded-[2rem] bg-primary/15 blur-2xl animate-rs-glow"
          />
          <div className="relative overflow-hidden rounded-[1.6rem] border border-white/70 shadow-[0_22px_60px_-32px_rgba(120,50,20,0.45)]">
            <img
              src="/instructors/shaila.jpg"
              alt="Student in a learning space"
              className="aspect-[16/10] h-[13.5rem] w-full object-cover object-[center_18%] sm:h-[15.5rem] lg:h-[17.25rem]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(90deg,rgb(255_250_245/.28)_0%,transparent_38%,transparent_100%)]"
            />
            <p className="absolute bottom-3 left-3 rounded-full border border-white/40 bg-background/85 px-3 py-1 text-[11px] font-medium text-foreground backdrop-blur-md">
              Access after TrxID
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
