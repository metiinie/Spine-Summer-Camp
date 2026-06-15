import { defineConfig } from '@prisma/client';

/**
 * Prisma configuration used by the CLI (migrate, generate, etc.).
 * The datasource URL is read from the environment at runtime.
 */
export default defineConfig({
  datasource: {
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL!,
    },
  },
});
