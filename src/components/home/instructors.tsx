import Link from "next/link";
import { MediaSlider } from "@/components/home/media-slider";
import { Reveal } from "@/components/home/reveal";
import { instructorSlug } from "@/lib/instructors";

const instructors = [
  {
    name: "Rafiul Hasan",
    title: "Senior frontend engineer",
    photo: "/instructors/rafiul.jpg",
  },
  {
    name: "Nusrat Jahan",
    title: "Brand designer",
    photo: "/instructors/nusrat.jpg",
  },
  {
    name: "Tanvir Ahmed",
    title: "Performance marketer",
    photo: "/instructors/tanvir.jpg",
  },
  {
    name: "Farhana Rahman",
    title: "Corporate trainer",
    photo: "/instructors/farhana.jpg",
  },
  {
    name: "Mahmudul Islam",
    title: "MIS lead",
    photo: "/instructors/mahmudul.jpg",
  },
  {
    name: "Shaila Karim",
    title: "Product designer",
    photo: "/instructors/shaila.jpg",
  },
] as const;

export function Instructors() {
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
            {instructors.map((person) => (
              <Link
                key={person.name}
                href={`/instructors/${instructorSlug(person.name)}`}
                className="flex w-max max-w-[22rem] shrink-0 snap-start items-center gap-3 rounded-full border bg-background py-2 pr-5 pl-2 hover:border-primary/40"
              >
                <img
                  src={person.photo}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-11 shrink-0 rounded-full object-cover"
                />
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
