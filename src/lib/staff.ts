import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const STAFF_KEYS = [
  "full",
  "orders",
  "courses",
  "students",
  "reviews",
  "banners",
  "offers",
  "settings",
  "users",
] as const;

export type StaffKey = (typeof STAFF_KEYS)[number];

export const STAFF_LABELS: Record<StaffKey, string> = {
  full: "Full access",
  orders: "Orders",
  courses: "Courses",
  students: "Students",
  reviews: "Reviews",
  banners: "Banners",
  offers: "Offers",
  settings: "Settings",
  users: "Staff & users",
};

export function parseAccess(raw: string | null | undefined): Set<StaffKey> {
  if (!raw || raw === "full") return new Set(["full"]);
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set(["full"]);
    const keys = parsed.filter((item): item is StaffKey =>
      STAFF_KEYS.includes(item as StaffKey)
    );
    if (keys.includes("full") || keys.length === 0) return new Set(["full"]);
    return new Set(keys);
  } catch {
    return new Set(["full"]);
  }
}

export function serializeAccess(keys: StaffKey[]) {
  if (keys.includes("full") || keys.length === 0) return JSON.stringify(["full"]);
  return JSON.stringify(STAFF_KEYS.filter((key) => key !== "full" && keys.includes(key)));
}

export function can(access: Set<StaffKey>, key: StaffKey) {
  return access.has("full") || access.has(key);
}

export type StaffSession = {
  id: string;
  phone: string;
  name: string;
  role: Role;
  access: Set<StaffKey>;
  isFull: boolean;
  isTeacher: boolean;
};

export async function getStaffSession(): Promise<StaffSession> {
  const user = await getSession();
  if (!user) redirect("/login?next=/admin");
  if (user.role === "teacher") {
    return {
      ...user,
      access: new Set(["courses", "reviews"]),
      isFull: false,
      isTeacher: true,
    };
  }
  if (user.role !== "admin") redirect("/");
  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { staffAccess: true },
  });
  const access = parseAccess(row?.staffAccess);
  return {
    ...user,
    access,
    isFull: access.has("full"),
    isTeacher: false,
  };
}

export async function requireAccess(...needed: StaffKey[]) {
  const staff = await getStaffSession();
  if (needed.some((key) => can(staff.access, key))) return staff;
  redirect("/admin");
}
