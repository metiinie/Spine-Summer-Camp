import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: "awol@gmail.com", password: "12345678", role: "ADMIN" },
    { email: "awole@gmail.com", password: "12345678", role: "ADMIN" }
  ];

  for (const u of users) {
    // Delete existing user if it exists
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      await prisma.user.delete({ where: { email: u.email } });
      console.log(`🗑️  Deleted existing user: ${existing.email}`);
    }

    // Create new user with hashed password
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        role: u.role as any,
      },
    });

    console.log(`✅ User created! Email: ${u.email}, Password: ${u.password}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
