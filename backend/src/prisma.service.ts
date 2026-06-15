import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Drop the Prisma migrations table to reset migration history.
   * Use with caution – this will erase migration metadata.
   */
  async resetMigrations(): Promise<void> {
    // PostgreSQL uses double quotes for identifiers; Prisma client escapes automatically.
    await this.$executeRawUnsafe('DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;');
    // Optional: Recreate the table by running a fresh migration later.
  }
}
