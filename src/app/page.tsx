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
      <section className="relative overflow-hidden">
        <BackgroundVideo
          src={brand.heroBackground}
          label="Learner working on a laptop"
          wash="light"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 right-[-12%] h-64 w-64 rounded-full bg-primary/18 blur-3xl animate-rs-glow sm:h-80 sm:w-80" />
          <div className="absolute -bottom-20 left-[-10%] h-52 w-52 rounded-full bg-primary/10 blur-3xl animate-rs-float" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-8 pb-8 sm:px-6 lg:pt-10 lg:pb-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="animate-rs-fade-up">
              <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
                {brand.name}
              </p>
              <h1 className="mt-3 font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.35rem]">
                Skills, taught{" "}
                <span className="text-primary">with care.</span>
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
                Cinematic lessons. Short paths. Pay by bKash or Nagad — access
                unlocks after your TrxID is confirmed.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link
                  href="/courses"
                  className={cn(buttonVariants({ size: "lg" }), "h-10 rounded-full px-5")}
                >
                  Browse courses
                  <ArrowRight data-icon="inline-end" />
                </Link>
                <Link
                  href={session ? "/account" : "#how-it-works"}
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "h-10 rounded-full bg-background/70 px-5 backdrop-blur-sm"
                  )}
                >
                  <Play data-icon="inline-start" className="size-3.5 fill-current" />
                  {session ? "My panel" : "How it works"}
                </Link>
              </div>
              <dl className="mt-7 grid max-w-md grid-cols-3 gap-3">
                {statItems.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                    <dd className="mt-0.5 font-heading text-2xl font-semibold tracking-tight">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="animate-rs-fade-up [animation-delay:140ms]">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-4 -z-10 rounded-3xl bg-primary/12 blur-2xl animate-rs-glow"
                />
                <HomeVideo
                  src={brand.heroVideo}
                  label="Student learning at a desk"
                  className="aspect-16/10 rounded-2xl border border-white/60 shadow-[0_18px_50px_-24px_rgba(180,70,20,0.35)]"
                  overlay={
                    <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
                      <div className="rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-white backdrop-blur-md">
                        <p className="text-[10px] tracking-[0.16em] text-white/70 uppercase">
                          Now playing
                        </p>
                        <p className="mt-0.5 text-sm font-medium">
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

      <section className="mx-auto w-full max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:py-16">
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
                <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
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
