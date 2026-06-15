"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_service_1 = require("../src/prisma.service");
async function main() {
    const prisma = new prisma_service_1.PrismaService();
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
//# sourceMappingURL=reset-migration.js.map