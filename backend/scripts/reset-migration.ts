import { PrismaService } from '../src/prisma.service';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();
  console.log('Dropping _prisma_migrations table...');
  await prisma.resetMigrations();
  await prisma.$disconnect();
  console.log('Reset complete. You can now run `npx prisma migrate dev --name init`.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
