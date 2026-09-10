export const categories = [
  { id: "development", label: "Development", bangla: "ডেভেলপমেন্ট" },
  { id: "design", label: "Design", bangla: "ডিজাইন" },
  { id: "marketing", label: "Marketing", bangla: "মার্কেটিং" },
  { id: "language", label: "Language", bangla: "ভাষা" },
  { id: "career", label: "Career", bangla: "ক্যারিয়ার" },
  { id: "office", label: "Office", bangla: "অফিস স্কিল" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
export type Level = "Beginner" | "Intermediate" | "Advanced";
export type CourseLanguage = "Bangla" | "English" | "Bangla + English";

export type LessonResourceFile = {
  id: string;
  name: string;
  sizeBytes: number;
};

export type Lesson = {
  id: string;
  title: string;
  durationMin: number;
  preview?: boolean;
  body: string;
  videoPath?: string | null;
  videoUrl?: string | null;
  resources?: LessonResourceFile[];
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  slug: string;
  title: string;
  banglaTitle: string;
  subtitle: string;
  description: string;
  category: CategoryId;
  level: Level | "";
  language: CourseLanguage;
  priceBdt: number;
  originalPriceBdt?: number;
  purchaseNote?: string;
  promoVideoUrl?: string;
  rating: number;
  reviewCount: number;
  students: number;
  featured?: boolean;
  outcomes: string[];
  includes?: string[];
  modules: Module[];
  instructor: {
    name: string;
    title: string;
    bio: string;
    initials: string;
    photo?: string;
  };
  cover: {
    from: string;
    to: string;
    pattern: "grid" | "dots" | "waves";
    image?: string;
  };
};

export const DEFAULT_PURCHASE_NOTE =
  "One-time payment. Add to cart without an account — you log in when you place the order. The course unlocks after we confirm your TrxID.";

export function courseHours(course: Course) {
  const minutes = course.modules
    .flatMap((module) => module.lessons)
    .reduce((sum, lessonItem) => sum + lessonItem.durationMin, 0);
  return Math.max(1, Math.round((minutes / 60) * 10) / 10);
}

export function lessonCount(course: Course) {
  return course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

export function defaultCourseIncludes(course: Course) {
  return [
    `${courseHours(course)} hours of on-demand video`,
    `${lessonCount(course)} lectures you can watch at your pace`,
    `Taught in ${course.language}`,
    "Assignments that look like real work",
    "Lifetime access on your account",
    "Watch on desktop or phone",
  ];
}

export function courseIncludes(course: Course) {
  const custom = (course.includes ?? []).map((item) => item.trim()).filter(Boolean);
  return custom.length > 0 ? custom : defaultCourseIncludes(course);
}

export function categoryLabel(id: CategoryId) {
  return categories.find((category) => category.id === id)?.label ?? id;
}

export const levels: Level[] = ["Beginner", "Intermediate", "Advanced"];

export function levelLabel(level: string) {
  if (level === "Beginner") return "Entry";
  if (level === "Intermediate") return "Intermediate";
  if (level === "Advanced") return "Advanced";
  return "";
}

export function parseLevel(value: string | null | undefined): Level | "" {
  if (value === "Beginner" || value === "Intermediate" || value === "Advanced") {
    return value;
  }
  return "";
}
export const courseLanguages: CourseLanguage[] = [
  "English",
  "Bangla",
  "Bangla + English",
];
export const coverPatterns = ["grid", "dots", "waves"] as const;
