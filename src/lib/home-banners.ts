export type BannerSlide = {
  id: string;
  image: string;
  href: string;
  durationSec: number;
};

export type HomeBanner = {
  id: string;
  desktopImage: string;
  mobileImage: string;
  href: string;
  durationSec: number;
  active: boolean;
};

export type HomeBannerSet = HomeBanner[];

export const BANNER_MAX = 12;

export const BANNER_RECOMMENDED = {
  desktop: { width: 1920, height: 480, label: "1920 × 480 px" },
  mobile: { width: 1080, height: 608, label: "1080 × 608 px" },
} as const;

export const bannerFrameClass = {
  desktop: "aspect-[4/1]",
  mobile: "aspect-[16/9]",
} as const;

export const defaultHomeBanners: HomeBannerSet = [];

export function isStockBanner(image: string) {
  const path = image.trim();
  return path.startsWith("/brands/") || path.startsWith("/instructors/");
}

export function bannersForViewport(
  banners: HomeBannerSet,
  device: "desktop" | "mobile"
): BannerSlide[] {
  return banners
    .filter((item) => item.active && !isStockBanner(item.desktopImage))
    .map((item) => {
      const image =
        device === "mobile" && item.mobileImage && !isStockBanner(item.mobileImage)
          ? item.mobileImage
          : item.desktopImage;
      return {
        id: item.id,
        image,
        href: item.href,
        durationSec: item.durationSec,
      };
    })
    .filter((item) => Boolean(item.image) && !isStockBanner(item.image));
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

export function sanitizeBannerHref(value: string) {
  const href = value.trim();
  if (href.startsWith("/") || href.startsWith("https://")) return href.slice(0, 200);
  return "";
}

export function newBannerId() {
  return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.replace(
    /[^a-zA-Z0-9_-]/g,
    ""
  ).slice(0, 40);
}

export function parseHomeBanners(raw: string | null | undefined): HomeBannerSet {
  if (!raw || !raw.trim() || raw.trim() === "[]") return defaultHomeBanners;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const items = extractItems(parsed)
      .map((item, index) => normalizePairedBanner(item, `banner-${index}`))
      .filter((item): item is HomeBanner => item !== null)
      .filter((item) => !isStockBanner(item.desktopImage));
    return items.slice(0, BANNER_MAX);
  } catch {
    return defaultHomeBanners;
  }
}

function extractItems(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== "object") return [];
  const row = parsed as Record<string, unknown>;
  if (Array.isArray(row.items)) return row.items;
  const desktop = Array.isArray(row.desktop) ? row.desktop : [];
  const mobile = Array.isArray(row.mobile) ? row.mobile : [];
  if (desktop.length === 0 && mobile.length === 0) return [];
  const count = Math.max(desktop.length, mobile.length);
  const zipped: unknown[] = [];
  for (let i = 0; i < count; i += 1) {
    const desk = asRecord(desktop[i]);
    const mob = asRecord(mobile[i]);
    const desktopImage = String(desk?.image ?? mob?.image ?? "");
    if (!desktopImage) continue;
    zipped.push({
      id: String(desk?.id ?? mob?.id ?? `banner-${i}`),
      desktopImage,
      mobileImage: String(mob?.image ?? ""),
      href: String(desk?.href ?? mob?.href ?? ""),
      durationSec: desk?.durationSec ?? mob?.durationSec ?? 5,
      active: true,
    });
  }
  return zipped;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function normalizePairedBanner(item: unknown, fallbackId: string): HomeBanner | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const desktopImage = sanitizeBannerImage(
    String(row.desktopImage ?? row.image ?? "")
  );
  if (!desktopImage) return null;
  let mobileImage = sanitizeBannerImage(String(row.mobileImage ?? ""));
  if (mobileImage === desktopImage) mobileImage = "";
  return {
    id: String(row.id ?? fallbackId)
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 40) || fallbackId,
    desktopImage,
    mobileImage,
    href: sanitizeBannerHref(String(row.href ?? "")),
    durationSec: clampBannerDuration(row.durationSec),
    active: row.active !== false,
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
