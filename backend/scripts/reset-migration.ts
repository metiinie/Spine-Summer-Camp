import { PrismaClient } from '@prisma/client';

/**
 * One-off script to reset Prisma migration history.
 * Use only during development — never in production.
 *
 * Usage: npx ts-node scripts/reset-migration.ts
 */
async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Refusing to reset migrations in production.');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  await prisma.$connect();
  console.log('Dropping _prisma_migrations table...');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;');
  await prisma.$disconnect();
  console.log('Reset complete. You can now run `npx prisma migrate dev --name init`.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
