import { formatStudents } from "@/lib/format";
import { initialsFromName } from "@/lib/slug";
import { StarRow } from "@/components/stars";
import type { PublicReview } from "@/lib/reviews";

const quotes: PublicReview[] = [
  {
    name: "Sadia Rahman",
    initials: "SR",
    subtitle: "Junior web developer, Banani",
    photo: "/reviews/sadia.jpg",
    rating: 5,
    when: "3 weeks ago",
    quote:
      "Clear, paced, and actually useful. I shipped client work the same week I finished the project lessons — not another tutorial clone.",
  },
  {
    name: "Mehedi Hasan",
    initials: "MH",
    subtitle: "Freelance designer, Chattogram",
    photo: "/reviews/mehedi.jpg",
    rating: 5,
    when: "1 month ago",
    quote:
      "The structure is honest. Short videos, a real brief, and a way to price the work. I stopped undercharging after the proposal lesson.",
  },
  {
    name: "Nusrat Alam",
    initials: "NA",
    subtitle: "MIS officer, Gazipur",
    photo: "/reviews/nusrat.jpg",
    rating: 4,
    when: "5 days ago",
    quote:
      "I watch on my phone after office. The lessons are short enough to finish, and the practice matches what my desk actually asks for.",
  },
];

function ratingBars(rating: number) {
  const five = Math.min(92, Math.max(55, Math.round((rating - 3.8) * 50 + 58)));
  const four = Math.round((100 - five) * 0.55);
  const three = Math.round((100 - five - four) * 0.6);
  const two = Math.max(1, Math.round((100 - five - four - three) * 0.45));
  const one = Math.max(1, 100 - five - four - three - two);
  return [
    { star: 5, pct: five },
    { star: 4, pct: four },
    { star: 3, pct: three },
    { star: 2, pct: two },
    { star: 1, pct: one },
  ];
}

function barsFromReviews(reviews: PublicReview[]) {
  const total = reviews.length;
  if (total === 0) return ratingBars(0);
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: Math.round(
      (reviews.filter((item) => item.rating === star).length / total) * 100
    ),
  }));
}

export function CourseReviews({
  rating,
  reviewCount,
  reviews,
}: {
  rating: number;
  reviewCount: number;
  reviews?: PublicReview[];
}) {
  const live = reviews && reviews.length > 0;
  const items = live ? reviews : quotes;
  const bars = live ? barsFromReviews(reviews) : ratingBars(rating);
  const shownRating = live
    ? Math.round(
        (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length) *
          10
      ) / 10
    : rating;
  const shownCount = live ? reviews.length : reviewCount;

  return (
    <section id="reviews" className="scroll-mt-28">
      <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-4xl">
        Student reviews
      </h2>
      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <div>
          <p className="font-heading text-6xl font-semibold tracking-tight">
            {shownCount ? shownRating.toFixed(1) : "—"}
          </p>
          <StarRow rating={shownRating} starClassName="size-5" className="mt-2" />
          <p className="mt-2 text-base text-muted-foreground">
            {shownCount ? `${formatStudents(shownCount)} ratings` : "No ratings yet"}
          </p>
        </div>
        <div className="space-y-2.5">
          {bars.map((bar) => (
            <div key={bar.star} className="flex items-center gap-3">
              <span className="w-12 text-sm text-muted-foreground">
                {bar.star} star
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${shownCount ? bar.pct : 0}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm text-muted-foreground">
                {shownCount ? `${bar.pct}%` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <article key={`${item.name}-${item.when}`} className="flex flex-col rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              {item.photo ? (
                <img
                  src={item.photo}
                  alt={item.name}
                  className="size-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                  {item.initials || initialsFromName(item.name)}
                </div>
              )}
              <div>
                <p className="text-base font-semibold">{item.name}</p>
                {item.subtitle ? (
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                ) : null}
              </div>
            </div>
            <StarRow rating={item.rating} className="mt-4" />
            <blockquote className="mt-3 flex-1 text-base leading-7">
              “{item.quote}”
            </blockquote>
            <p className="mt-4 text-sm text-muted-foreground">{item.when}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
