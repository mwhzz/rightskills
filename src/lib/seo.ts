import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const SITE_ORIGIN = "https://rightskillsbangladesh.com";

export const SEO_PAGES = [
  {
    key: "home",
    path: "/",
    label: "Home",
    title: brand.name,
    description: brand.description,
    index: true,
  },
  {
    key: "courses",
    path: "/courses",
    label: "Courses",
    title: "Courses",
    description:
      "Browse Right Skills Bangladesh courses — web development, design, English, Excel, marketing, and career skills.",
    index: true,
  },
  {
    key: "instructors",
    path: "/instructors",
    label: "Instructors",
    title: "Instructors",
    description: "Meet the practitioners who teach at Right Skills Bangladesh.",
    index: true,
  },
  {
    key: "books",
    path: "/brands",
    label: "Books",
    title: "Books",
    description: "Books from Right Skills Bangladesh.",
    index: true,
  },
  {
    key: "login",
    path: "/login",
    label: "Log in",
    title: "Log in",
    description: "Log in to Right Skills Bangladesh.",
    index: false,
  },
  {
    key: "register",
    path: "/register",
    label: "Create account",
    title: "Create account",
    description: "Create a Right Skills Bangladesh account.",
    index: false,
  },
  {
    key: "cart",
    path: "/cart",
    label: "Cart",
    title: "Cart",
    description: "Your Right Skills Bangladesh cart.",
    index: false,
  },
  {
    key: "checkout",
    path: "/checkout",
    label: "Checkout",
    title: "Checkout",
    description: "Pay for your Right Skills Bangladesh courses with bKash or Nagad.",
    index: false,
  },
] as const;

export type SeoPageKey = (typeof SEO_PAGES)[number]["key"];

export type PageSeo = {
  title: string;
  description: string;
  canonical: string;
  index: boolean;
};

export type SiteSeo = {
  googleVerification: string;
};

export type CourseSeoExtra = {
  canonical: string;
  index: boolean;
};

export function pageUrl(path: string) {
  if (!path || path === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function cleanCanonical(raw: string) {
  const value = raw.trim().slice(0, 300);
  if (!value) return "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function absoluteUrl(value: string) {
  const canonical = cleanCanonical(value);
  if (!canonical) return "";
  if (canonical.startsWith("/")) return `${SITE_ORIGIN}${canonical}`;
  return canonical;
}

export function cleanVerification(raw: string) {
  return raw.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
}

export function formFlag(formData: FormData, name: string, fallback: boolean) {
  const values = formData.getAll(name).map((value) => String(value));
  if (values.length === 0) return fallback;
  return values.includes("1");
}

function readObject(raw: string | null | undefined) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function parsePageSeo(raw: string | null | undefined): Partial<Record<SeoPageKey, PageSeo>> {
  const parsed = readObject(raw);
  if (!parsed) return {};
  const result: Partial<Record<SeoPageKey, PageSeo>> = {};
  for (const page of SEO_PAGES) {
    const row = parsed[page.key];
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const description = typeof record.description === "string" ? record.description.trim() : "";
    const canonical = typeof record.canonical === "string" ? cleanCanonical(record.canonical) : "";
    const index = typeof record.index === "boolean" ? record.index : page.index;
    result[page.key] = { title, description, canonical, index };
  }
  return result;
}

export function parseSiteSeo(raw: string | null | undefined): SiteSeo {
  const parsed = readObject(raw);
  const site = parsed?.site;
  if (!site || typeof site !== "object") return { googleVerification: "" };
  const record = site as Record<string, unknown>;
  return {
    googleVerification:
      typeof record.googleVerification === "string"
        ? cleanVerification(record.googleVerification)
        : "",
  };
}

export function parseCourseSeo(raw: string | null | undefined): CourseSeoExtra {
  const parsed = readObject(raw);
  if (!parsed) return { canonical: "", index: true };
  return {
    canonical: typeof parsed.canonical === "string" ? cleanCanonical(parsed.canonical) : "",
    index: typeof parsed.index === "boolean" ? parsed.index : true,
  };
}

export function metadataFrom(input: {
  title: string;
  description: string;
  path: string;
  canonical?: string;
  index: boolean;
  exact?: boolean;
}): Metadata {
  const canonical = absoluteUrl(input.canonical || "") || pageUrl(input.path);
  const exact = input.exact !== false;
  const image = {
    url: `${SITE_ORIGIN}/og-image?title=${encodeURIComponent(input.title)}`,
    width: 1200,
    height: 630,
    alt: input.title,
  };
  return {
    title: exact ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical },
    robots: {
      index: input.index,
      follow: true,
      googleBot: { index: input.index, follow: true },
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: brand.name,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image.url],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    name: brand.name,
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/logo-mark.png`,
    description: brand.description,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "WebSite",
        name: brand.name,
        url: `${SITE_ORIGIN}/`,
        description: brand.description,
        publisher: { "@type": "Organization", name: brand.name, url: SITE_ORIGIN },
      },
    ],
  };
}

export function courseJsonLd(course: {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
}) {
  const description = course.description.replace(/\s+/g, " ").trim() || course.subtitle;
  const image = course.image ? absoluteUrl(course.image) || undefined : undefined;
  const url = pageUrl(`/courses/${course.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: course.title,
        description: description.slice(0, 5000),
        url,
        provider: {
          "@type": "Organization",
          name: brand.name,
          sameAs: SITE_ORIGIN,
        },
        ...(image ? { image } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Courses", item: pageUrl("/courses") },
          { "@type": "ListItem", position: 3, name: course.title, item: url },
        ],
      },
    ],
  };
}
