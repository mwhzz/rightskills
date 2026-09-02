export type HomeBanner = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  from: string;
  to: string;
  image: string;
};

export const defaultHomeBanners: HomeBanner[] = [
  {
    id: "offer-start",
    badge: "Offer",
    title: "Start this week with one focused course",
    subtitle:
      "Pay by bKash or Nagad. Lessons unlock after we confirm the TrxID — not before.",
    cta: "Browse courses",
    href: "/courses",
    from: "#ea580c",
    to: "#7c2d12",
    image: "/brands/saffron.jpg",
  },
  {
    id: "web-path",
    badge: "Featured",
    title: "Full-Stack Web with Next.js",
    subtitle:
      "A short path from first layout to a site you can actually show a client.",
    cta: "View course",
    href: "/courses/fullstack-web-nextjs",
    from: "#c2410c",
    to: "#1c1917",
    image: "/brands/lumen.jpg",
  },
  {
    id: "english",
    badge: "Language",
    title: "Spoken English for work",
    subtitle:
      "Short lessons you can finish after office — then use in the next meeting.",
    cta: "See the path",
    href: "/courses/spoken-english-job",
    from: "#9a3412",
    to: "#431407",
    image: "/instructors/shaila.jpg",
  },
];

export function parseHomeBanners(raw: string | null | undefined): HomeBanner[] {
  if (!raw || !raw.trim() || raw.trim() === "[]") return defaultHomeBanners;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return defaultHomeBanners;
    const banners = parsed
      .map((item, index) => normalizeBanner(item, index))
      .filter((item): item is HomeBanner => item !== null);
    return banners.length > 0 ? banners : defaultHomeBanners;
  } catch {
    return defaultHomeBanners;
  }
}

function normalizeBanner(item: unknown, index: number): HomeBanner | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const title = String(row.title ?? "").trim();
  const href = String(row.href ?? "").trim();
  if (!title || !href) return null;
  const image = String(row.image ?? "").trim();
  return {
    id: String(row.id ?? `banner-${index}`),
    badge: String(row.badge ?? "Offer").trim() || "Offer",
    title,
    subtitle: String(row.subtitle ?? "").trim(),
    cta: String(row.cta ?? "Learn more").trim() || "Learn more",
    href,
    from: String(row.from ?? "#ea580c"),
    to: String(row.to ?? "#7c2d12"),
    image:
      image.startsWith("/") || image.startsWith("https://") ? image : "",
  };
}
