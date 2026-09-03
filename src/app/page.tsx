import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BackgroundVideo } from "@/components/home/background-video";
import { BrandPortfolio } from "@/components/home/brand-portfolio";
import { ContinueStrip } from "@/components/home/continue-strip";
import { CourseRail } from "@/components/home/course-rail";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeHero } from "@/components/home/home-hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Instructors } from "@/components/home/instructors";
import { Reveal } from "@/components/home/reveal";
import { Reviews } from "@/components/home/reviews";
import { SkillStrip } from "@/components/home/skill-strip";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { courses as fallbackCourses, getFeaturedCourses } from "@/lib/courses";
import {
  getHomepageLearning,
  listFeaturedCourses,
  listNewestCourses,
  listPopularCourses,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function loadHome() {
  try {
    const [featured, newest, popular] = await Promise.all([
      listFeaturedCourses(3),
      listNewestCourses(3),
      listPopularCourses(3),
    ]);
    return { featured, newest, popular };
  } catch {
    const featured = getFeaturedCourses().slice(0, 3);
    const newest = fallbackCourses.slice(0, 3);
    const popular = [...fallbackCourses]
      .sort((a, b) => b.students - a.students)
      .slice(0, 3);
    return { featured, newest, popular };
  }
}

export default async function HomePage() {
  const session = await getSession();
  const [{ featured, newest, popular }, learning] = await Promise.all([
    loadHome(),
    session ? getHomepageLearning(session.id).catch(() => null) : null,
  ]);

  const ownedSlugs = learning?.ownedSlugs;
  const progressBySlug = learning?.progressBySlug;

  return (
    <div className="overflow-x-hidden">
      <HomeHero />

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
