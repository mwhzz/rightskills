import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import {
  metadataFrom,
  parseCourseSeo,
  parsePageSeo,
  SEO_PAGES,
  type SeoPageKey,
} from "@/lib/seo";

export async function pageMetadata(key: SeoPageKey): Promise<Metadata> {
  const fallback = SEO_PAGES.find((page) => page.key === key)!;
  let title: string = fallback.title;
  let description: string = fallback.description;
  let canonical = "";
  let index = fallback.index;
  try {
    const settings = await getSettings();
    const saved = parsePageSeo(settings.pageSeo)[key];
    if (saved?.title) title = saved.title;
    if (saved?.description) description = saved.description;
    if (saved) {
      canonical = saved.canonical;
      index = saved.index;
    }
  } catch {
    // The public page still renders with the built-in title.
  }
  return metadataFrom({
    title,
    description,
    path: fallback.path,
    canonical,
    index,
  });
}

export function courseMetadata(course: {
  slug: string;
  title: string;
  subtitle: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoExtra?: string | null;
}): Metadata {
  const extra = parseCourseSeo(course.seoExtra);
  const title = course.seoTitle?.trim() || course.title;
  const description = course.seoDescription?.trim() || course.subtitle;
  return metadataFrom({
    title,
    description,
    path: `/courses/${course.slug}`,
    canonical: extra.canonical,
    index: extra.index,
    exact: Boolean(course.seoTitle?.trim()),
  });
}
