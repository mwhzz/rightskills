import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { BackgroundVideo } from "@/components/home/background-video";
import { BrandPortfolio } from "@/components/home/brand-portfolio";
import { ContinueStrip } from "@/components/home/continue-strip";
import { CourseRail } from "@/components/home/course-rail";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeVideo } from "@/components/home/home-video";
import { HowItWorks } from "@/components/home/how-it-works";
import { Instructors } from "@/components/home/instructors";
import { OfferBanner } from "@/components/home/offer-banner";
import { PaymentPills } from "@/components/home/payment-pills";
import { Reveal } from "@/components/home/reveal";
import { Reviews } from "@/components/home/reviews";
import { SkillStrip } from "@/components/home/skill-strip";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { courses as fallbackCourses, getFeaturedCourses } from "@/lib/courses";
import { formatStudents } from "@/lib/format";
import {
  getHomeBanners,
  getHomeStats,
  getHomepageLearning,
  listFeaturedCourses,
  listNewestCourses,
  listPopularCourses,
  type HomeStats,
} from "@/lib/queries";
import { defaultHomeBanners } from "@/lib/home-banners";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function loadHome() {
  try {
    const [featured, newest, popular, banners, stats] = await Promise.all([
      listFeaturedCourses(3),
      listNewestCourses(3),
      listPopularCourses(3),
      getHomeBanners(),
      getHomeStats(),
    ]);
    return { featured, newest, popular, banners, stats };
  } catch {
    const featured = getFeaturedCourses().slice(0, 3);
    const newest = fallbackCourses.slice(0, 3);
    const popular = [...fallbackCourses]
      .sort((a, b) => b.students - a.students)
      .slice(0, 3);
    const stats: HomeStats = {
      students: 0,
      courses: fallbackCourses.length,
      rating: null,
    };
    return { featured, newest, popular, banners: defaultHomeBanners, stats };
  }
}

export default async function HomePage() {
  const session = await getSession();
  const [{ featured, newest, popular, banners, stats }, learning] =
    await Promise.all([
      loadHome(),
      session ? getHomepageLearning(session.id).catch(() => null) : null,
    ]);

  const ownedSlugs = learning?.ownedSlugs;
  const progressBySlug = learning?.progressBySlug;
  const statItems = [
    { value: formatStudents(stats.students), label: "Students" },
    {
      value: stats.rating != null ? stats.rating.toFixed(1) : "New",
      label: "Avg. rating",
    },
    { value: String(stats.courses), label: "Courses" },
  ];

  return (
    <div className="overflow-x-hidden">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fffaf5_0%,#fff7f0_45%,#fffaf5_100%)]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 right-[-12%] h-64 w-64 rounded-full bg-primary/18 blur-3xl animate-rs-glow sm:h-80 sm:w-80" />
          <div className="absolute -bottom-20 left-[-10%] h-52 w-52 rounded-full bg-primary/10 blur-3xl animate-rs-float" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl pt-5 pb-6 sm:px-6 sm:pt-8 sm:pb-8 lg:pt-10 lg:pb-10">
          <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-0 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
            <div className="order-1 min-w-0 -mx-4 sm:mx-0 lg:order-2">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-4 -z-10 hidden rounded-3xl bg-primary/12 blur-2xl animate-rs-glow sm:block"
                />
                <HomeVideo
                  src={brand.heroVideo}
                  label="Student learning at a desk"
                  className="aspect-16/10 rounded-none border-y border-white/60 sm:rounded-2xl sm:border sm:shadow-[0_18px_50px_-24px_rgba(180,70,20,0.35)]"
                  overlay={
                    <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
                      <div className="rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-white backdrop-blur-md sm:py-2.5">
                        <p className="text-[10px] tracking-[0.16em] text-white/70 uppercase">
                          Now playing
                        </p>
                        <p className="mt-0.5 text-xs font-medium sm:text-sm">
                          Lesson 03 · Building a clean layout
                        </p>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20">
                          <div className="h-full rounded-full bg-primary animate-rs-progress" />
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>

            <div className="order-2 min-w-0 animate-rs-fade-up lg:order-1">
              <p className="text-[11px] font-medium tracking-[0.18em] text-primary uppercase sm:text-sm">
                {brand.name}
              </p>
              <h1 className="mt-2 font-heading text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-pretty sm:mt-3 sm:text-5xl lg:text-[3.35rem]">
                Skills, taught{" "}
                <span className="text-primary">with care.</span>
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-pretty text-muted-foreground sm:mt-4 sm:text-lg sm:leading-7">
                Cinematic lessons. Short paths. Pay by bKash or Nagad — access
                unlocks after your TrxID is confirmed.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-2.5">
                <Link
                  href="/courses"
                  className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full px-5 sm:h-10 sm:w-auto")}
                >
                  Browse courses
                  <ArrowRight data-icon="inline-end" />
                </Link>
                <Link
                  href={session ? "/account" : "#how-it-works"}
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "h-11 w-full rounded-full bg-background/70 px-5 backdrop-blur-sm sm:h-10 sm:w-auto"
                  )}
                >
                  <Play data-icon="inline-start" className="size-3.5 fill-current" />
                  {session ? "My panel" : "How it works"}
                </Link>
              </div>
              <dl className="mt-5 grid max-w-md grid-cols-3 gap-2 sm:mt-7 sm:gap-3">
                {statItems.map((stat) => (
                  <div key={stat.label} className="min-w-0 rounded-xl bg-background/60 px-2 py-2 sm:bg-transparent sm:px-0 sm:py-0">
                    <dt className="text-[10px] text-muted-foreground sm:text-xs">{stat.label}</dt>
                    <dd className="mt-0.5 font-heading text-lg font-semibold tracking-tight sm:text-2xl">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-6">
            <PaymentPills />
          </div>
          <div className="mt-5">
            <OfferBanner banners={banners} />
          </div>
        </div>
      </section>

      <SkillStrip />

      {learning ? <ContinueStrip learning={learning} /> : null}

      <section className="mx-auto w-full max-w-7xl space-y-10 overflow-x-clip px-4 py-8 sm:space-y-12 sm:px-6 sm:py-12 lg:py-16">
        <CourseRail
          title="Featured"
          description="The ones learners finish — then use on a job."
          href="/courses"
          courses={featured}
          ownedSlugs={ownedSlugs}
          progressBySlug={progressBySlug}
        />
        <CourseRail
          title="New"
          description="Just published. Start at the beginning."
          href="/courses"
          courses={newest}
          ownedSlugs={ownedSlugs}
          progressBySlug={progressBySlug}
        />
        <CourseRail
          title="Popular"
          description="What people are taking right now."
          href="/courses"
          courses={popular}
          ownedSlugs={ownedSlugs}
          progressBySlug={progressBySlug}
        />
      </section>

      <HowItWorks />

      <BrandPortfolio />

      <Instructors />

      <Reviews />

      <HomeFaq />

      <section className="px-4 pb-16 sm:px-6">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.6rem] border">
            <BackgroundVideo
              src={brand.ctaBackground}
              label="Hands writing in a notebook"
              wash="dark"
            />
            <div className="relative px-6 py-12 sm:px-12 sm:py-16">
              <div className="max-w-2xl text-white">
                <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-4xl">
                  {session
                    ? "Pick up where you left off."
                    : "Start with one course. Finish it."}
                </h2>
                <p className="mt-3 text-base leading-7 text-white/80">
                  {session
                    ? "Your library is in My learning. Open orders stay on the orders page until an admin confirms the TrxID."
                    : "Browse the catalogue, send the payment, paste the TrxID. Access unlocks after confirmation."}
                </p>
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <Link
                    href={session ? "/account" : "/courses"}
                    className={cn(buttonVariants({ size: "lg" }), "h-10 rounded-full px-5")}
                  >
                    {session ? "My panel" : "Explore courses"}
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                  {session ? (
                    <Link
                      href="/account/orders"
                      className={cn(
                        buttonVariants({ size: "lg", variant: "outline" }),
                        "h-10 rounded-full border-white/25 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white"
                      )}
                    >
                      Orders
                    </Link>
                  ) : (
                    <Link
                      href="/register"
                      className={cn(
                        buttonVariants({ size: "lg", variant: "outline" }),
                        "h-10 rounded-full border-white/25 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white"
                      )}
                    >
                      Create an account
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
