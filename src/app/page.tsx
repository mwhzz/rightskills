import { ContinueStrip } from "@/components/home/continue-strip";
import { CourseRail } from "@/components/home/course-rail";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeHero } from "@/components/home/home-hero";
import { Instructors } from "@/components/home/instructors";
import { OfferRail } from "@/components/home/offer-rail";
import { Reviews } from "@/components/home/reviews";
import { getSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import {
  getHomepageLearning,
  getHomeBanners,
  getHomeOffers,
  listFeaturedCourses,
  listNewestCourses,
  listPopularCourses,
  listPublishedCourses,
} from "@/lib/queries";
import { defaultHomeBanners } from "@/lib/home-banners";
import { defaultHomeOffers } from "@/lib/home-offers";
import { buildInstructors } from "@/lib/instructors";

export const dynamic = "force-dynamic";

async function loadHome() {
  try {
    const [featured, newest, popular, published] = await Promise.all([
      listFeaturedCourses(3),
      listNewestCourses(3),
      listPopularCourses(3),
      listPublishedCourses(),
    ]);
    return { featured, newest, popular, published };
  } catch {
    return { featured: [], newest: [], popular: [], published: [] };
  }
}

export default async function HomePage() {
  const session = await getSession();
  const [{ featured, newest, popular, published }, learning, banners, offers, dict] =
    await Promise.all([
      loadHome(),
      session ? getHomepageLearning(session.id).catch(() => null) : null,
      getHomeBanners().catch(() => defaultHomeBanners),
      getHomeOffers().catch(() => defaultHomeOffers),
      getDictionary(),
    ]);

  const ownedSlugs = learning?.ownedSlugs;
  const progressBySlug = learning?.progressBySlug;
  const instructors = buildInstructors(published);
  const hasRails =
    featured.length > 0 || newest.length > 0 || popular.length > 0;

  return (
    <div className="overflow-x-hidden">
      <HomeHero banners={banners} />

      <OfferRail row={offers} />

      {learning ? <ContinueStrip learning={learning} /> : null}

      {hasRails ? (
        <section className="mx-auto w-full max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:py-16">
          <CourseRail
            title={dict.home.topPicksTitle}
            description={dict.home.topPicksDescription}
            href="/courses"
            courses={featured}
            ownedSlugs={ownedSlugs}
            progressBySlug={progressBySlug}
          />
          <CourseRail
            title={dict.home.justAddedTitle}
            description={dict.home.justAddedDescription}
            href="/courses"
            courses={newest}
            ownedSlugs={ownedSlugs}
            progressBySlug={progressBySlug}
          />
          <CourseRail
            title={dict.home.popularTitle}
            description={dict.home.popularDescription}
            href="/courses"
            courses={popular}
            ownedSlugs={ownedSlugs}
            progressBySlug={progressBySlug}
          />
        </section>
      ) : null}

      <Instructors people={instructors} />

      <Reviews />

      <HomeFaq />
    </div>
  );
}
