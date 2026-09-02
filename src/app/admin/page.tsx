import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBdt, formatWhen } from "@/lib/format";
import { OrderStatusBadge } from "@/components/order-status";
import { StarRow } from "@/components/stars";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminHomePage() {
  const user = await requireRole("admin", "teacher");
  const isAdmin = user.role === "admin";
  const courseWhere = user.role === "teacher" ? { teacherId: user.id } : undefined;
  const reviewWhere =
    user.role === "teacher" ? { course: { teacherId: user.id } } : undefined;
  const enrollWhere =
    user.role === "teacher" ? { course: { teacherId: user.id } } : undefined;

  const [
    pending,
    paidCount,
    courseCount,
    studentCount,
    enrollmentCount,
    reviewAgg,
    recentCourses,
    recentOrders,
    recentStudents,
    recentReviews,
  ] = await Promise.all([
    isAdmin
      ? prisma.order.count({ where: { status: "awaiting_review" } })
      : Promise.resolve(0),
    isAdmin ? prisma.order.count({ where: { status: "paid" } }) : Promise.resolve(0),
    prisma.course.count({ where: courseWhere }),
    isAdmin ? prisma.user.count({ where: { role: "student" } }) : Promise.resolve(0),
    prisma.enrollment.count({ where: enrollWhere }),
    prisma.courseReview.aggregate({
      where: reviewWhere,
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.course.findMany({
      where: courseWhere,
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        published: true,
        priceBdt: true,
        rating: true,
        reviewCount: true,
        _count: { select: { enrollments: true } },
      },
    }),
    isAdmin
      ? prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          take: 6,
          include: { user: true, items: { include: { course: true } } },
        })
      : Promise.resolve([]),
    prisma.enrollment.findMany({
      where: enrollWhere,
      include: { user: true, course: { select: { title: true, id: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.courseReview.findMany({
      where: reviewWhere,
      include: { user: true, course: { select: { title: true, id: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const avgRating = reviewAgg._avg.rating
    ? Math.round(reviewAgg._avg.rating * 10) / 10
    : 0;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-base text-muted-foreground">
        {isAdmin
          ? "Approve payments, watch the catalogue, and read student reviews."
          : "Your courses, students, and reviews in one place."}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin ? (
          <>
            <Stat label="TrxID to review" value={pending} />
            <Stat label="Paid orders" value={paidCount} />
            <Stat label="Students" value={studentCount} />
            <Stat label="Courses" value={courseCount} />
          </>
        ) : (
          <>
            <Stat label="Courses" value={courseCount} />
            <Stat label="Enrollments" value={enrollmentCount} />
            <Stat label="Reviews" value={reviewAgg._count._all} />
            <Stat
              label="Average rating"
              value={reviewAgg._count._all ? avgRating.toFixed(1) : "—"}
            />
          </>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/courses" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
          Course manager
        </Link>
        <Link
          href="/admin/reviews"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
        >
          Reviews
        </Link>
        <Link
          href="/admin/students"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
        >
          Students
        </Link>
        {isAdmin ? (
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
          >
            Review orders
          </Link>
        ) : (
          <Link
            href="/admin/courses/new"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
          >
            New course
          </Link>
        )}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold">Courses</h2>
            <Link href="/admin/courses" className="text-sm font-medium text-primary hover:underline">
              All courses
            </Link>
          </div>
          {recentCourses.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No courses yet.</p>
          ) : (
            <ul className="mt-4 divide-y">
              {recentCourses.map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm hover:text-primary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{course.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {course._count.enrollments} students · {course.reviewCount} reviews
                        {course.reviewCount ? ` · ${course.rating.toFixed(1)}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {course.published ? "Published" : "Draft"} · {formatBdt(course.priceBdt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isAdmin ? (
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-xl font-semibold">Recent orders</h2>
              <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
                All orders
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="mt-4 divide-y">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="font-medium">{order.user.name}</span>
                      <span className="mt-0.5 block truncate text-muted-foreground">
                        {order.items.map((item) => item.course.title).join(", ")}
                      </span>
                    </span>
                    <span className="shrink-0">
                      <OrderStatusBadge status={order.status} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-xl font-semibold">Recent students</h2>
              <Link href="/admin/students" className="text-sm font-medium text-primary hover:underline">
                All students
              </Link>
            </div>
            {recentStudents.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Students appear here after an order is marked paid.
              </p>
            ) : (
              <ul className="mt-4 divide-y">
                {recentStudents.map((row) => (
                  <li key={row.id} className="py-3 text-sm">
                    <p className="font-medium">{row.user.name}</p>
                    <p className="text-muted-foreground">
                      {row.course.title} · {formatWhen(row.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      <section className="mt-6 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">Recent reviews</h2>
          <Link href="/admin/reviews" className="text-sm font-medium text-primary hover:underline">
            All reviews
          </Link>
        </div>
        {recentReviews.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No reviews yet. Students leave them from My learning after they own
            a course.
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {recentReviews.map((review) => (
              <li key={review.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{review.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {review.course.title} · {formatWhen(review.createdAt)}
                    </p>
                  </div>
                  <StarRow rating={review.rating} />
                </div>
                <p className="mt-2 text-sm leading-6">{review.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
