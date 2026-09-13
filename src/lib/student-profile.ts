import { normalizePhone } from "@/lib/auth";

export const GENDERS = ["", "male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export type StudentProfileFields = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  profession: string;
  district: string;
  address: string;
  gender: Gender;
  notes: string;
};

function cleanEmail(raw: string): string | null | undefined {
  const email = raw.trim().toLowerCase();
  if (!email) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return null;
  }
  return email;
}

export function parseStudentProfile(
  formData: FormData,
  opts: { requirePhone: boolean; includeNotes: boolean }
): { error: string } | { data: StudentProfileFields } {
  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = phoneRaw ? normalizePhone(phoneRaw) : "";
  const whatsappRaw = String(formData.get("whatsapp") ?? "").trim();
  const whatsapp = whatsappRaw ? normalizePhone(whatsappRaw) : "";
  const email = cleanEmail(String(formData.get("email") ?? ""));
  const profession = String(formData.get("profession") ?? "").trim().slice(0, 80);
  const district = String(formData.get("district") ?? "").trim().slice(0, 80);
  const address = String(formData.get("address") ?? "").trim().slice(0, 400);
  const genderRaw = String(formData.get("gender") ?? "").trim();
  const gender = (GENDERS as readonly string[]).includes(genderRaw)
    ? (genderRaw as Gender)
    : "";
  const notes = opts.includeNotes
    ? String(formData.get("notes") ?? "").trim().slice(0, 2000)
    : "";

  if (name.length < 2) return { error: "name" };
  if (opts.requirePhone && !phone) return { error: "phone" };
  if (whatsappRaw && !whatsapp) return { error: "whatsapp" };
  if (email === null) return { error: "email" };

  return {
    data: {
      name,
      phone: phone || "",
      whatsapp: whatsapp || "",
      email: email || null,
      profession,
      district,
      address,
      gender,
      notes,
    },
  };
}
