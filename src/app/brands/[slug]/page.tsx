import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  getStudioBrand,
  nextStudioBrand,
} from "@/lib/studio-brands";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = getStudioBrand(slug);
  if (!work) return { title: "Brand" };
  return {
    title: work.name,
    description: work.summary,
  };
}

const facts = [
  { key: "client", label: "Client" },
  { key: "location", label: "Location" },
  { key: "duration", label: "Duration" },
  { key: "scope", label: "Scope" },
] as const;

export default async function BrandCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getStudioBrand(slug);
  if (!work) notFound();
  const next = nextStudioBrand(slug);

  return (
    <div>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <nav className="text-base text-muted-foreground">
          <Link href="/brands" className="hover:text-foreground">
            Brands
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{work.name}</span>
        </nav>

        <p className="mt-8 text-base font-medium tracking-[0.18em] text-primary uppercase">
          {work.category} · {work.year}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:mt-3 sm:text-6xl">
          {work.name}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:mt-4 sm:text-xl sm:leading-8">
          {work.summary}
        </p>

        <dl className="mt-10 grid gap-6 border-t pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.key}>
              <dt className="text-sm tracking-[0.14em] text-muted-foreground uppercase">
                {fact.label}
              </dt>
              <dd className="mt-2 text-lg leading-7">{work[fact.key]}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[1.8rem] border">
          <img
            src={work.image}
            alt={`${work.name} brand photography`}
            className="aspect-16/9 w-full object-cover"
          />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <section>
          <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
            The brief
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {work.brief}
          </p>
          <ul className="mt-8 grid gap-3">
            {work.problem.map((item) => (
              <li
                key={item}
                className="rounded-2xl border bg-card px-4 py-3 text-base leading-7"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[1.8rem] border bg-card p-6 sm:p-8">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Who it is for
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            {work.audience}
          </p>
        </section>
      </div>

      <div className="border-y bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
            How we worked
          </h2>
          <ol className="mt-10 grid gap-6 lg:grid-cols-3">
            {work.process.map((step, index) => (
              <li key={step.title} className="rounded-3xl border bg-background p-6">
                <p className="text-sm font-medium tracking-[0.16em] text-primary uppercase">
                  0{index + 1}
                </p>
                <h3 className="mt-3 font-heading text-2xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
          Visual system
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {work.colors.map((color) => (
            <div key={color.hex} className="overflow-hidden rounded-3xl border">
              <div
                className="h-36"
                style={{ backgroundColor: color.hex }}
              />
              <div className="p-5">
                <p className="font-heading text-xl font-semibold">{color.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{color.hex}</p>
                <p className="mt-3 text-base leading-7">{color.use}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border bg-card p-6">
            <h3 className="font-heading text-xl font-semibold">Type</h3>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {work.type}
            </p>
          </article>
          <article className="rounded-3xl border bg-card p-6">
            <h3 className="font-heading text-xl font-semibold">Voice</h3>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {work.voice}
            </p>
          </article>
          <article className="rounded-3xl border bg-card p-6">
            <h3 className="font-heading text-xl font-semibold">Photography</h3>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {work.photography}
            </p>
          </article>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6">
          <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
          Where it lives
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {work.applications.map((item, index) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-3xl border bg-card"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <img
                  src={work.image}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition:
                      index === 0
                        ? "20% 40%"
                        : index === 1
                          ? "70% 50%"
                          : "50% 80%",
                  }}
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-8 rounded-[1.8rem] border bg-card p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              What shipped
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {work.deliverables.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border bg-background px-4 py-3 text-base"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              After
            </h2>
            <ul className="mt-6 grid gap-3">
              {work.outcomes.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border bg-background px-4 py-3 text-base leading-7"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <blockquote className="mt-8 rounded-[1.8rem] border bg-[linear-gradient(180deg,oklch(0.98_0.02_70),oklch(0.992_0.006_75))] px-6 py-10 sm:px-10">
          <p className="font-heading text-2xl leading-9 font-medium tracking-tight sm:text-3xl sm:leading-11">
            “{work.quote.text}”
          </p>
          <footer className="mt-6 text-base text-muted-foreground">
            {work.quote.name}, {work.quote.role}
          </footer>
        </blockquote>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All brands
          </Link>
          {next ? (
            <Link
              href={`/brands/${next.slug}`}
              className="inline-flex items-center gap-2 text-base font-medium hover:text-primary"
            >
              Next: {next.name}
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>

      <section className="border-t bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              Want to build work like this?
            </h2>
            <p className="mt-2 max-w-xl text-lg text-muted-foreground">
              The Freelance Graphic Design course is the same system behind
              these identities.
            </p>
          </div>
          <Link
            href="/courses/freelance-graphic-upwork"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 shrink-0 px-6 text-base"
            )}
          >
            Branding course
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
      </section>
    </div>
  );
}
