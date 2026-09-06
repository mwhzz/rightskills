import { BannerSlider } from "@/components/home/banner-slider";
import { bannersForViewport, type HomeBannerSet } from "@/lib/home-banners";

export function HomeHero({ banners }: { banners: HomeBannerSet }) {
  return (
    <div className="bg-[linear-gradient(180deg,#fffaf5_0%,#fff7f0_100%)] px-4 pt-4 pb-2 sm:px-6 sm:pt-5">
      <div className="md:hidden">
        <BannerSlider
          banners={bannersForViewport(banners, "mobile")}
          label="Mobile banners"
          variant="mobile"
        />
      </div>
      <div className="hidden md:block">
        <BannerSlider
          banners={bannersForViewport(banners, "desktop")}
          label="Desktop banners"
          variant="desktop"
        />
      </div>
    </div>
  );
}
