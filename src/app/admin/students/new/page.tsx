import Link from "next/link";
import { requireAccess } from "@/lib/staff";
import { prisma } from "@/lib/db";
import { StudentProfileForm } from "@/components/admin/student-profile-form";

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAccess("students");
  const { error } = await searchParams;
  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin/students" className="hover:text-foreground">
          Students
        </Link>
        <span className="mx-2">/</span>
        New
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
        Add student
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Use this after a WhatsApp order. Save the profile, then unlock the
        course when payment matches.
      </p>
      <div className="mt-8">
        <StudentProfileForm courses={courses} error={error} />
      </div>
    </div>
  );
}
