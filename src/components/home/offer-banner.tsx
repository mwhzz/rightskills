import { BannerSlider } from "@/components/home/banner-slider";
import type { HomeBanner } from "@/lib/home-banners";

export function OfferBanner({ banners }: { banners: HomeBanner[] }) {
  return (
    <BannerSlider banners={banners} label="Offers" variant="desktop" />
  );
}
