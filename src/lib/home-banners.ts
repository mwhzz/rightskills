export type HomeBanner = {
  id: string;
  image: string;
  href: string;
  durationSec: number;
};

export type HomeBannerSet = {
  desktop: HomeBanner[];
  mobile: HomeBanner[];
};

export const BANNER_RECOMMENDED = {
  desktop: { width: 1920, height: 480, label: "1920 × 480 px" },
  mobile: { width: 1080, height: 608, label: "1080 × 608 px" },
} as const;

export const bannerFrameClass = {
  desktop: "aspect-[4/1]",
  mobile: "aspect-[16/9]",
} as const;

export const defaultHomeBanners: HomeBannerSet = {
  desktop: [],
  mobile: [],
};

export function isStockBanner(image: string) {
  const path = image.trim();
  return (
    path.startsWith("/brands/") ||
    path.startsWith("/instructors/")
  );
}

export function bannersForViewport(
  banners: HomeBannerSet,
  device: "desktop" | "mobile"
) {
  if (device === "desktop") return banners.desktop;
  const customMobile = banners.mobile.filter((item) => !isStockBanner(item.image));
  if (customMobile.length) return customMobile;
  const customDesktop = banners.desktop.filter(
    (item) => !isStockBanner(item.image)
  );
  if (customDesktop.length) return customDesktop;
  return banners.mobile.length ? banners.mobile : banners.desktop;
}

export function bannerImageSrc(image: string) {
  const path = image.trim();
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("https://")) return path;
  return `/api/media/${path}`;
}

export function clampBannerDuration(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.min(30, Math.max(2, Math.round(n)));
}

export function parseHomeBanners(raw: string | null | undefined): HomeBannerSet {
  if (!raw || !raw.trim() || raw.trim() === "[]") return defaultHomeBanners;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const list = withoutStock(
        parsed
          .map((item, index) => normalizeBanner(item, `legacy-${index}`))
          .filter((item): item is HomeBanner => item !== null)
      );
      if (list.length === 0) return defaultHomeBanners;
      return { desktop: list, mobile: list };
    }
    if (!parsed || typeof parsed !== "object") return defaultHomeBanners;
    const row = parsed as Record<string, unknown>;
    const desktop = withoutStock(listFrom(row.desktop, "desk"));
    const mobile = withoutStock(listFrom(row.mobile, "mob"));
    if (desktop.length === 0 && mobile.length === 0) return defaultHomeBanners;
    return {
      desktop: desktop.length ? desktop : mobile,
      mobile: mobile.length ? mobile : desktop,
    };
  } catch {
    return defaultHomeBanners;
  }
}

function withoutStock(list: HomeBanner[]) {
  return list.filter((item) => !isStockBanner(item.image));
}

function listFrom(value: unknown, prefix: string) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizeBanner(item, `${prefix}-${index}`))
    .filter((item): item is HomeBanner => item !== null);
}

function normalizeBanner(item: unknown, fallbackId: string): HomeBanner | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const image = sanitizeBannerImage(String(row.image ?? ""));
  if (!image) return null;
  const hrefRaw = String(row.href ?? "").trim();
  const href =
    hrefRaw.startsWith("/") || hrefRaw.startsWith("https://") ? hrefRaw : "";
  return {
    id: String(row.id ?? fallbackId).slice(0, 40),
    image,
    href,
    durationSec: clampBannerDuration(row.durationSec),
  };
}

export function sanitizeBannerImage(value: string) {
  const image = value.trim();
  if (
    image.startsWith("/") ||
    image.startsWith("https://") ||
    image.startsWith("banners/")
  ) {
    return image.slice(0, 240);
  }
  return "";
}
