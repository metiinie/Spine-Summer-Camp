import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed admin users from environment variables.
 *
 * Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env
 * (and optionally SEED_ADMIN_EMAIL_2 / SEED_ADMIN_PASSWORD_2 for a second admin).
 *
 * In production, the script refuses to run with placeholder passwords.
 */
async function main() {
  const isProduction = process.env.NODE_ENV === "production";

  const admins = [
    {
      email: process.env.SEED_ADMIN_EMAIL || "admin@spinecamp.com",
      password: process.env.SEED_ADMIN_PASSWORD || "changeme-dev-only",
    },
    ...(process.env.SEED_ADMIN_EMAIL_2
      ? [
          {
            email: process.env.SEED_ADMIN_EMAIL_2,
            password: process.env.SEED_ADMIN_PASSWORD_2 || "changeme-dev-only",
          },
        ]
      : []),
  ];

  const PLACEHOLDER_PASSWORDS = ["changeme-dev-only", "12345678", "password"];

  for (const admin of admins) {
    if (isProduction && PLACEHOLDER_PASSWORDS.includes(admin.password)) {
      console.error(
        `❌ Refusing to seed "${admin.email}" with a placeholder password in production.`,
      );
      console.error(
        `   Set SEED_ADMIN_PASSWORD (and SEED_ADMIN_PASSWORD_2) to strong values.`,
      );
      process.exit(1);
    }

    if (admin.password.length < 8) {
      console.error(
        `❌ Password for "${admin.email}" must be at least 8 characters.`,
      );
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(admin.password, 12);

    // Upsert: create if missing, update password hash if exists (non-destructive)
    await prisma.user.upsert({
      where: { email: admin.email },
      update: { passwordHash, role: "ADMIN" },
      create: {
        email: admin.email,
        passwordHash,
        role: "ADMIN",
      },
    });

    console.log(`✅ Admin user ready: ${admin.email}`);
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
