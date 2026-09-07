import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pin = process.env.ADMIN_PIN || "1234";
  const passwordHash = await bcrypt.hash(pin, 12);

  await prisma.user.upsert({
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

  console.log("Seed complete. Admin phone 01700000000 · PIN 1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
