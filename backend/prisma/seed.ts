import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: "admin@spinecamp.com", password: "Admin@2026", role: "ADMIN" },
    { email: "awol@gmail.com", password: "12345678", role: "ADMIN" }
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`✅ User already exists: ${existing.email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        role: u.role,
      },
    });

    console.log(`✅ User created! Email: ${u.email}, Password: ${u.password}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
