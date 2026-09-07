import type {
  Course as DbCourse,
  Lesson as DbLesson,
  LessonResource,
  Module as DbModule,
} from "@prisma/client";
import {
  type Course,
  type CourseLanguage,
  courseHours,
  lessonCount,
  parseLevel,
} from "@/lib/courses";
import { coverImageSrc } from "@/lib/cover-image";
import { instructorPhotoSrc } from "@/lib/instructor-photos";

export type CourseRecord = DbCourse & {
  modules: (DbModule & {
    lessons: (DbLesson & { resources?: LessonResource[] })[];
  })[];
};

export function mapCourse(row: CourseRecord): Course {
  const pattern = row.coverPattern;
  return {
    slug: row.slug,
    title: row.title,
    banglaTitle: row.banglaTitle,
    subtitle: row.subtitle,
    description: row.description,
    category: row.category as Course["category"],
    level: parseLevel(row.level),
    language: row.language as CourseLanguage,
    priceBdt: row.priceBdt,
    originalPriceBdt: row.originalPriceBdt ?? undefined,
    purchaseNote: row.purchaseNote?.trim() || undefined,
    rating: row.rating,
    reviewCount: row.reviewCount,
    students: row.students,
    featured: row.featured,
    outcomes: Array.isArray(row.outcomes) ? (row.outcomes as string[]) : [],
    includes: Array.isArray(row.includes) ? (row.includes as string[]) : [],
    instructor: {
      name: row.instructorName,
      title: row.instructorTitle,
      bio: row.instructorBio,
      initials: row.instructorInitials,
      photo: instructorPhotoSrc(row.instructorPhoto),
    },
    cover: {
      from: row.coverFrom,
      to: row.coverTo,
      pattern:
        pattern === "dots" || pattern === "waves" || pattern === "grid"
          ? pattern
          : "grid",
      image: coverImageSrc(row.coverImage) || undefined,
    },
    modules: row.modules
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((module) => ({
        id: module.id,
        title: module.title,
        lessons: module.lessons
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            durationMin: lesson.durationMin,
            preview: lesson.preview,
            body: lesson.body ?? "",
            videoPath: lesson.videoPath,
            resources: (lesson.resources ?? []).map((resource) => ({
              id: resource.id,
              name: resource.name,
              sizeBytes: resource.sizeBytes,
            })),
          })),
      })),
  };
}

export { courseHours, lessonCount };
