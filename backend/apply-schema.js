const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Creating PackageType enum...");
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "PackageType" AS ENUM ('FULL_PACKAGE_FULL_DAY', 'FULL_PACKAGE_HALF_DAY', 'MIXED_PACKAGE', 'SELF_PACKAGE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("Creating MainActivity enum...");
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "MainActivity" AS ENUM ('FOOTBALL', 'SWIMMING', 'CYCLING', 'CULTURAL_DANCE', 'KARATE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("Adding packageType to Registration...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "packageType" "PackageType";
    `);

    console.log("Adding selectedActivities to Registration...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "selectedActivities" "MainActivity"[] DEFAULT ARRAY[]::"MainActivity"[];
    `);

    console.log("Creating indexes...");
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Registration_packageType_idx" ON "Registration"("packageType");
    `);

    console.log("Schema changes applied successfully!");
  } catch (error) {
    console.error("Error applying schema changes:", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
