import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@spinecamp.com";
  const password = "Admin@2026";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("✅ Admin user already exists:", existing.email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created!");
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${password}`);
  console.log("   ⚠️  Change this password before going to production!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
