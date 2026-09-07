import Link from "next/link";
import { MediaSlider } from "@/components/home/media-slider";
import { Reveal } from "@/components/home/reveal";
import type { InstructorProfile } from "@/lib/instructors";

export function Instructors({ people }: { people: InstructorProfile[] }) {
  if (people.length === 0) return null;

  return (
    <section id="instructors" className="border-y bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-base font-medium tracking-[0.18em] text-primary uppercase">
                Instructors
              </p>
              <h2 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                Taught by people who still do the work
              </h2>
            </div>
            <Link
              href="/instructors"
              className="text-base font-medium text-primary hover:underline"
            >
              All instructors
            </Link>
          </div>
        </Reveal>

        <Reveal className="mt-8">
          <MediaSlider>
            {people.map((person) => (
              <Link
                key={person.slug}
                href={`/instructors/${person.slug}`}
                className="flex w-max max-w-[22rem] shrink-0 snap-start items-center gap-3 rounded-full border bg-background py-2 pr-5 pl-2 hover:border-primary/40"
              >
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
                    {person.initials.slice(0, 2)}
                  </span>
                )}
                <span className="truncate text-base">
                  <span className="font-semibold">{person.name}</span>
                  <span className="text-muted-foreground"> · {person.title}</span>
                </span>
              </Link>
            ))}
          </MediaSlider>
        </Reveal>
      </div>
    </section>
  );
}
