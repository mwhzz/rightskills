import { BannerSlider } from "@/components/home/banner-slider";
import {
  bannerImageSrc,
  bannersForViewport,
  type HomeBannerSet,
} from "@/lib/home-banners";

export function HomeHero({ banners }: { banners: HomeBannerSet }) {
  const mobile = bannersForViewport(banners, "mobile");
  const desktop = bannersForViewport(banners, "desktop");
  if (mobile.length === 0 && desktop.length === 0) return null;

  const firstDesktop = desktop[0] ? bannerImageSrc(desktop[0].image) : "";
  const firstMobile = mobile[0] ? bannerImageSrc(mobile[0].image) : "";

  return (
    <div className="bg-[linear-gradient(180deg,#fffaf5_0%,#fff7f0_100%)] px-4 pt-4 pb-2 sm:px-6 sm:pt-5">
      {firstDesktop ? (
        <link
          rel="preload"
          as="image"
          href={firstDesktop}
          media="(min-width: 768px)"
          fetchPriority="high"
        />
      ) : null}
      {firstMobile && firstMobile !== firstDesktop ? (
        <link
          rel="preload"
          as="image"
          href={firstMobile}
          media="(max-width: 767px)"
          fetchPriority="high"
        />
      ) : null}
      <div className="md:hidden">
        <BannerSlider
          banners={mobile}
          label="Mobile banners"
          variant="mobile"
        />
      </div>
      <div className="hidden md:block">
        <BannerSlider
          banners={desktop}
          label="Desktop banners"
          variant="desktop"
        />
      </div>
    </div>
  );
}
