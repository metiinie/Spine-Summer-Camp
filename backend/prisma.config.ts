import { defineConfig } from '@prisma/client/runtime';

/** Prisma configuration used by the CLI (migrate, generate, etc.). */
export default defineConfig({
  datasource: {
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL!,
    },
  },
});
