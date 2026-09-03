import { MediaSlider } from "@/components/home/media-slider";
import { Reveal } from "@/components/home/reveal";
import { StarRow } from "@/components/stars";
import { initialsFromName } from "@/lib/slug";
import { listLatestReviews, type PublicReview } from "@/lib/reviews";

const fallback: PublicReview[] = [
  {
    name: "Sadia Rahman",
    initials: "SR",
    subtitle: "Junior web developer",
    photo: "/reviews/sadia.jpg",
    rating: 5,
    when: "",
    quote:
      "I rebuilt a real clinic page the week I finished. They paid ৳22,000 and asked for a second page.",
  },
  {
    name: "Mehedi Hasan",
    initials: "MH",
    subtitle: "Freelance designer",
    photo: "/reviews/mehedi.jpg",
    rating: 5,
    when: "",
    quote:
      "The proposal is blunt: three directions, one price. First reply after that paid $90.",
  },
  {
    name: "Nusrat Alam",
    initials: "NA",
    subtitle: "MIS officer",
    photo: "/reviews/nusrat.jpg",
    rating: 5,
    when: "",
    quote:
      "Sunday reporting used to eat my morning. My manager forwarded the new sheet to two floors.",
  },
  {
    name: "Farhan Kabir",
    initials: "FK",
    subtitle: "Brand designer",
    photo: "/reviews/farhan.jpg",
    rating: 5,
    when: "",
    quote:
      "We shipped a wordmark, two colours, and packing tape. That case study got me two retainers.",
  },
];

export async function Reviews() {
  let live: PublicReview[] = [];
  try {
    live = await listLatestReviews(8);
  } catch {
    /* keep the studio quotes if the database is down */
  }
  const items = live.length > 0 ? live : fallback;
  const fromStudents = live.length > 0;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <Reveal>
        <p className="text-base font-medium tracking-[0.18em] text-primary uppercase">
          Reviews
        </p>
        <h2 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {fromStudents
            ? "From students who bought the course"
            : "From people who finished the work"}
        </h2>
      </Reveal>

      <Reveal className="mt-8">
        <MediaSlider>
          {items.map((item) => (
            <article
              key={`${item.name}-${item.quote.slice(0, 24)}`}
              className="w-[min(100%,22rem)] shrink-0 snap-start rounded-2xl border bg-card p-5 sm:w-[24rem]"
            >
              <div className="flex items-center gap-3">
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="size-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                    {item.initials || initialsFromName(item.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {fromStudents ? item.when : item.subtitle}
                  </p>
                </div>
                <StarRow
                  rating={item.rating}
                  starClassName="size-3.5"
                  className="ml-auto shrink-0"
                />
              </div>
              <blockquote className="mt-4 line-clamp-3 text-base leading-7">
                “{item.quote}”
              </blockquote>
              {fromStudents && item.subtitle ? (
                <p className="mt-3 truncate text-sm text-primary">{item.subtitle}</p>
              ) : null}
            </article>
          ))}
        </MediaSlider>
      </Reveal>
    </section>
  );
}
