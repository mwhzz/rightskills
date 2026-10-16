import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { instructorSlug } from "@/lib/instructors";
import { getSettings } from "@/lib/queries";
import { pageUrl, parseCourseSeo, parsePageSeo, SEO_PAGES } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const settings = await getSettings().catch(() => null);
  const saved = parsePageSeo(settings?.pageSeo);
  const entries: MetadataRoute.Sitemap = [];

  for (const page of SEO_PAGES) {
    const index = saved[page.key]?.index ?? page.index;
    if (!index) continue;
    entries.push({
      url: pageUrl(page.path),
      lastModified: now,
      changeFrequency: page.key === "home" ? "daily" : "weekly",
      priority: page.key === "home" ? 1 : page.key === "courses" ? 0.9 : 0.6,
    });
  }

  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true, seoExtra: true, instructorName: true },
  });
  const instructors = new Set<string>();
  for (const course of courses) {
    const slug = instructorSlug(course.instructorName);
    if (slug) instructors.add(slug);
    if (!parseCourseSeo(course.seoExtra).index) continue;
    entries.push({
      url: pageUrl(`/courses/${course.slug}`),
      lastModified: course.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const slug of instructors) {
    entries.push({
      url: pageUrl(`/instructors/${slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return entries;
}
