import { BannerSlider } from "@/components/home/banner-slider";
import type { BannerSlide } from "@/lib/home-banners";

export function OfferBanner({ banners }: { banners: BannerSlide[] }) {
  return (
    <BannerSlider banners={banners} label="Offers" variant="desktop" />
  );
}
