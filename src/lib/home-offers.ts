export type OfferShape = "portrait" | "square" | "wide";

export type HomeOffer = {
  id: string;
  image: string;
  href: string;
};

export type HomeOfferRow = {
  title: string;
  shape: OfferShape;
  items: HomeOffer[];
};

export const OFFER_SHAPES: {
  id: OfferShape;
  label: string;
  width: number;
  height: number;
}[] = [
  { id: "portrait", label: "Portrait (3:4)", width: 600, height: 800 },
  { id: "square", label: "Square (1:1)", width: 800, height: 800 },
  { id: "wide", label: "Wide (16:9)", width: 960, height: 540 },
];

export const offerFrameClass: Record<OfferShape, string> = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  wide: "aspect-[16/9]",
};

export const offerCardWidthClass: Record<OfferShape, string> = {
  portrait: "w-[10.5rem] sm:w-[12rem]",
  square: "w-[12rem] sm:w-[13.5rem]",
  wide: "w-[17rem] sm:w-[20rem]",
};

export const OFFER_MAX_ITEMS = 16;

export const defaultHomeOffers: HomeOfferRow = {
  title: "Offers for you",
  shape: "portrait",
  items: [],
};

export function offerShape(value: unknown): OfferShape {
  const shape = String(value ?? "");
  return OFFER_SHAPES.some((item) => item.id === shape)
    ? (shape as OfferShape)
    : "portrait";
}

export function recommendedOfferSize(shape: OfferShape) {
  const match = OFFER_SHAPES.find((item) => item.id === shape) ?? OFFER_SHAPES[0];
  return { ...match, label: `${match.width} × ${match.height} px` };
}

export function offerImageSrc(image: string) {
  const path = image.trim();
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("https://")) return path;
  return `/api/media/${path}`;
}

export function sanitizeOfferImage(value: string) {
  const image = value.trim();
  if (
    image.startsWith("/") ||
    image.startsWith("https://") ||
    image.startsWith("offers/")
  ) {
    return image.slice(0, 240);
  }
  return "";
}

export function sanitizeOfferHref(value: unknown) {
  const href = String(value ?? "").trim();
  return href.startsWith("/") || href.startsWith("https://")
    ? href.slice(0, 200)
    : "";
}

export function parseHomeOffers(raw: string | null | undefined): HomeOfferRow {
  if (!raw || !raw.trim()) return defaultHomeOffers;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return defaultHomeOffers;
    }
    const row = parsed as Record<string, unknown>;
    const title = String(row.title ?? defaultHomeOffers.title).slice(0, 120);
    const items = Array.isArray(row.items)
      ? row.items
          .slice(0, OFFER_MAX_ITEMS)
          .map((item, index) => normalizeOffer(item, `offer-${index}`))
          .filter((item): item is HomeOffer => item !== null)
      : [];
    return { title, shape: offerShape(row.shape), items };
  } catch {
    return defaultHomeOffers;
  }
}

function normalizeOffer(item: unknown, fallbackId: string): HomeOffer | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const image = sanitizeOfferImage(String(row.image ?? ""));
  if (!image) return null;
  return {
    id: String(row.id ?? fallbackId).slice(0, 40),
    image,
    href: sanitizeOfferHref(row.href),
  };
}
