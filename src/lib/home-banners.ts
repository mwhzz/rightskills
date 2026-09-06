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

const defaultSlide = (
  id: string,
  image: string,
  href: string,
  durationSec = 5
): HomeBanner => ({ id, image, href, durationSec });

export const defaultHomeBanners: HomeBannerSet = {
  desktop: [
    defaultSlide("desk-1", "/brands/saffron.jpg", "/courses"),
    defaultSlide("desk-2", "/brands/lumen.jpg", "/courses/fullstack-web-nextjs"),
    defaultSlide("desk-3", "/instructors/shaila.jpg", "/courses"),
  ],
  mobile: [
    defaultSlide("mob-1", "/brands/saffron.jpg", "/courses"),
    defaultSlide("mob-2", "/brands/lumen.jpg", "/courses/fullstack-web-nextjs"),
    defaultSlide("mob-3", "/instructors/shaila.jpg", "/courses"),
  ],
};

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
      const list = parsed
        .map((item, index) => normalizeBanner(item, `legacy-${index}`))
        .filter((item): item is HomeBanner => item !== null);
      if (list.length === 0) return defaultHomeBanners;
      return { desktop: list, mobile: list };
    }
    if (!parsed || typeof parsed !== "object") return defaultHomeBanners;
    const row = parsed as Record<string, unknown>;
    const desktop = listFrom(row.desktop, "desk");
    const mobile = listFrom(row.mobile, "mob");
    if (desktop.length === 0 && mobile.length === 0) return defaultHomeBanners;
    return {
      desktop: desktop.length ? desktop : mobile,
      mobile: mobile.length ? mobile : desktop,
    };
  } catch {
    return defaultHomeBanners;
  }
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
