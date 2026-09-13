import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAccess } from "@/lib/staff";
import { formatWhen } from "@/lib/format";

export const runtime = "nodejs";

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export async function GET() {
  await requireAccess("students");
  const students = await prisma.user.findMany({
    where: { role: "student" },
    include: {
      enrollments: { include: { course: { select: { title: true } } } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "Name",
    "Phone",
    "WhatsApp",
    "Email",
    "Profession",
    "District",
    "Address",
    "Gender",
    "Notes",
    "Courses",
    "Orders",
    "Joined",
  ];
  const rows = students.map((row) =>
    [
      row.name,
      row.phone,
      row.whatsapp,
      row.email ?? "",
      row.profession,
      row.district,
      row.address,
      row.gender,
      row.notes,
      row.enrollments.map((item) => item.course.title).join("; "),
      row._count.orders,
      formatWhen(row.createdAt),
    ]
      .map(csvCell)
      .join(",")
  );
  const csv = `\uFEFF${[header.join(","), ...rows].join("\r\n")}`;
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="students-${stamp}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
