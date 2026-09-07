import { MediaSlider } from "@/components/home/media-slider";
import { Reveal } from "@/components/home/reveal";
import { StarRow } from "@/components/stars";
import { initialsFromName } from "@/lib/slug";
import { listLatestReviews, type PublicReview } from "@/lib/reviews";

export async function Reviews() {
  let live: PublicReview[] = [];
  try {
    live = await listLatestReviews(8);
  } catch {
    live = [];
  }
  if (live.length === 0) return null;
  const items = live;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <Reveal>
        <p className="text-base font-medium tracking-[0.18em] text-primary uppercase">
          Reviews
        </p>
        <h2 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          From students who bought the course
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
                    {item.when}
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
              {item.subtitle ? (
                <p className="mt-3 truncate text-sm text-primary">{item.subtitle}</p>
              ) : null}
            </article>
          ))}
        </MediaSlider>
      </Reveal>
    </section>
  );
}
