import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Languages,
  Star,
  Users,
} from "lucide-react";
import { CourseCard } from "@/components/course-card";
import { buttonVariants } from "@/components/ui/button";
import { categories, getFeaturedCourses } from "@/lib/courses";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Learners", value: "48,000+", icon: Users },
  { label: "Avg rating", value: "4.7", icon: Star },
  { label: "Priced in", value: "BDT", icon: Banknote },
];

const reasons = [
  {
    title: "Taught for this market",
    body: "Examples from Dhaka shops, Upwork gigs, RMG offices, and NGO interviews — not recycled US bootcamp slides.",
    icon: BadgeCheck,
  },
  {
    title: "Bangla + English",
    body: "Learn in Bangla when it helps, keep the English terms recruiters and overseas clients actually use.",
    icon: Languages,
  },
  {
    title: "Pay the way you already pay",
    body: "Checkout with bKash, Nagad, or card. This preview is a demo — no real charge, access still unlocks.",
    icon: Banknote,
  },
];

const quotes = [
  {
    name: "Sadia Rahman",
    role: "Junior web developer, Banani",
    quote:
      "I pitched a ৳25k brochure site the week I finished the Next.js course. The client still uses the same contact form.",
  },
  {
    name: "Mehedi Hasan",
    role: "Upwork designer, Chattogram",
    quote:
      "The proposal template stopped me undercharging. First logo job after the course was $80 instead of $15.",
  },
  {
    name: "Nusrat Alam",
    role: "MIS officer, Gazipur",
    quote:
      "Sunday reporting used to eat my morning. The Excel track is the one my whole merchandising desk now copies.",
  },
];

export default function HomePage() {
  const featured = getFeaturedCourses();

  return (
    <div>
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.72_0.12_158_/_0.18),transparent_50%),radial-gradient(ellipse_at_bottom_left,oklch(0.7_0.12_85_/_0.12),transparent_45%)]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="text-sm font-medium text-primary">
              স্কিলস বাংলাদেশ
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
              Skill sikhun.
              <br />
              Career goro — from Bangladesh.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Job-ready courses in web, design, English, Excel, and freelance.
              Prices in taka. Lessons built for local work, not generic
              certificates.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
              >
                Browse courses
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href="/learn"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-11 px-5"
                )}
              >
                My learning
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                    <stat.icon className="size-3.5" />
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Popular this week
            </p>
            <ul className="mt-4 space-y-3">
              {featured.slice(0, 4).map((course) => (
                <li key={course.slug}>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="flex items-start justify-between gap-3 rounded-xl border px-3 py-3 hover:bg-muted/50"
                  >
                    <span>
                      <span className="block text-sm font-semibold">
                        {course.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {course.banglaTitle}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold">
                      ৳{course.priceBdt.toLocaleString("en-BD")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Pick a path
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Six categories. Start with the work you want next month.
            </p>
          </div>
          <Link
            href="/courses"
            className="hidden text-sm font-medium text-primary hover:underline sm:inline"
          >
            All courses
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/courses?category=${category.id}`}
              className="rounded-xl border bg-card px-3 py-4 text-center hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="block text-sm font-semibold">
                {category.label}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {category.bangla}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Featured courses
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The ones learners finish — and then use on a job.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason.title} className="rounded-xl border bg-background p-5">
              <reason.icon className="size-5 text-primary" />
              <h3 className="mt-3 font-heading font-semibold">{reason.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {reason.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold">
          From learners across the country
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {quotes.map((item) => (
            <figure key={item.name} className="rounded-xl border bg-card p-5">
              <blockquote className="text-sm leading-6">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold">{item.name}</span>
                <span className="block text-muted-foreground">{item.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
