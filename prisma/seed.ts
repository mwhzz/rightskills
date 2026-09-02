import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { courses } from "../src/lib/courses";

const prisma = new PrismaClient();

async function main() {
  const pin = process.env.ADMIN_PIN || "1234";
  const passwordHash = await bcrypt.hash(pin, 12);

  const admin = await prisma.user.upsert({
    where: { phone: "01700000000" },
    update: { role: Role.admin, passwordHash, name: "Site Admin" },
    create: {
      phone: "01700000000",
      passwordHash,
      name: "Site Admin",
      email: "admin@skillsbangladesh.local",
      role: Role.admin,
    },
  });

  await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      bkashNumber: "01700000000",
      nagadNumber: "01800000000",
      payInstructions:
        "Send Money the exact order total. Put the order ID in the reference. Then open My orders and paste the TrxID.",
      homeBanners: "[]",
    },
  });

  for (const course of courses) {
    const row = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        banglaTitle: course.banglaTitle,
        subtitle: course.subtitle,
        description: course.description,
        category: course.category,
        level: course.level,
        language: course.language,
        priceBdt: course.priceBdt,
        originalPriceBdt: course.originalPriceBdt ?? null,
        rating: course.rating,
        reviewCount: course.reviewCount,
        students: course.students,
        featured: Boolean(course.featured),
        published: true,
        outcomes: course.outcomes,
        instructorName: course.instructor.name,
        instructorTitle: course.instructor.title,
        instructorBio: course.instructor.bio,
        instructorInitials: course.instructor.initials,
        coverFrom: course.cover.from,
        coverTo: course.cover.to,
        coverPattern: course.cover.pattern,
        teacherId: admin.id,
      },
      create: {
        slug: course.slug,
        title: course.title,
        banglaTitle: course.banglaTitle,
        subtitle: course.subtitle,
        description: course.description,
        category: course.category,
        level: course.level,
        language: course.language,
        priceBdt: course.priceBdt,
        originalPriceBdt: course.originalPriceBdt ?? null,
        rating: course.rating,
        reviewCount: course.reviewCount,
        students: course.students,
        featured: Boolean(course.featured),
        published: true,
        outcomes: course.outcomes,
        instructorName: course.instructor.name,
        instructorTitle: course.instructor.title,
        instructorBio: course.instructor.bio,
        instructorInitials: course.instructor.initials,
        coverFrom: course.cover.from,
        coverTo: course.cover.to,
        coverPattern: course.cover.pattern,
        teacherId: admin.id,
      },
    });

    await prisma.module.deleteMany({ where: { courseId: row.id } });

    for (const [moduleIndex, module] of course.modules.entries()) {
      await prisma.module.create({
        data: {
          courseId: row.id,
          title: module.title,
          sortOrder: moduleIndex,
          lessons: {
            create: module.lessons.map((lesson, lessonIndex) => ({
              title: lesson.title,
              durationMin: lesson.durationMin,
              preview: Boolean(lesson.preview),
              body: lesson.body,
              sortOrder: lessonIndex,
            })),
          },
        },
      });
    }
  }

  console.log("Seed complete. Admin phone 01700000000 · PIN 1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
