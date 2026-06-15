"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ Refusing to reset migrations in production.');
        process.exit(1);
    }
    const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=reset-migration.js.map