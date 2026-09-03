import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const topics = ["Development", "Design", "English", "Career"] as const;

function ChalkDoodles() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 640 420"
      className="absolute inset-0 h-full w-full opacity-[0.22]"
      preserveAspectRatio="xMidYMid slice"
    >
      <g
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      >
        <circle cx="430" cy="70" r="22" />
        <path d="M430 92v18M421 78h18" />
        <path d="M520 48c18 8 28 28 18 46-8 14-28 18-40 8" />
        <path d="M360 160h70l8 54H352z" />
        <path d="M368 160c8-16 46-16 54 0" />
        <path d="M580 130v40M560 150h40" />
        <rect x="500" y="250" width="54" height="38" rx="4" />
        <circle cx="527" cy="269" r="8" />
        <path d="M300 70c40 10 70 48 58 90" />
        <path d="M250 300h90M250 318h62" />
      </g>
      <g
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="22"
        letterSpacing="0.12em"
      >
        <text x="300" y="58" transform="rotate(-8 300 58)">
          YES
        </text>
        <text x="470" y="200" transform="rotate(12 470 200)">
          layout
        </text>
        <text x="310" y="250" transform="rotate(-6 310 250)">
          speak
        </text>
        <text x="540" y="88" fontSize="16">
          build
        </text>
      </g>
    </svg>
  );
}

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(118deg,#5c2410_0%,#8a3414_38%,#3f1a0c_72%,#2a1208_100%)]">
      <Link
        href="/register"
        className="absolute top-1/2 left-0 z-20 hidden -translate-y-1/2 rounded-r-md bg-[#F4C430] px-2 py-3 text-[11px] font-bold tracking-[0.18em] text-zinc-900 uppercase [writing-mode:vertical-rl] rotate-180 sm:block"
      >
        Enroll now
      </Link>

      <div className="relative mx-auto grid min-h-[16.5rem] w-full max-w-7xl sm:min-h-[18rem] lg:min-h-[20rem] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
          <h1 className="font-heading text-[2.15rem] font-semibold leading-[0.95] tracking-tight text-white uppercase sm:text-5xl lg:text-[3.4rem]">
            Learn skills
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/85 sm:text-base">
            Your journey to work you can actually use starts here
          </p>
          <p className="mt-4 text-[11px] font-medium tracking-[0.06em] text-white/70 uppercase sm:text-xs">
            {topics.join("  |  ")}
          </p>
          <Link
            href="/courses"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-5 h-10 w-fit rounded-full px-5"
            )}
          >
            Browse courses
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>

        <div className="relative hidden min-h-[16.5rem] overflow-hidden sm:block lg:min-h-[20rem]">
          <ChalkDoodles />
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-24 bg-[linear-gradient(to_right,#5c2410,transparent)]"
          />
          <img
            src="/instructors/shaila.jpg"
            alt=""
            className="absolute right-2 bottom-0 h-[108%] w-[78%] object-cover object-[center_12%] drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)] lg:right-6"
          />
        </div>
      </div>
    </section>
  );
}
