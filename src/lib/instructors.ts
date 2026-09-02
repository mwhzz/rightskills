import { instructorPhotos } from "@/lib/instructor-photos";
import type { Course } from "@/lib/courses";

export function instructorSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type InstructorProfile = {
  slug: string;
  name: string;
  title: string;
  bio: string;
  initials: string;
  photo?: string;
  courses: Course[];
};

export function buildInstructors(courseList: Course[]): InstructorProfile[] {
  const map = new Map<string, InstructorProfile>();

  for (const course of courseList) {
    const slug = instructorSlug(course.instructor.name);
    const existing = map.get(slug);
    if (existing) {
      existing.courses.push(course);
      continue;
    }
    map.set(slug, {
      slug,
      name: course.instructor.name,
      title: course.instructor.title,
      bio: course.instructor.bio,
      initials: course.instructor.initials,
      photo: instructorPhotos[course.instructor.name],
      courses: [course],
    });
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getInstructorBySlug(slug: string, courseList: Course[]) {
  return buildInstructors(courseList).find((item) => item.slug === slug) ?? null;
}
