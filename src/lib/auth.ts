import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";

const COOKIE = "skills-bd-session";

export type SessionUser = {
  id: string;
  phone: string;
  name: string;
  role: Role;
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set (16+ characters).");
    }
    return new TextEncoder().encode("dev-only-session-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let phone = digits;
  if (phone.startsWith("880")) phone = phone.slice(3);
  if (phone.length === 10 && phone.startsWith("1")) phone = `0${phone}`;
  if (/^01[3-9]\d{8}$/.test(phone)) return phone;
  return null;
}

export function normalizePin(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  return /^\d{4}$/.test(digits) ? digits : null;
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    sub: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const id = String(payload.sub ?? "");
    const phone = String(payload.phone ?? "");
    const name = String(payload.name ?? "");
    const role = payload.role as Role;
    if (!id || !phone || !role) return null;
    return { id, phone, name, role };
  } catch {
    return null;
  }
}

export function safeNextPath(next: string | undefined, role?: Role) {
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") && !next.startsWith("/register")) {
    return next;
  }
  if (role === "admin" || role === "teacher") return "/admin";
  return "/account";
}

export async function requireUser(next = "/account") {
  const user = await getSession();
  if (!user) {
    const dest = next.startsWith("/") ? next : "/account";
    redirect(`/login?next=${encodeURIComponent(dest)}`);
  }
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await getSession();
  if (!user) redirect("/login?next=/admin");
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export async function getFreshUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.id } });
}
