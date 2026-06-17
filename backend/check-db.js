const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const res = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name = 'Registration'");
  console.log(res);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
