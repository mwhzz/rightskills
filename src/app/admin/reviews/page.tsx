import Link from "next/link";
import { StarRow } from "@/components/stars";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatWhen } from "@/lib/format";

export default async function AdminReviewsPage() {
  const user = await requireRole("admin", "teacher");
  const reviews = await prisma.courseReview.findMany({
    where:
      user.role === "teacher"
        ? { course: { teacherId: user.id } }
        : undefined,
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const avg =
    reviews.length === 0
      ? 0
      : Math.round(
          (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length) *
            10
        ) / 10;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Reviews</h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        {user.role === "teacher"
          ? "What students wrote after finishing your courses."
          : "Ratings across the catalogue. Students leave these from My learning."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Reviews</p>
          <p className="mt-2 font-heading text-3xl font-semibold">{reviews.length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Average rating</p>
          <p className="mt-2 font-heading text-3xl font-semibold">
            {reviews.length ? avg.toFixed(1) : "—"}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-8 rounded-2xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          No reviews yet. They appear here after a student rates a course they
          own.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{review.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {review.course.title} · {formatWhen(review.createdAt)}
                  </p>
                </div>
                <StarRow rating={review.rating} />
              </div>
              <p className="mt-3 text-base leading-7">{review.body}</p>
              <Link
                href={`/admin/courses/${review.course.id}`}
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                Open course
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
